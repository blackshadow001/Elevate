import { id, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { getOwnOrder } from "@/server/payments";
export async function GET(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  return safe(async () => getOwnOrder(id((await params).orderId), await requireAuth()));
}
