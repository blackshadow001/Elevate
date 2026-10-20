import "server-only";
import { randomUUID } from "node:crypto";
import { ApiError } from "@/server/api";
import { SessionUser } from "@/server/auth";
import { getDb, transaction } from "@/server/db";
import { createGatewayOrder, fetchGatewayOrder, fetchGatewayOrderPayments, fetchGatewayPayment,
  GatewayOrder, GatewayPayment, publicCheckoutKey, razorpayConfigured, verifyCheckoutSignature } from "@/server/razorpayGateway";

type OrderRow = { id: string; user_id: string; status: string; total_minor: number; currency: string;
  provider_reference: string | null; checkout_state: string; checkout_started_at: string | null; };

function ownOrder(orderId: string, userId: string): OrderRow {
  const row = getDb().prepare("SELECT * FROM orders WHERE id=? AND user_id=?").get(orderId, userId) as OrderRow | undefined;
  if (!row) throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found.");
  return row;
}

function publicOrder(row: OrderRow) {
  return { id: row.id, status: row.status, totalMinor: Number(row.total_minor), currency: row.currency,
    gatewayOrderId: row.provider_reference, checkoutAvailable: razorpayConfigured() };
}

export function getOwnOrder(orderId: string, user: SessionUser) {
  const order = publicOrder(ownOrder(orderId, user.id));
  const course = getDb().prepare(`SELECT c.title,c.slug,
    (SELECT l.id FROM course_sections s JOIN lessons l ON l.section_id=s.id
      WHERE s.course_id=c.id ORDER BY s.position,l.position LIMIT 1) first_lesson_id
    FROM order_items i JOIN courses c ON c.id=i.course_id WHERE i.order_id=? LIMIT 1`).get(orderId);
  return { ...order, course: course ? { title: String(course.title), slug: String(course.slug),
    firstLessonId: course.first_lesson_id ? String(course.first_lesson_id) : null } : null };
}

export async function beginCheckout(orderId: string, user: SessionUser) {
  if (!razorpayConfigured()) throw new ApiError(503, "PAYMENT_NOT_CONFIGURED", "Razorpay checkout is not configured. No payment was made.");
  const reserved = transaction((db) => {
    const row = ownOrder(orderId, user.id);
    if (row.status !== "pending") throw new ApiError(409, "ORDER_NOT_PENDING", "This order is no longer pending.");
    const course = db.prepare(`SELECT c.status,c.review_status FROM order_items i JOIN courses c ON c.id=i.course_id WHERE i.order_id=?`).get(orderId);
    if (!course || course.status !== "published" || course.review_status !== "approved")
      throw new ApiError(409, "COURSE_UNAVAILABLE", "This course is no longer available for purchase.");
    if (!Number.isSafeInteger(row.total_minor) || row.total_minor <= 0 || row.currency !== "INR")
      throw new ApiError(409, "INVALID_ORDER_AMOUNT", "This order cannot be paid in its current currency or amount.");
    if (row.provider_reference) return { row, create: false };
    if (row.checkout_state === "creating" && row.checkout_started_at &&
      Date.now() - Date.parse(row.checkout_started_at) < 120_000)
      throw new ApiError(409, "CHECKOUT_IN_PROGRESS", "Checkout is being prepared. Please wait before retrying.");
    db.prepare("UPDATE orders SET checkout_state='creating',checkout_started_at=?,updated_at=? WHERE id=?")
      .run(new Date().toISOString(), new Date().toISOString(), orderId);
    return { row, create: true };
  });
  if (!reserved.create) return { ...publicOrder(reserved.row), keyId: publicCheckoutKey() };

  let gateway: GatewayOrder;
  try {
    gateway = await createGatewayOrder(orderId, Number(reserved.row.total_minor), reserved.row.currency);
    if (!/^order_[A-Za-z0-9_-]+$/.test(gateway.id) || gateway.amount !== Number(reserved.row.total_minor) ||
      gateway.currency !== reserved.row.currency || gateway.status !== "created")
      throw new ApiError(502, "GATEWAY_ORDER_MISMATCH", "The payment provider returned an inconsistent order. No checkout was opened.");
  } catch (error) {
    transaction((db) => db.prepare("UPDATE orders SET checkout_state='none',checkout_started_at=NULL WHERE id=? AND checkout_state='creating' AND provider_reference IS NULL").run(orderId));
    throw error;
  }
  const row = transaction((db) => {
    db.prepare("UPDATE orders SET provider_reference=?,checkout_state='ready',updated_at=? WHERE id=? AND status='pending' AND checkout_state='creating' AND provider_reference IS NULL")
      .run(gateway.id, new Date().toISOString(), orderId);
    return ownOrder(orderId, user.id);
  });
  if (row.provider_reference !== gateway.id) throw new ApiError(409, "CHECKOUT_RETRY_REQUIRED", "Please retry checkout. No payment was made.");
  return { ...publicOrder(row), keyId: publicCheckoutKey() };
}

