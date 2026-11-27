import { readJson, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { submitGuidedProject } from "@/server/guidedAssessment";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  return safe(async () => submitGuidedProject((await params).slug, await requireAuth(), await readJson(request, 6000)));
}
