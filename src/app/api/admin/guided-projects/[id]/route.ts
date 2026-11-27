import { readJson, safe } from "@/server/api";
import { requireRole } from "@/server/auth";
import { reviewGuidedProject } from "@/server/guidedAssessment";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => reviewGuidedProject((await params).id, await requireRole("admin"), await readJson(request, 2500)));
}
