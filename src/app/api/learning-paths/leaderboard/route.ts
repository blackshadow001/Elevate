import { currentUser, requireAuth } from "@/server/auth";
import { ApiError, readJson, safe } from "@/server/api";
import { guidedLeaderboard, updateGuidedLeaderboardPreference } from "@/server/guidedLeaderboard";

export async function GET(request: Request) {
  return safe(async () => guidedLeaderboard(new URL(request.url).searchParams.get("path"), await currentUser()));
}

export async function PUT(request: Request) {
  return safe(async () => {
    const user = await requireAuth();
    const body = await readJson(request);
    if (typeof body.showName !== "boolean") throw new ApiError(422, "INVALID_INPUT", "Choose whether to show your name.");
    return updateGuidedLeaderboardPreference(user, body.showName);
  });
}
