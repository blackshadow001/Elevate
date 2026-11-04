import { ApiError, readJson, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { getOwnPersonalPlan, startPersonalPlan } from "@/server/personalPlan";

export async function GET() { return safe(async () => getOwnPersonalPlan(await requireAuth())); }

export async function POST(request: Request) {
  return safe(async () => {
    const user = await requireAuth();
    const body = await readJson(request);
    if (body.term !== "monthly" && body.term !== "annual")
      throw new ApiError(422, "INVALID_TERM", "Choose monthly or annual access.");
    return startPersonalPlan(user, body.term);
  });
}
