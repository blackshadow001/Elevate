import { safe } from "@/server/api";
import { verifyGuidedCompletion } from "@/server/guidedPaths";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => verifyGuidedCompletion((await params).id));
}
