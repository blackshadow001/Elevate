import { ApiError, readJson, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { verifyPersonalPlanCheckout } from "@/server/personalPlan";

export async function POST(request: Request) {
  return safe(async () => {
    const user = await requireAuth();
    const body = await readJson(request);
    if (typeof body.subscriptionId !== "string" || !/^[a-f0-9-]{36}$/i.test(body.subscriptionId) ||
      typeof body.paymentId !== "string" || !/^pay_[A-Za-z0-9_-]+$/.test(body.paymentId) ||
      typeof body.signature !== "string" || !/^[a-f0-9]{64}$/i.test(body.signature))
      throw new ApiError(422, "INVALID_PAYMENT", "Payment confirmation details are invalid.");
    return verifyPersonalPlanCheckout(user, body.subscriptionId, body.paymentId, body.signature);
  });
}
