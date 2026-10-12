import { id, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { getOwnProgress } from "@/server/learning";

export async function GET(_request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  return safe(async () => getOwnProgress(id((await params).courseId), await requireAuth()));
}
