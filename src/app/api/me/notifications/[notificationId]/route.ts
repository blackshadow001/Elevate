import { ApiError, id, requireSameOrigin, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { getDb } from "@/server/db";

export async function PATCH(request: Request, { params }: { params: Promise<{ notificationId: string }> }) {
  return safe(async () => {
    requireSameOrigin(request);
    const user = await requireAuth();
    const notificationId = id((await params).notificationId);
    const result = getDb().prepare("UPDATE notifications SET read_at=COALESCE(read_at,?) WHERE id=? AND user_id=?")
      .run(new Date().toISOString(), notificationId, user.id);
    if (!result.changes) throw new ApiError(404, "NOTIFICATION_NOT_FOUND", "Notification not found.");
    return { read: true };
  });
}
