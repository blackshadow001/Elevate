import { safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { listOwnOrders } from "@/server/orders";
export async function GET() { return safe(async () => listOwnOrders(await requireAuth())); }
