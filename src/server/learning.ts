import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { ApiError, number } from "@/server/api";
import { SessionUser } from "@/server/auth";
import { getDb, transaction } from "@/server/db";
import { verifiedWatch } from "@/server/videoWatch";

function enrollmentDto(row: Record<string, unknown>) {
  return {
    id: String(row.id), courseId: String(row.course_id), status: String(row.status),
    enrolledAt: String(row.enrolled_at), completedAt: row.completed_at ? String(row.completed_at) : null,
    progressPercent: Number(row.progress_percent),
  };
}

export function enrollFreeCourse(courseId: string, user: SessionUser) {
  return transaction((db) => {
    const course = db.prepare("SELECT id,status,review_status,price_minor FROM courses WHERE id=?").get(courseId);
    if (!course || course.status !== "published" || course.review_status !== "approved") throw new ApiError(404, "COURSE_NOT_FOUND", "This course is unavailable.");
    if (Number(course.price_minor) > 0) throw new ApiError(409, "PAYMENT_REQUIRED", "Paid enrollment is unavailable until a payment provider is configured.");
    const inserted = db.prepare("INSERT OR IGNORE INTO enrollments (id,user_id,course_id) VALUES (?,?,?)")
      .run(randomUUID(), user.id, courseId);
    if (inserted.changes) db.prepare("INSERT INTO notifications (id,user_id,type,title,message) VALUES (?,?,?,?,?)")
      .run(randomUUID(), user.id, "success", "Course enrollment ready", "Your free course is now available in My Learning.");
    return enrollmentDto(db.prepare("SELECT * FROM enrollments WHERE user_id=? AND course_id=?").get(user.id, courseId)!);
  });
}

export function getOwnEnrollments(user: SessionUser) {
  return getDb().prepare(`SELECT e.*,c.slug,c.title,c.thumbnail,c.lesson_count FROM enrollments e
    JOIN courses c ON c.id=e.course_id WHERE e.user_id=? AND e.status IN ('active','completed')
    ORDER BY e.enrolled_at DESC`).all(user.id).map((row) => ({
      ...enrollmentDto(row), course: { slug: String(row.slug), title: String(row.title), thumbnail: row.thumbnail ? String(row.thumbnail) : null, lessonCount: Number(row.lesson_count) },
    }));
}

function requireEnrollment(courseId: string, user: SessionUser) {
  const row = getDb().prepare("SELECT * FROM enrollments WHERE user_id=? AND course_id=? AND status IN ('active','completed')").get(user.id, courseId);
  if (!row) throw new ApiError(403, "NOT_ENROLLED", "Enroll in this course before updating progress.");
  return row;
}

export function getOwnProgress(courseId: string, user: SessionUser) {
  const enrollment = requireEnrollment(courseId, user);
  const lessons = getDb().prepare("SELECT lesson_id,completed,watched_seconds,completed_at FROM lesson_progress WHERE user_id=? AND course_id=?")
    .all(user.id, courseId).map((row) => ({
      lessonId: String(row.lesson_id), completed: Boolean(row.completed), watchedSeconds: Number(row.watched_seconds),
      completedAt: row.completed_at ? String(row.completed_at) : null,
    }));
  return { enrollment: enrollmentDto(enrollment), lessons };
}

