import { ApiError, safe } from "@/server/api";
import { processPaymentWebhook } from "@/server/payments";
import { verifyWebhookSignature } from "@/server/razorpayGateway";

export async function POST(request: Request) {
  return safe(async () => {
    const length = Number(request.headers.get("content-length") || 0);
    if (length > 262_144) throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Webhook payload is too large.");
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > 262_144) throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Webhook payload is too large.");
    const signature = request.headers.get("x-razorpay-signature") || "";
    if (!verifyWebhookSignature(raw, signature)) throw new ApiError(401, "INVALID_WEBHOOK_SIGNATURE", "Webhook signature is invalid.");
    const eventId = request.headers.get("x-razorpay-event-id") || "";
    if (!/^[A-Za-z0-9_-]{1,120}$/.test(eventId)) throw new ApiError(422, "INVALID_WEBHOOK", "Webhook event ID is required.");
    let payload: unknown;
    try { payload = JSON.parse(raw); } catch { throw new ApiError(400, "INVALID_JSON", "Webhook body is invalid JSON."); }
    if (!payload || typeof payload !== "object" || Array.isArray(payload) ||
      typeof (payload as Record<string, unknown>).event !== "string")
      throw new ApiError(422, "INVALID_WEBHOOK", "Webhook event is invalid.");
    return processPaymentWebhook(eventId, (payload as Record<string, unknown>).event as string,
      payload as Record<string, unknown>);
  });
}
