import { ApiError, number, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { getDb } from "@/server/db";

export async function GET(request: Request) {
  return safe(async () => {
    const user = await requireAuth();
    const query = new URL(request.url).searchParams;
    const limit = number(Number(query.get("limit") || "30"), "limit", 1, 100);
    if (!Number.isInteger(limit)) throw new ApiError(422, "INVALID_INPUT", "limit must be a whole number.");
    const items = getDb().prepare(`SELECT id,type,title,message,read_at,created_at FROM notifications
      WHERE user_id=? ORDER BY created_at DESC LIMIT ?`).all(user.id, limit).map((row) => ({
        id: String(row.id), type: String(row.type), title: String(row.title), message: String(row.message),
        readAt: row.read_at ? String(row.read_at) : null, createdAt: String(row.created_at),
      }));
    return { items, unreadCount: Number(getDb().prepare("SELECT COUNT(*) total FROM notifications WHERE user_id=? AND read_at IS NULL").get(user.id)?.total || 0) };
  });
}
