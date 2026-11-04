import "server-only";
import { randomUUID } from "node:crypto";
import { ApiError } from "@/server/api";
import type { SessionUser } from "@/server/auth";
import { getDb, transaction } from "@/server/db";
import { cancelGatewaySubscription, createGatewayPlan, createGatewaySubscription, fetchGatewaySubscription,
  GatewaySubscription, publicCheckoutKey, razorpayConfigured, verifySubscriptionCheckoutSignature } from "@/server/razorpayGateway";

type Term = "monthly" | "annual";
type SubscriptionRow = { id: string; user_id: string; term: Term; price_minor: number; gateway_plan_id: string;
  gateway_subscription_id: string; status: string; paid_count: number; current_end: number | null;
  next_charge_at: number | null; cancel_at_cycle_end: number };
const OPEN = "'created','authenticated','active','pending','halted','paused'";
const GATEWAY_STATES = new Set(["created", "authenticated", "active", "pending", "halted", "paused", "cancelled", "completed", "expired"]);

export function personalPlanCheckoutAvailable(): boolean {
  return process.env.PERSONAL_PLAN_ENABLED === "1" && razorpayConfigured() && process.env.EMAIL_PROVIDER === "resend" &&
    Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim() &&
      process.env.SITE_URL?.startsWith("https://"));
}

export function syncPersonalPlanAccess(userId: string): void {
  const db = getDb();
  if (!db.prepare(`SELECT 1 FROM personal_plan_grants WHERE user_id=? UNION ALL
    SELECT 1 FROM personal_plan_subscriptions WHERE user_id=? AND
    (status IN (${OPEN}) OR (status='cancelled' AND cancel_at_cycle_end=1 AND current_end>?)) LIMIT 1`)
    .get(userId, userId, Math.floor(Date.now() / 1000))) return;
  transaction((db) => {
    const now = Math.floor(Date.now() / 1000);
    const active = db.prepare(`SELECT * FROM personal_plan_subscriptions WHERE user_id=?
      AND (status='active' OR (status='cancelled' AND cancel_at_cycle_end=1))
      AND paid_count>0 AND current_end>? ORDER BY current_end DESC LIMIT 1`).get(userId, now) as SubscriptionRow | undefined;
    const selected = active ? db.prepare(`SELECT c.id FROM personal_plan_courses p JOIN courses c ON c.id=p.course_id
      WHERE c.status='published' AND c.review_status='approved' AND c.price_minor>0`).all().map((row) => String(row.id)) : [];
    const selectedSet = new Set(selected);
    const grants = db.prepare("SELECT course_id FROM personal_plan_grants WHERE user_id=?").all(userId);
    for (const grant of grants) {
      const courseId = String(grant.course_id);
      if (selectedSet.has(courseId)) continue;
      const purchased = db.prepare(`SELECT 1 FROM orders o JOIN order_items i ON i.order_id=o.id
        WHERE o.user_id=? AND i.course_id=? AND o.status='paid' LIMIT 1`).get(userId, courseId);
      const free = db.prepare("SELECT 1 FROM courses WHERE id=? AND price_minor=0").get(courseId);
      if (!purchased && !free) db.prepare("UPDATE enrollments SET status='cancelled' WHERE user_id=? AND course_id=?")
        .run(userId, courseId);
      db.prepare("DELETE FROM personal_plan_grants WHERE user_id=? AND course_id=?").run(userId, courseId);
    }
    if (!active) return;
    for (const courseId of selected) {
      const existing = db.prepare("SELECT status FROM enrollments WHERE user_id=? AND course_id=?").get(userId, courseId);
      const grant = db.prepare("SELECT 1 FROM personal_plan_grants WHERE user_id=? AND course_id=?").get(userId, courseId);
      if (existing && !grant && existing.status !== "cancelled") continue;
      if (!existing) db.prepare("INSERT INTO enrollments(id,user_id,course_id) VALUES (?,?,?)").run(randomUUID(), userId, courseId);
      else if (existing.status === "cancelled") db.prepare("UPDATE enrollments SET status='active' WHERE user_id=? AND course_id=?")
        .run(userId, courseId);
      db.prepare("INSERT OR IGNORE INTO personal_plan_grants(user_id,course_id,subscription_id) VALUES (?,?,?)")
        .run(userId, courseId, active.id);
    }
  });
}

