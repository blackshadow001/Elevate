import { requireSameOrigin, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { cancelPersonalPlan } from "@/server/personalPlan";

export async function POST(request: Request) {
  return safe(async () => { requireSameOrigin(request); return cancelPersonalPlan(await requireAuth()); });
}
