import { ApiError, readJson, safe } from "@/server/api";
import { requireRole } from "@/server/auth";
import { archiveGuidedPath, ownGuidedPath, publishGuidedPath, returnGuidedPath } from "@/server/guidedPaths";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => ownGuidedPath((await params).id, await requireRole("admin")));
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    await requireRole("admin");
    const action = (await readJson(request)).action;
    if (action === "publish") return publishGuidedPath((await params).id);
    if (action === "archive") return archiveGuidedPath((await params).id);
    if (action === "return") return returnGuidedPath((await params).id);
    throw new ApiError(422, "INVALID_INPUT", "Choose a valid review action.");
  });
}
