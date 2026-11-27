import { readJson, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { submitGuidedStep } from "@/server/guidedPaths";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string; stepId: string }> }) {
  return safe(async () => {
    const { slug, stepId } = await params;
    const user = await requireAuth();
    const input = await readJson(request, 12000);
    return submitGuidedStep(slug, stepId, user, input.response);
  });
}