export function updateProgress(courseId: string, lessonId: string, user: SessionUser, body: Record<string, unknown>) {
  const completed = body.completed === true;
  if (body.completed !== undefined && typeof body.completed !== "boolean") throw new ApiError(422, "INVALID_INPUT", "completed must be a boolean.");
  const watchedInput = body.watchedSeconds === undefined ? 0 : number(body.watchedSeconds, "watchedSeconds", 0, 86_400);
  if (!Number.isInteger(watchedInput)) throw new ApiError(422, "INVALID_INPUT", "watchedSeconds must be whole seconds.");
  return transaction((db) => {
    requireEnrollment(courseId, user);
    const lesson = db.prepare(`SELECT l.id,l.duration_seconds,l.type,l.video_storage_key FROM lessons l
      JOIN course_sections s ON s.id=l.section_id JOIN courses c ON c.id=s.course_id
      WHERE l.id=? AND s.course_id=? AND l.status='published'`).get(lessonId, courseId);
    if (!lesson) throw new ApiError(404, "LESSON_NOT_FOUND", "This lesson is unavailable in the course.");
    if (completed && lesson.type === "video" && !lesson.video_storage_key) {
      throw new ApiError(409, "LESSON_MEDIA_UNAVAILABLE", "This lesson cannot be completed until its video is available.");
    }
    if (lesson.type === "video" && body.watchedSeconds !== undefined)
      throw new ApiError(409, "WATCH_EVIDENCE_REQUIRED", "Video watch time is recorded by the player.");
    const watch = lesson.type === "video" && completed
      ? verifiedWatch(user.id, lessonId, String(lesson.video_storage_key)) : null;
    if (completed && lesson.type === "video" && !watch?.complete)
      throw new ApiError(409, "WATCH_INCOMPLETE", "Watch at least 90% of the video and reach the end before marking this lesson complete.");
    if (completed && (lesson.type === "quiz" || lesson.type === "project") && !db.prepare(`SELECT 1 FROM lesson_activity_submissions
      WHERE user_id=? AND lesson_id=? AND passed=1 LIMIT 1`).get(user.id, lessonId))
      throw new ApiError(409, "SUBMISSION_REQUIRED", "Submit and pass this activity before completing the lesson.");
    const duration = Number(lesson.duration_seconds);
    const watched = watch ? watch.watchedSeconds : Math.min(watchedInput, duration);
    const now = new Date().toISOString();
    db.prepare(`INSERT INTO lesson_progress
      (id,user_id,lesson_id,course_id,completed,watched_seconds,completed_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?)
      ON CONFLICT(user_id,lesson_id) DO UPDATE SET
        completed=MAX(lesson_progress.completed,excluded.completed),
        watched_seconds=MAX(lesson_progress.watched_seconds,excluded.watched_seconds),
        completed_at=COALESCE(lesson_progress.completed_at,excluded.completed_at),updated_at=excluded.updated_at`)
      .run(randomUUID(), user.id, lessonId, courseId, completed ? 1 : 0, watched, completed ? now : null, now);
    const required = Number(db.prepare(`SELECT COUNT(*) total FROM lessons l JOIN course_sections s ON s.id=l.section_id
      WHERE s.course_id=? AND l.status='published'`).get(courseId)?.total || 0);
    const finished = Number(db.prepare(`SELECT COUNT(*) total FROM lesson_progress p JOIN lessons l ON l.id=p.lesson_id
      JOIN course_sections s ON s.id=l.section_id WHERE p.user_id=? AND s.course_id=? AND p.completed=1 AND l.status='published'`)
      .get(user.id, courseId)?.total || 0);
    const percent = required ? Math.min(100, Math.floor(finished / required * 100)) : 0;
    const courseComplete = required > 0 && finished === required;
    db.prepare(`UPDATE enrollments SET progress_percent=?,status=CASE WHEN ? THEN 'completed' ELSE status END,
      completed_at=CASE WHEN ? THEN COALESCE(completed_at,?) ELSE completed_at END WHERE user_id=? AND course_id=?`)
      .run(percent, courseComplete ? 1 : 0, courseComplete ? 1 : 0, now, user.id, courseId);
    let certificateId: string | null = null;
    if (courseComplete) {
      const course = db.prepare(`SELECT c.title,c.metadata_json,u.name instructor_name FROM courses c
        JOIN users u ON u.id=c.instructor_id WHERE c.id=?`).get(courseId)!;
      const existing = db.prepare("SELECT id FROM certificates WHERE user_id=? AND course_id=?").get(user.id, courseId);
      certificateId = existing ? String(existing.id) : randomUUID();
      if (!existing) {
        const metadata = JSON.parse(String(course.metadata_json)) as Record<string, unknown>;
        const snapshot = JSON.stringify({ studentName: user.name, courseName: course.title, instructorName: course.instructor_name,
          skills: Array.isArray(metadata.whatYouWillLearn) ? metadata.whatYouWillLearn : [], completedAt: now });
        db.prepare(`INSERT OR IGNORE INTO certificates
          (id,user_id,course_id,certificate_number,verification_id,metadata_json) VALUES (?,?,?,?,?,?)`)
          .run(certificateId, user.id, courseId, `LRN-${randomBytes(8).toString("hex").toUpperCase()}`, randomUUID(), snapshot);
        db.prepare("INSERT INTO notifications (id,user_id,type,title,message) VALUES (?,?,?,?,?)")
          .run(randomUUID(), user.id, "success", "Certificate issued", `Your certificate for ${String(course.title)} is ready.`);
      }
    }
    const progress = db.prepare("SELECT completed,watched_seconds,completed_at FROM lesson_progress WHERE user_id=? AND lesson_id=?").get(user.id, lessonId)!;
    return { lessonId, completed: Boolean(progress.completed), watchedSeconds: Number(progress.watched_seconds),
      completedAt: progress.completed_at ? String(progress.completed_at) : null, completedLessons: finished,
      totalLessons: required, progressPercent: percent, courseCompleted: courseComplete, certificateId };
  });
}
