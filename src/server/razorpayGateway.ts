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

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret) throw new ApiError(503, "WEBHOOK_NOT_CONFIGURED", "Payment webhook is not configured.");
  return validHmac(rawBody, signature, secret);
}

export function publicCheckoutKey(): string { return credentials().keyId; }