function subscriptionDto(row: SubscriptionRow) {
  return { id: row.id, term: row.term, priceMinor: Number(row.price_minor), status: row.status,
    currentEnd: row.current_end, nextChargeAt: row.next_charge_at, cancelAtCycleEnd: Boolean(row.cancel_at_cycle_end) };
}

export function getOwnPersonalPlan(user: SessionUser) {
  const row = getDb().prepare(`SELECT * FROM personal_plan_subscriptions WHERE user_id=? ORDER BY created_at DESC LIMIT 1`)
    .get(user.id) as SubscriptionRow | undefined;
  return row ? subscriptionDto(row) : null;
}

async function gatewayPlan(term: Term, priceMinor: number): Promise<string> {
  const db = getDb();
  const existing = db.prepare("SELECT gateway_plan_id FROM personal_plan_gateway_plans WHERE term=? AND price_minor=?")
    .get(term, priceMinor);
  if (existing) return String(existing.gateway_plan_id);
  const created = await createGatewayPlan(term, priceMinor);
  db.prepare("INSERT OR IGNORE INTO personal_plan_gateway_plans(term,price_minor,gateway_plan_id) VALUES (?,?,?)")
    .run(term, priceMinor, created);
  return String(db.prepare("SELECT gateway_plan_id FROM personal_plan_gateway_plans WHERE term=? AND price_minor=?")
    .get(term, priceMinor)!.gateway_plan_id);
}

export async function startPersonalPlan(user: SessionUser, term: Term) {
  if (user.role !== "learner") throw new ApiError(403, "LEARNER_REQUIRED", "Personal Plan is available to learner accounts.");
  if (!personalPlanCheckoutAvailable()) throw new ApiError(503, "PLAN_CHECKOUT_UNAVAILABLE", "Subscriptions are not ready. No payment was made.");
  const db = getDb();
  const settings = db.prepare("SELECT monthly_price_minor,annual_price_minor FROM personal_plan_settings WHERE id=1").get();
  const priceMinor = Number(term === "monthly" ? settings?.monthly_price_minor : settings?.annual_price_minor);
  if (!Number.isSafeInteger(priceMinor) || priceMinor < 100) throw new ApiError(409, "PLAN_PRICE_UNSET", "This plan price is not set.");
  if (!db.prepare(`SELECT 1 FROM personal_plan_courses p JOIN courses c ON c.id=p.course_id
    WHERE c.status='published' AND c.review_status='approved' LIMIT 1`).get())
    throw new ApiError(409, "PLAN_EMPTY", "No published courses are selected for this plan.");
  const open = db.prepare(`SELECT * FROM personal_plan_subscriptions WHERE user_id=? AND
    (status IN (${OPEN}) OR (status='cancelled' AND cancel_at_cycle_end=1 AND current_end>?))`)
    .get(user.id, Math.floor(Date.now() / 1000)) as SubscriptionRow | undefined;
  if (open) {
    if (open.status === "created" && open.term === term && open.price_minor === priceMinor)
      return { ...subscriptionDto(open), gatewaySubscriptionId: open.gateway_subscription_id, keyId: publicCheckoutKey() };
    throw new ApiError(409, "SUBSCRIPTION_EXISTS", "You already have a Personal Plan subscription or pending checkout. Review it before starting another.");
  }
  const planId = await gatewayPlan(term, priceMinor);
  const id = randomUUID();
  const gateway = await createGatewaySubscription(planId, term, id);
  const row = transaction((database) => {
    const current = database.prepare(`SELECT * FROM personal_plan_subscriptions WHERE user_id=? AND
      (status IN (${OPEN}) OR (status='cancelled' AND cancel_at_cycle_end=1 AND current_end>?))`)
      .get(user.id, Math.floor(Date.now() / 1000)) as SubscriptionRow | undefined;
    if (current) return current;
    database.prepare(`INSERT INTO personal_plan_subscriptions
      (id,user_id,term,price_minor,gateway_plan_id,gateway_subscription_id,status)
      VALUES (?,?,?,?,?,?,?)`).run(id, user.id, term, priceMinor, planId, gateway.id, gateway.status);
    return database.prepare("SELECT * FROM personal_plan_subscriptions WHERE id=?").get(id) as SubscriptionRow;
  });
  if (row.id !== id) throw new ApiError(409, "CHECKOUT_RETRY_REQUIRED", "Another checkout was created. Review your subscription before continuing.");
  return { ...subscriptionDto(row), gatewaySubscriptionId: row.gateway_subscription_id, keyId: publicCheckoutKey() };
}

