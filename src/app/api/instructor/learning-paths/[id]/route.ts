import { ApiError, readJson, safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { ownGuidedPath, submitPathForReview, updateGuidedPath } from "@/server/guidedPaths";

type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) {
  return safe(async () => ownGuidedPath((await params).id, await requireAnyRole(["instructor", "admin"])));
}
export async function PATCH(request: Request, { params }: Context) {
  return safe(async () => {
    const user = await requireAnyRole(["instructor", "admin"]);
    const input = await readJson(request);
    if (input.action === "submit") return submitPathForReview((await params).id, user);
    if (input.action === "update") return updateGuidedPath((await params).id, user, input);
    throw new ApiError(422, "INVALID_INPUT", "Invalid path action.");
  });
}
