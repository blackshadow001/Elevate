import { randomUUID } from "node:crypto";
import { ApiError, id, json, requireSameOrigin, safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { ownedCourse } from "@/server/courses";
import { markRevision } from "@/server/courseApproval";
import { getDb, transaction } from "@/server/db";
import { queueDiscardedVideo } from "@/server/discardedMedia";
import { deleteLocalMedia, storeVideoStream } from "@/server/localMedia";

export async function POST(request: Request, { params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  return safe(async () => {
    requireSameOrigin(request);
    const user = await requireAnyRole(["instructor", "admin"]);
    const { courseId: rawCourseId, lessonId: rawLessonId } = await params;
    const courseId = id(rawCourseId);
    const lessonId = id(rawLessonId);
    const course = ownedCourse(courseId, user);
    if (course.status === "published") throw new ApiError(409, "REVIEW_REQUIRED", "An admin must unpublish this course before changing its video.");
    const db = getDb();
    const lesson = db.prepare(`SELECT l.type,l.video_storage_key FROM lessons l JOIN course_sections s ON s.id=l.section_id
      WHERE l.id=? AND s.course_id=?`).get(lessonId, courseId);
    if (!lesson) throw new ApiError(404, "LESSON_NOT_FOUND", "Lesson not found in this course.");
    if (lesson.type !== "video") throw new ApiError(422, "INVALID_LESSON_TYPE", "Only video lessons accept a video upload.");
    if (db.prepare("SELECT 1 FROM enrollments WHERE course_id=? LIMIT 1").get(courseId))
      throw new ApiError(409, "COURSE_HAS_LEARNERS", "A course with learners cannot replace its video through the builder.");
    const mimeType = request.headers.get("content-type") || "";
    const lengthHeader = request.headers.get("content-length");
    const declaredSize = lengthHeader === null ? null : Number(lengthHeader);
    const durationHeader = request.headers.get("x-video-duration-seconds");
    const durationSeconds = durationHeader === null ? null : Number(durationHeader);
    if (durationHeader !== null && (!Number.isSafeInteger(durationSeconds) || durationSeconds === null || durationSeconds < 1 || durationSeconds > 86_400))
      throw new ApiError(422, "INVALID_DURATION", "Video duration must be between 1 second and 24 hours.");
    const stored = await storeVideoStream(request.body, mimeType, declaredSize, request.signal);
    const assetId = randomUUID();
    try {
      transaction((tx) => {
        const current = tx.prepare(`SELECT l.video_storage_key FROM lessons l JOIN course_sections s ON s.id=l.section_id
          WHERE l.id=? AND s.course_id=? AND l.type='video'`).get(lessonId, courseId);
        if (!current) throw new ApiError(409, "LESSON_CHANGED", "The lesson changed during upload. Try again.");
        tx.prepare(`INSERT INTO media_assets(id,owner_id,storage_key,mime_type,size_bytes,duration_seconds,visibility)
          VALUES (?,?,?,?,?,?,?)`).run(assetId, String(course.instructor_id), stored.storageKey, mimeType, stored.sizeBytes, durationSeconds, "private");
        tx.prepare("UPDATE lessons SET video_storage_key=?,duration_seconds=COALESCE(?,duration_seconds) WHERE id=?")
          .run(stored.storageKey, durationSeconds, lessonId);
        tx.prepare(`UPDATE courses SET duration_seconds=(SELECT COALESCE(SUM(l.duration_seconds),0)
          FROM lessons l JOIN course_sections s ON s.id=l.section_id WHERE s.course_id=?) WHERE id=?`).run(courseId, courseId);
        markRevision(courseId, user);
        const previous = current.video_storage_key ? String(current.video_storage_key) : null;
        if (previous) queueDiscardedVideo(tx, previous);
      });
    } catch (error) {
      await deleteLocalMedia(stored.storageKey);
      throw error;
    }
    return json({ assetId, lessonId, sizeBytes: stored.sizeBytes, mimeType, durationSeconds,
      url: `/api/media/${assetId}/stream` }, 201);
  });
}
