import { ApiError, id, json, requireSameOrigin, safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { markRevision } from "@/server/courseApproval";
import { ownedCourse } from "@/server/courses";
import { getDb, transaction } from "@/server/db";
import { deleteThumbnail, storeThumbnail, thumbnailKey } from "@/server/localThumbnail";

export async function POST(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  return safe(async () => {
    requireSameOrigin(request);
    const user = await requireAnyRole(["instructor", "admin"]);
    const courseId = id((await params).courseId);
    const course = ownedCourse(courseId, user);
    if (course.status === "published") throw new ApiError(409, "REVIEW_REQUIRED", "An admin must unpublish this course before changing its thumbnail.");
    if (getDb().prepare("SELECT 1 FROM enrollments WHERE course_id=? LIMIT 1").get(courseId))
      throw new ApiError(409, "COURSE_HAS_LEARNERS", "A course with learners cannot replace its thumbnail through the builder.");
    const lengthHeader = request.headers.get("content-length");
    const stored = await storeThumbnail(request.body, request.headers.get("content-type") || "",
      lengthHeader === null ? null : Number(lengthHeader), request.signal);
    let previousKey: string | null = null;
    try {
      previousKey = transaction((db) => {
        const current = ownedCourse(courseId, user);
        if (current.status === "published") throw new ApiError(409, "REVIEW_REQUIRED", "The course was published during upload. Try again after unpublishing.");
        if (db.prepare("SELECT 1 FROM enrollments WHERE course_id=? LIMIT 1").get(courseId))
          throw new ApiError(409, "COURSE_HAS_LEARNERS", "The course gained learners during upload.");
        db.prepare("UPDATE courses SET thumbnail=?,updated_at=? WHERE id=?")
          .run(stored.url, new Date().toISOString(), courseId);
        markRevision(courseId, user);
        const old = thumbnailKey(current.thumbnail ? String(current.thumbnail) : null);
        return old && !db.prepare("SELECT 1 FROM courses WHERE thumbnail=? LIMIT 1").get(String(current.thumbnail)) ? old : null;
      });
    } catch (error) {
      await deleteThumbnail(stored.key);
      throw error;
    }
    if (previousKey) await deleteThumbnail(previousKey).catch(() => {});
    return json({ url: stored.url }, 201);
  });
}
