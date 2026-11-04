import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";
import { ApiError } from "@/server/api";

export interface GatewayOrder { id: string; amount: number; currency: string; status: string; }
export interface GatewayPayment { id: string; order_id: string; amount: number; currency: string; status: string; }

export function razorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID?.trim() && process.env.RAZORPAY_KEY_SECRET?.trim() &&
    process.env.RAZORPAY_WEBHOOK_SECRET?.trim());
}

function credentials() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret) throw new ApiError(503, "PAYMENT_NOT_CONFIGURED", "Razorpay checkout is not configured. No payment was made.");
  return { keyId, keySecret };
}

function client() {
  const { keyId, keySecret } = credentials();
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

function providerError(error: unknown): never {
  // SDK errors can contain request headers and payment details. Never return or log them.
  if (error instanceof ApiError) throw error;
  throw new ApiError(502, "PAYMENT_PROVIDER_UNAVAILABLE", "Razorpay could not confirm this request. Please try again or check the order status.");
}

export async function createGatewayOrder(orderId: string, amount: number, currency: string): Promise<GatewayOrder> {
  try {
    const result = await client().orders.create({ amount, currency, receipt: orderId, partial_payment: false, notes: { elevateOrderId: orderId } });
    return { id: String(result.id), amount: Number(result.amount), currency: String(result.currency), status: String(result.status) };
  } catch (error) { return providerError(error); }
}

export async function fetchGatewayOrder(id: string): Promise<GatewayOrder> {
  try {
    const result = await client().orders.fetch(id);
    return { id: String(result.id), amount: Number(result.amount), currency: String(result.currency), status: String(result.status) };
  } catch (error) { return providerError(error); }
}

export async function fetchGatewayPayment(id: string): Promise<GatewayPayment> {
  try {
    const result = await client().payments.fetch(id);
    return { id: String(result.id), order_id: String(result.order_id), amount: Number(result.amount), currency: String(result.currency), status: String(result.status) };
  } catch (error) { return providerError(error); }
}

export async function fetchGatewayOrderPayments(id: string): Promise<GatewayPayment[]> {
  try {
    const result = await client().orders.fetchPayments(id);
    return result.items.map((payment) => ({ id: String(payment.id), order_id: String(payment.order_id),
      amount: Number(payment.amount), currency: String(payment.currency), status: String(payment.status) }));
  } catch (error) { return providerError(error); }
}

function validHmac(message: string, signature: string, secret: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(message).digest();
  const received = Buffer.from(signature, "hex");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function verifyCheckoutSignature(gatewayOrderId: string, paymentId: string, signature: string): boolean {
  return validHmac(`${gatewayOrderId}|${paymentId}`, signature, credentials().keySecret);
}

export function verifySubscriptionCheckoutSignature(gatewaySubscriptionId: string, paymentId: string, signature: string): boolean {
  return validHmac(`${paymentId}|${gatewaySubscriptionId}`, signature, credentials().keySecret);
}

export interface GatewaySubscription {
  id: string; planId: string; status: string; currentEnd: number | null; paidCount: number;
  totalCount: number; nextChargeAt: number | null; cancelAtCycleEnd: boolean;
}

function subscriptionResult(value: { id: string; plan_id: string; status: string; current_end?: number | null;
  charge_at?: number | null; paid_count?: number; total_count: number; has_scheduled_changes?: boolean }): GatewaySubscription {
  return { id: String(value.id), planId: String(value.plan_id), status: String(value.status),
    currentEnd: typeof value.current_end === "number" ? value.current_end : null,
    nextChargeAt: typeof value.charge_at === "number" ? value.charge_at : null,
    paidCount: Number(value.paid_count || 0), totalCount: Number(value.total_count),
    cancelAtCycleEnd: Boolean(value.has_scheduled_changes) };
}

export async function createGatewayPlan(term: "monthly" | "annual", priceMinor: number): Promise<string> {
  try {
    const result = await client().plans.create({ period: term === "annual" ? "yearly" : "monthly", interval: 1,
      item: { name: `Elevate Personal Plan — ${term}`, amount: priceMinor, currency: "INR" } });
    if (!/^plan_[A-Za-z0-9_-]+$/.test(String(result.id)) || Number(result.item.amount) !== priceMinor ||
      result.item.currency !== "INR" || result.period !== (term === "annual" ? "yearly" : "monthly"))
      throw new ApiError(502, "GATEWAY_PLAN_MISMATCH", "The payment provider returned an inconsistent plan.");
    return String(result.id);
  } catch (error) { return providerError(error); }
}

export async function createGatewaySubscription(planId: string, term: "monthly" | "annual", reference: string): Promise<GatewaySubscription> {
  try {
    const result = await client().subscriptions.create({ plan_id: planId, total_count: term === "monthly" ? 120 : 10,
      quantity: 1, customer_notify: true, notes: { elevateSubscriptionId: reference } });
    const subscription = subscriptionResult(result);
    if (!/^sub_[A-Za-z0-9_-]+$/.test(subscription.id) || subscription.planId !== planId ||
      subscription.totalCount !== (term === "monthly" ? 120 : 10) || subscription.status !== "created")
      throw new ApiError(502, "GATEWAY_SUBSCRIPTION_MISMATCH", "The payment provider returned an inconsistent subscription.");
    return subscription;
  } catch (error) { return providerError(error); }
}

export async function fetchGatewaySubscription(subscriptionId: string): Promise<GatewaySubscription> {
  try { return subscriptionResult(await client().subscriptions.fetch(subscriptionId)); }
  catch (error) { return providerError(error); }
}

export async function cancelGatewaySubscription(subscriptionId: string, atCycleEnd: boolean): Promise<GatewaySubscription> {
  try { return subscriptionResult(await client().subscriptions.cancel(subscriptionId, atCycleEnd)); }
  catch (error) { return providerError(error); }
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret) throw new ApiError(503, "WEBHOOK_NOT_CONFIGURED", "Payment webhook is not configured.");
  return validHmac(rawBody, signature, secret);
}

export function publicCheckoutKey(): string { return credentials().keyId; }
