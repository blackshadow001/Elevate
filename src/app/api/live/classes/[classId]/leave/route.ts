import { id, requireSameOrigin, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { leaveClass } from "@/server/live";

export async function POST(request: Request, { params }: { params: Promise<{ classId: string }> }) {
  return safe(async () => { requireSameOrigin(request); return leaveClass(id((await params).classId), await requireAuth()); });
}