function applyGatewayState(row: SubscriptionRow, gateway: GatewaySubscription, paymentId?: string) {
  if (gateway.id !== row.gateway_subscription_id || gateway.planId !== row.gateway_plan_id ||
    gateway.totalCount !== (row.term === "monthly" ? 120 : 10) || !GATEWAY_STATES.has(gateway.status))
    throw new ApiError(409, "SUBSCRIPTION_MISMATCH", "The provider subscription does not match this account.");
  transaction((db) => {
    db.prepare(`UPDATE personal_plan_subscriptions SET status=?,paid_count=?,current_end=?,next_charge_at=?,cancel_at_cycle_end=?,
      last_payment_id=COALESCE(?,last_payment_id),updated_at=? WHERE id=?`)
      .run(gateway.status, gateway.paidCount, gateway.currentEnd, gateway.nextChargeAt,
        gateway.cancelAtCycleEnd || row.cancel_at_cycle_end ? 1 : 0, paymentId || null,
        new Date().toISOString(), row.id);
  });
  syncPersonalPlanAccess(row.user_id);
  return getOwnPersonalPlan({ id: row.user_id } as SessionUser);
}

export async function reconcilePersonalPlan(user: SessionUser) {
  const row = getDb().prepare(`SELECT * FROM personal_plan_subscriptions WHERE user_id=? ORDER BY created_at DESC LIMIT 1`)
    .get(user.id) as SubscriptionRow | undefined;
  if (!row) return null;
  return applyGatewayState(row, await fetchGatewaySubscription(row.gateway_subscription_id));
}

export async function verifyPersonalPlanCheckout(user: SessionUser, subscriptionId: string, paymentId: string, signature: string) {
  const row = getDb().prepare("SELECT * FROM personal_plan_subscriptions WHERE id=? AND user_id=?")
    .get(subscriptionId, user.id) as SubscriptionRow | undefined;
  if (!row) throw new ApiError(404, "SUBSCRIPTION_NOT_FOUND", "Subscription not found.");
  if (!verifySubscriptionCheckoutSignature(row.gateway_subscription_id, paymentId, signature))
    throw new ApiError(403, "INVALID_PAYMENT_SIGNATURE", "Payment signature is invalid.");
  return applyGatewayState(row, await fetchGatewaySubscription(row.gateway_subscription_id), paymentId);
}

export async function cancelPersonalPlan(user: SessionUser) {
  const row = getDb().prepare(`SELECT * FROM personal_plan_subscriptions WHERE user_id=? AND status IN (${OPEN})`)
    .get(user.id) as SubscriptionRow | undefined;
  if (!row) throw new ApiError(404, "SUBSCRIPTION_NOT_FOUND", "No active subscription was found.");
  if (row.cancel_at_cycle_end) return subscriptionDto(row);
  const atCycleEnd = row.paid_count > 0 && row.current_end != null && row.current_end > Math.floor(Date.now() / 1000);
  const gateway = await cancelGatewaySubscription(row.gateway_subscription_id, atCycleEnd);
  return applyGatewayState({ ...row, cancel_at_cycle_end: atCycleEnd ? 1 : 0 }, gateway);
}

export async function processPersonalPlanWebhook(eventId: string, eventType: string, payload: Record<string, unknown>) {
  if (getDb().prepare("SELECT 1 FROM personal_plan_webhook_events WHERE event_id=?").get(eventId))
    return { received: true, duplicate: true };
  const entity = ((payload.payload as Record<string, unknown> | undefined)?.subscription as Record<string, unknown> | undefined)?.entity as Record<string, unknown> | undefined;
  const gatewayId = entity?.id;
  if (typeof gatewayId !== "string" || !/^sub_[A-Za-z0-9_-]+$/.test(gatewayId))
    throw new ApiError(422, "INVALID_WEBHOOK", "Subscription webhook is invalid.");
  const row = getDb().prepare("SELECT * FROM personal_plan_subscriptions WHERE gateway_subscription_id=?")
    .get(gatewayId) as SubscriptionRow | undefined;
  if (!row) throw new ApiError(404, "SUBSCRIPTION_NOT_FOUND", "Webhook subscription is unknown.");
  const gateway = await fetchGatewaySubscription(gatewayId);
  applyGatewayState(row, gateway);
  getDb().prepare("INSERT OR IGNORE INTO personal_plan_webhook_events(event_id,event_type,gateway_subscription_id) VALUES (?,?,?)")
    .run(eventId, eventType, gatewayId);
  return { received: true };
}
