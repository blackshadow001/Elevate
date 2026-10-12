import { id, safe } from "@/server/api";
import { getLiveClass } from "@/server/live";

export async function GET(_request: Request, { params }: { params: Promise<{ classId: string }> }) {
  return safe(async () => getLiveClass(id((await params).classId)));
}
