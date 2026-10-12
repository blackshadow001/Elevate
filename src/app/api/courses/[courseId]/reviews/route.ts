import { randomUUID } from "node:crypto";
import { ApiError, id, json, number, optionalText, readJson, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { getDb } from "@/server/db";
type Context = { params: Promise<{ courseId: string }> };
export async function GET(_request: Request, { params }: Context) {
  return safe(async () => {
    const courseId = id((await params).courseId);
    if (!getDb().prepare("SELECT 1 FROM courses WHERE id=? AND status='published'").get(courseId)) throw new ApiError(404, "COURSE_NOT_FOUND", "Course not found.");
    return getDb().prepare(`SELECT r.id,r.rating,r.comment,r.created_at,u.name author_name
      FROM reviews r JOIN users u ON u.id=r.user_id WHERE r.course_id=? ORDER BY r.created_at DESC LIMIT 100`)
      .all(courseId).map((row) => ({ id: String(row.id), rating: Number(row.rating), comment: String(row.comment),
        createdAt: String(row.created_at), authorName: String(row.author_name) }));
  });
}
export async function POST(request: Request, { params }: Context) {
  return safe(async () => {
    const user = await requireAuth();
    const courseId = id((await params).courseId);
    const body = await readJson(request);
    const rating = number(body.rating, "Rating", 1, 5);
    if (!Number.isInteger(rating)) throw new ApiError(422, "INVALID_RATING", "Rating must be a whole number.");
    const comment = optionalText(body.comment, "Comment", 2000) || "";
    if (!getDb().prepare("SELECT 1 FROM enrollments WHERE user_id=? AND course_id=? AND status IN ('active','completed')")
      .get(user.id, courseId)) throw new ApiError(403, "NOT_ENROLLED", "Enroll before reviewing this course.");
    getDb().prepare(`INSERT INTO reviews (id,user_id,course_id,rating,comment) VALUES (?,?,?,?,?)
      ON CONFLICT(user_id,course_id) DO UPDATE SET rating=excluded.rating,comment=excluded.comment,updated_at=?`)
      .run(randomUUID(), user.id, courseId, rating, comment, new Date().toISOString());
    const row = getDb().prepare("SELECT id FROM reviews WHERE user_id=? AND course_id=?").get(user.id, courseId)!;
    return json({ id: String(row.id), courseId, rating, comment }, 201);
  });
}
