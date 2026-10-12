import { id, requireSameOrigin, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { joinClass } from "@/server/live";

export async function POST(request: Request, { params }: { params: Promise<{ classId: string }> }) {
  return safe(async () => { requireSameOrigin(request); return joinClass(id((await params).classId), await requireAuth()); });
}
