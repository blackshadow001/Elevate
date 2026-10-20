import { id, requireSameOrigin, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { reconcileOrder } from "@/server/payments";
import { rateLimit } from "@/server/rateLimit";
export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  return safe(async () => {
    requireSameOrigin(request);
    const user = await requireAuth();
    rateLimit(`payment-reconcile:${user.id}`, 10, 60_000);
    return reconcileOrder(id((await params).orderId), user);
  });
}
