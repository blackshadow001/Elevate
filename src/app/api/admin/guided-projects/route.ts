import { safe } from "@/server/api";
import { requireRole } from "@/server/auth";
import { pendingGuidedProjects } from "@/server/guidedAssessment";

export async function GET() {
  return safe(async () => { await requireRole("admin"); return pendingGuidedProjects(); });
}
