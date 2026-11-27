import { readJson, requireSameOrigin, safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { editGuidedStep, removeGuidedStep } from "@/server/guidedPaths";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; stepId: string }> }) {
  return safe(async () => {
    const { id, stepId } = await params;
    return editGuidedStep(id, stepId, await requireAnyRole(["instructor", "admin"]), await readJson(request));
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; stepId: string }> }) {
  return safe(async () => {
    requireSameOrigin(request);
    const { id, stepId } = await params;
    return removeGuidedStep(id, stepId, await requireAnyRole(["instructor", "admin"]));
  });
}
