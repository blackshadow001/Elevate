import { id, requireSameOrigin, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { beginCheckout } from "@/server/payments";
import { rateLimit } from "@/server/rateLimit";
export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  return safe(async () => {
    requireSameOrigin(request);
    const user = await requireAuth();
    rateLimit(`checkout:${user.id}`, 12, 60_000);
    return beginCheckout(id((await params).orderId), user);
  });
}