function assertCapturedOrder(row: OrderRow, gatewayOrder: GatewayOrder, payment: GatewayPayment) {
  if (!row.provider_reference || gatewayOrder.id !== row.provider_reference || payment.order_id !== row.provider_reference ||
    gatewayOrder.amount !== Number(row.total_minor) || payment.amount !== Number(row.total_minor) ||
    gatewayOrder.currency !== row.currency || payment.currency !== row.currency)
    throw new ApiError(409, "PAYMENT_MISMATCH", "Payment details do not match this order.");
  if (payment.status !== "captured" || gatewayOrder.status !== "paid")
    throw new ApiError(409, "PAYMENT_NOT_CAPTURED", "Payment confirmation is still pending.");
}

function settleCaptured(orderId: string, gatewayOrder: GatewayOrder, payment: GatewayPayment, eventId?: string, eventType = "payment.captured") {
  return transaction((db) => {
    const row = db.prepare("SELECT * FROM orders WHERE id=?").get(orderId) as OrderRow | undefined;
    if (!row) throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found.");
    assertCapturedOrder(row, gatewayOrder, payment);
    if (row.status !== "pending" && row.status !== "paid") throw new ApiError(409, "ORDER_NOT_PAYABLE", "This order cannot be settled automatically.");
    if (eventId && db.prepare("SELECT 1 FROM payment_webhook_events WHERE event_id=?").get(eventId)) return publicOrder(row);
    const other = db.prepare("SELECT order_id FROM payments WHERE provider_payment_id=?").get(payment.id);
    if (other && other.order_id !== orderId) throw new ApiError(409, "PAYMENT_REUSED", "Payment belongs to another order.");
    const now = new Date().toISOString();
    db.prepare(`INSERT INTO payments (id,order_id,provider,provider_payment_id,status,amount_minor,verified_at,gateway_order_id,currency,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(provider_payment_id) DO UPDATE SET
      status=CASE WHEN payments.status='refunded' THEN 'refunded' ELSE 'succeeded' END,
      verified_at=COALESCE(payments.verified_at,excluded.verified_at),updated_at=excluded.updated_at`)
      .run(randomUUID(), orderId, "razorpay", payment.id, "succeeded", payment.amount, now, gatewayOrder.id, payment.currency, now);
    db.prepare("UPDATE orders SET status='paid',paid_at=COALESCE(paid_at,?),updated_at=? WHERE id=?")
      .run(now, now, orderId);
    const item = db.prepare("SELECT course_id FROM order_items WHERE order_id=?").get(orderId);
    if (!item) throw new ApiError(409, "ORDER_ITEM_MISSING", "Order has no course.");
    const inserted = db.prepare("INSERT OR IGNORE INTO enrollments (id,user_id,course_id) VALUES (?,?,?)")
      .run(randomUUID(), row.user_id, String(item.course_id));
    if (inserted.changes) db.prepare("INSERT INTO notifications (id,user_id,type,title,message) VALUES (?,?,?,?,?)")
      .run(randomUUID(), row.user_id, "success", "Course purchase confirmed", "Your course is ready in My Learning.");
    if (eventId) db.prepare("INSERT INTO payment_webhook_events (event_id,event_type,gateway_order_id,provider_payment_id) VALUES (?,?,?,?)")
      .run(eventId, eventType, gatewayOrder.id, payment.id);
    return { ...publicOrder(row), status: "paid" };
  });
}

export async function verifyCheckout(orderId: string, user: SessionUser, paymentId: string, gatewayOrderId: string, signature: string) {
  const row = ownOrder(orderId, user.id);
  if (!row.provider_reference || row.provider_reference !== gatewayOrderId)
    throw new ApiError(409, "ORDER_MISMATCH", "Checkout order does not match your purchase.");
  if (!verifyCheckoutSignature(row.provider_reference, paymentId, signature))
    throw new ApiError(403, "INVALID_PAYMENT_SIGNATURE", "Payment signature is invalid.");
  const [gatewayOrder, payment] = await Promise.all([fetchGatewayOrder(row.provider_reference), fetchGatewayPayment(paymentId)]);
  return settleCaptured(orderId, gatewayOrder, payment);
}

