import { requireSameOrigin, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { reconcilePersonalPlan } from "@/server/personalPlan";

export async function POST(request: Request) {
  return safe(async () => { requireSameOrigin(request); return reconcilePersonalPlan(await requireAuth()); });
}
