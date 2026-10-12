import { ApiError, id, requireSameOrigin, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { getDb } from "@/server/db";
import { paymentProvider } from "@/server/integrations";
export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  return safe(async () => {
    requireSameOrigin(request);
    const user = await requireAuth();
    const row = getDb().prepare("SELECT * FROM orders WHERE id=? AND user_id=?").get(id((await params).orderId), user.id);
    if (!row) throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found.");
    if (row.status !== "pending") throw new ApiError(409, "ORDER_NOT_PENDING", "This order is no longer pending.");
    return paymentProvider.createCheckout(String(row.id), Number(row.total_minor), String(row.currency));
  });
}