export async function reconcileOrder(orderId: string, user: SessionUser) {
  const row = ownOrder(orderId, user.id);
  if (row.status === "paid" || !row.provider_reference) return publicOrder(row);
  const gatewayOrder = await fetchGatewayOrder(row.provider_reference);
  if (gatewayOrder.status !== "paid") return publicOrder(row);
  const payments = await fetchGatewayOrderPayments(row.provider_reference);
  const captured = payments.find((payment) => payment.status === "captured");
  if (!captured) return publicOrder(row);
  return settleCaptured(orderId, gatewayOrder, captured);
}

type WebhookEntity = { id?: unknown; order_id?: unknown; amount?: unknown; currency?: unknown; status?: unknown; };
export async function processPaymentWebhook(eventId: string, eventType: string, payload: Record<string, unknown>) {
  if (getDb().prepare("SELECT 1 FROM payment_webhook_events WHERE event_id=?").get(eventId)) return { received: true, duplicate: true };
  const contents = payload.payload as Record<string, unknown> | undefined;
  const payment = (contents?.payment as Record<string, unknown> | undefined)?.entity as WebhookEntity | undefined;
  if (eventType === "payment.captured" || eventType === "payment.failed") {
    if (!payment || typeof payment.id !== "string" || typeof payment.order_id !== "string" ||
      typeof payment.amount !== "number" || !Number.isSafeInteger(payment.amount) || typeof payment.currency !== "string" ||
      payment.status !== (eventType === "payment.captured" ? "captured" : "failed"))
      throw new ApiError(422, "INVALID_WEBHOOK", "Webhook payment details are invalid.");
    const validPayment: GatewayPayment = { id: payment.id, order_id: payment.order_id,
      amount: payment.amount, currency: payment.currency, status: String(payment.status) };
    const row = getDb().prepare("SELECT * FROM orders WHERE provider_reference=?").get(validPayment.order_id) as OrderRow | undefined;
    if (!row) throw new ApiError(404, "ORDER_NOT_FOUND", "Webhook order is unknown.");
    if (validPayment.amount !== row.total_minor || validPayment.currency !== row.currency)
      throw new ApiError(409, "PAYMENT_MISMATCH", "Webhook amount or currency does not match.");
    if (eventType === "payment.captured") {
      const gatewayOrder = await fetchGatewayOrder(validPayment.order_id);
      settleCaptured(row.id, gatewayOrder, validPayment, eventId, eventType);
    } else transaction((db) => {
      if (db.prepare("SELECT 1 FROM payment_webhook_events WHERE event_id=?").get(eventId)) return;
      const previous = db.prepare("SELECT order_id,status FROM payments WHERE provider_payment_id=?").get(validPayment.id);
      if (previous && previous.order_id !== row.id) throw new ApiError(409, "PAYMENT_REUSED", "Payment belongs to another order.");
      const now = new Date().toISOString();
      db.prepare(`INSERT INTO payments (id,order_id,provider,provider_payment_id,status,amount_minor,gateway_order_id,currency,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(provider_payment_id) DO UPDATE SET
        status=CASE WHEN payments.status IN ('succeeded','refunded') THEN payments.status ELSE 'failed' END,updated_at=excluded.updated_at`)
        .run(randomUUID(), row.id, "razorpay", validPayment.id, "failed", validPayment.amount, validPayment.order_id, validPayment.currency, now);
      db.prepare("INSERT INTO payment_webhook_events (event_id,event_type,gateway_order_id,provider_payment_id) VALUES (?,?,?,?)")
        .run(eventId, eventType, validPayment.order_id, validPayment.id);
    });
    return { received: true };
  }
  if (eventType === "order.paid") {
    const order = (contents?.order as Record<string, unknown> | undefined)?.entity as WebhookEntity | undefined;
    if (!order || typeof order.id !== "string") throw new ApiError(422, "INVALID_WEBHOOK", "Webhook order is invalid.");
    const row = getDb().prepare("SELECT * FROM orders WHERE provider_reference=?").get(order.id) as OrderRow | undefined;
    if (!row) throw new ApiError(404, "ORDER_NOT_FOUND", "Webhook order is unknown.");
    const gatewayOrder = await fetchGatewayOrder(order.id);
    const payments = await fetchGatewayOrderPayments(order.id);
    const captured = payments.find((candidate) => candidate.status === "captured");
    if (!captured) throw new ApiError(409, "PAYMENT_NOT_CAPTURED", "Captured payment not yet available; retry webhook.");
    settleCaptured(row.id, gatewayOrder, captured, eventId, eventType);
    return { received: true };
  }
  transaction((db) => db.prepare("INSERT OR IGNORE INTO payment_webhook_events (event_id,event_type) VALUES (?,?)").run(eventId, eventType));
  return { received: true, ignored: true };
}
