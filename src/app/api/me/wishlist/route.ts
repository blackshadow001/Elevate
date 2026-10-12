import { ApiError, id, json, readJson, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { getDb } from "@/server/db";
import { randomUUID } from "node:crypto";

export async function GET() {
  return safe(async () => {
    const user = await requireAuth();
    return getDb().prepare(`SELECT c.id,c.slug,c.title,c.thumbnail,c.price_minor,c.currency
      FROM wishlists w JOIN courses c ON c.id=w.course_id WHERE w.user_id=? ORDER BY w.created_at DESC`)
      .all(user.id).map((row) => ({ id: String(row.id), slug: String(row.slug), title: String(row.title),
        thumbnail: row.thumbnail ? String(row.thumbnail) : null, price: Number(row.price_minor) / 100, currency: String(row.currency) }));
  });
}
export async function POST(request: Request) {
  return safe(async () => {
    const user = await requireAuth();
    const body = await readJson(request);
    if (typeof body.courseId !== "string") throw new ApiError(422, "INVALID_INPUT", "courseId is required.");
    const courseId = id(body.courseId);
    if (!getDb().prepare("SELECT 1 FROM courses WHERE id=? AND status='published'").get(courseId)) {
      throw new ApiError(404, "COURSE_NOT_FOUND", "Course not found.");
    }
    getDb().prepare("INSERT OR IGNORE INTO wishlists (id,user_id,course_id) VALUES (?,?,?)")
      .run(randomUUID(), user.id, courseId);
    return json({ courseId, saved: true }, 201);
  });
}
