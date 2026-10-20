import { ApiError, id, readJson, requireSameOrigin, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { verifyCheckout } from "@/server/payments";
import { rateLimit } from "@/server/rateLimit";
export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  return safe(async () => {
    requireSameOrigin(request);
    const user = await requireAuth();
    rateLimit(`payment-verify:${user.id}`, 20, 60_000);
    const body = await readJson(request);
    if (typeof body.paymentId !== "string" || typeof body.gatewayOrderId !== "string" ||
      typeof body.signature !== "string" || !/^pay_[A-Za-z0-9_-]{1,100}$/.test(body.paymentId) ||
      !/^order_[A-Za-z0-9_-]{1,100}$/.test(body.gatewayOrderId) || !/^[a-f0-9]{64}$/i.test(body.signature))
      throw new ApiError(422, "INVALID_PAYMENT_RESPONSE", "Invalid payment response.");
    return verifyCheckout(id((await params).orderId), user, body.paymentId, body.gatewayOrderId, body.signature);
  });
}
