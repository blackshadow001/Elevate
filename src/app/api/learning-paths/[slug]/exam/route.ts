import { readJson, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { guidedExam, submitGuidedExam } from "@/server/guidedAssessment";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  return safe(async () => guidedExam((await params).slug, await requireAuth()));
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  return safe(async () => submitGuidedExam((await params).slug, await requireAuth(), await readJson(request, 3000)));
}
