import { ApiError, safe } from "@/server/api";
import { requireRole } from "@/server/auth";
import { getDb } from "@/server/db";

export async function GET(request: Request) {
  return safe(async () => {
    await requireRole("admin");
    const params = new URL(request.url).searchParams;
    const status = params.get("status") || "";
    const search = (params.get("search") || "").trim();
    const page = Number(params.get("page") || 1);
    if (!["", "scheduled", "live", "ended", "cancelled"].includes(status) || search.length > 100 || !Number.isInteger(page) || page < 1 || page > 100000)
      throw new ApiError(422, "INVALID_FILTER", "Invalid live class filter.");
    const where = ["1=1"];
    const values: Array<string | number> = [];
    if (status) { where.push("l.status=?"); values.push(status); }
    if (search) {
      where.push("(l.title LIKE ? ESCAPE '\\' OR u.name LIKE ? ESCAPE '\\')");
      const query = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
      values.push(query, query);
    }
    const from = "live_classes l JOIN users u ON u.id=l.instructor_id";
    const clause = where.join(" AND ");
    const db = getDb();
    const total = Number(db.prepare(`SELECT COUNT(*) n FROM ${from} WHERE ${clause}`).get(...values)?.n || 0);
    const items = db.prepare(`SELECT l.id,l.title,l.scheduled_at,l.duration_minutes,l.status,l.updated_at,
      u.name instructor_name, (SELECT COUNT(*) FROM live_participants p WHERE p.live_class_id=l.id AND p.left_at IS NULL) active_participants
      FROM ${from} WHERE ${clause} ORDER BY l.scheduled_at DESC,l.id LIMIT 25 OFFSET ?`).all(...values, (page - 1) * 25);
    return { items, total, page, pageSize: 25, streamingConfigured: false };
  });
}
