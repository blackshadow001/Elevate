import { ApiError, id, safe } from "@/server/api";
import { getDb } from "@/server/db";

type Context = { params: Promise<{ courseId: string }> };

export async function GET(_request: Request, { params }: Context) {
  return safe(async () => {
    const courseId = id((await params).courseId);
    const db = getDb();
    if (!db.prepare("SELECT 1 FROM courses WHERE id=? AND status='published'").get(courseId))
      throw new ApiError(404, "COURSE_NOT_FOUND", "Course not found.");
    const distribution = [0, 0, 0, 0, 0];
    for (const row of db.prepare("SELECT rating,COUNT(*) total FROM reviews WHERE course_id=? GROUP BY rating").all(courseId)) {
      const rating = Number(row.rating);
      if (rating >= 1 && rating <= 5) distribution[rating - 1] = Number(row.total);
    }
    const total = distribution.reduce((sum, count) => sum + count, 0);
    const average = total ? distribution.reduce((sum, count, index) => sum + count * (index + 1), 0) / total : 0;
    return { total, average, distribution };
  });
}
