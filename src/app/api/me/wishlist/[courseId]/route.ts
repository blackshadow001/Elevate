import { id, requireSameOrigin, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { getDb } from "@/server/db";
export async function DELETE(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  return safe(async () => {
    requireSameOrigin(request);
    const user = await requireAuth();
    const courseId = id((await params).courseId);
    getDb().prepare("DELETE FROM wishlists WHERE user_id=? AND course_id=?").run(user.id, courseId);
    return { courseId, saved: false };
  });
}
