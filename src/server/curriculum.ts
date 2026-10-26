import "server-only";
import { randomUUID } from "node:crypto";
import { ApiError, number, optionalText, text } from "@/server/api";
import { SessionUser } from "@/server/auth";
import { ownedCourse } from "@/server/courses";
import { getDb, transaction } from "@/server/db";
import { markRevision } from "@/server/courseApproval";
import { queueDiscardedVideo } from "@/server/discardedMedia";

function editableCourse(courseId: string, user: SessionUser) {
  const course = ownedCourse(courseId, user);
  if (course.status === "published") throw new ApiError(409, "REVIEW_REQUIRED", "An admin must unpublish this course before curriculum changes.");
  return course;
}

function sectionForCourse(courseId: string, sectionId: string, user: SessionUser) {
  editableCourse(courseId, user);
  const row = getDb().prepare("SELECT * FROM course_sections WHERE id=? AND course_id=?").get(sectionId, courseId);
  if (!row) throw new ApiError(404, "SECTION_NOT_FOUND", "Section not found in this course.");
  return row;
}

function lessonForCourse(courseId: string, lessonId: string, user: SessionUser) {
  editableCourse(courseId, user);
  const row = getDb().prepare(`SELECT l.* FROM lessons l JOIN course_sections s ON s.id=l.section_id
    WHERE l.id=? AND s.course_id=?`).get(lessonId, courseId);
  if (!row) throw new ApiError(404, "LESSON_NOT_FOUND", "Lesson not found in this course.");
  return row;
}

function blockDestructiveEdit(courseId: string) {
  if (getDb().prepare("SELECT 1 FROM enrollments WHERE course_id=? LIMIT 1").get(courseId)) {
    throw new ApiError(409, "COURSE_HAS_LEARNERS", "This course has learners. Archive or replace content without deleting their progress.");
  }
}

function blockProgressChangingEdit(courseId: string) {
  if (getDb().prepare("SELECT 1 FROM enrollments WHERE course_id=? LIMIT 1").get(courseId)) {
    throw new ApiError(409, "COURSE_HAS_LEARNERS", "Published lessons cannot be added or changed after learners enroll.");
  }
}

function updateCourseCounts(courseId: string, user: SessionUser) {
  getDb().prepare(`UPDATE courses SET lesson_count=(SELECT COUNT(*) FROM lessons l JOIN course_sections s ON s.id=l.section_id WHERE s.course_id=?),
    duration_seconds=(SELECT COALESCE(SUM(l.duration_seconds),0) FROM lessons l JOIN course_sections s ON s.id=l.section_id WHERE s.course_id=?),
    updated_at=? WHERE id=?`).run(courseId, courseId, new Date().toISOString(), courseId);
  markRevision(courseId, user);
}

export function addSection(courseId: string, user: SessionUser, body: Record<string, unknown>) {
  editableCourse(courseId, user);
  const title = text(body.title, "Section title", 1, 200);
  return transaction((db) => {
    const position = Number(db.prepare("SELECT COALESCE(MAX(position)+1,0) position FROM course_sections WHERE course_id=?").get(courseId)?.position);
    const id = randomUUID();
    db.prepare("INSERT INTO course_sections (id,course_id,title,position) VALUES (?,?,?,?)").run(id, courseId, title, position);
    markRevision(courseId, user);
    return { id, title, position, lessons: [] };
  });
}

export function editSection(courseId: string, sectionId: string, user: SessionUser, body: Record<string, unknown>) {
  sectionForCourse(courseId, sectionId, user);
  const title = text(body.title, "Section title", 1, 200);
  getDb().prepare("UPDATE course_sections SET title=? WHERE id=?").run(title, sectionId);
  markRevision(courseId, user);
  return { id: sectionId, title };
}

export function deleteSection(courseId: string, sectionId: string, user: SessionUser) {
  sectionForCourse(courseId, sectionId, user);
  blockDestructiveEdit(courseId);
  return transaction((db) => {
    const keys = db.prepare("SELECT video_storage_key FROM lessons WHERE section_id=? AND video_storage_key IS NOT NULL").all(sectionId)
      .map((row) => String(row.video_storage_key));
    db.prepare("DELETE FROM course_sections WHERE id=?").run(sectionId);
    keys.forEach((key) => queueDiscardedVideo(db, key));
    const rows = db.prepare("SELECT id FROM course_sections WHERE course_id=? ORDER BY position").all(courseId);
    db.prepare("UPDATE course_sections SET position=position+100000 WHERE course_id=?").run(courseId);
    rows.forEach((row, index) => db.prepare("UPDATE course_sections SET position=? WHERE id=?").run(index, String(row.id)));
    updateCourseCounts(courseId, user);
    return { deleted: true };
  });
}

export function addLesson(courseId: string, sectionId: string, user: SessionUser, body: Record<string, unknown>) {
  sectionForCourse(courseId, sectionId, user);
  const title = text(body.title, "Lesson title", 1, 200);
  const type = typeof body.type === "string" ? body.type : "video";
  if (!["video", "reading", "quiz", "project"].includes(type)) throw new ApiError(422, "INVALID_TYPE", "Unsupported lesson type.");
  const duration = number(body.durationSeconds ?? 0, "Duration", 0, 86_400);
  if (!Number.isInteger(duration)) throw new ApiError(422, "INVALID_DURATION", "Duration must be whole seconds.");
  return transaction((db) => {
    if (body.status === "published") blockProgressChangingEdit(courseId);
    const position = Number(db.prepare("SELECT COALESCE(MAX(position)+1,0) position FROM lessons WHERE section_id=?").get(sectionId)?.position);
    const id = randomUUID();
    db.prepare(`INSERT INTO lessons (id,section_id,title,description,position,type,duration_seconds,is_preview,status)
      VALUES (?,?,?,?,?,?,?,?,?)`).run(id, sectionId, title, optionalText(body.description, "Description", 5000) || "", position,
      type, duration, body.isPreview === true ? 1 : 0, body.status === "published" ? "published" : "draft");
    updateCourseCounts(courseId, user);
    return { id, sectionId, title, type, durationSeconds: duration, position };
  });
}

export function editLesson(courseId: string, lessonId: string, user: SessionUser, body: Record<string, unknown>) {
  const lesson = lessonForCourse(courseId, lessonId, user);
  const updates: string[] = [];
  const values: Array<string | number> = [];
  if (body.title !== undefined) { updates.push("title=?"); values.push(text(body.title, "Lesson title", 1, 200)); }
  if (body.description !== undefined) { updates.push("description=?"); values.push(text(body.description, "Description", 0, 5000)); }
  if (body.durationSeconds !== undefined) {
    const duration = number(body.durationSeconds, "Duration", 0, 86_400);
    if (!Number.isInteger(duration)) throw new ApiError(422, "INVALID_DURATION", "Duration must be whole seconds.");
    updates.push("duration_seconds=?"); values.push(duration);
  }
  if (body.type !== undefined) {
    if (!["video", "reading", "quiz", "project"].includes(String(body.type))) throw new ApiError(422, "INVALID_TYPE", "Unsupported lesson type.");
    updates.push("type=?"); values.push(String(body.type));
    if (lesson.type === "video" && body.type !== "video") updates.push("video_storage_key=NULL");
  }
  if (body.isPreview !== undefined) {
    if (typeof body.isPreview !== "boolean") throw new ApiError(422, "INVALID_INPUT", "isPreview must be a boolean.");
    updates.push("is_preview=?"); values.push(body.isPreview ? 1 : 0);
  }
  if (body.status !== undefined) {
    if (!["draft", "published"].includes(String(body.status))) throw new ApiError(422, "INVALID_STATUS", "Invalid lesson status.");
    updates.push("status=?"); values.push(String(body.status));
  }
  if (!updates.length) throw new ApiError(422, "NO_CHANGES", "No editable fields were provided.");
  return transaction((db) => {
    if ((body.status !== undefined && body.status !== lesson.status) ||
      (body.type !== undefined && body.type !== lesson.type)) blockProgressChangingEdit(courseId);
    db.prepare(`UPDATE lessons SET ${updates.join(",")} WHERE id=?`).run(...values, lessonId);
    if (lesson.type === "video" && body.type !== undefined && body.type !== "video" && lesson.video_storage_key)
      queueDiscardedVideo(db, String(lesson.video_storage_key));
    updateCourseCounts(courseId, user);
    return { id: lessonId, ...db.prepare("SELECT title,description,type,duration_seconds,is_preview,status FROM lessons WHERE id=?").get(lessonId) };
  });
}

export function deleteLesson(courseId: string, lessonId: string, user: SessionUser) {
  const lesson = lessonForCourse(courseId, lessonId, user);
  blockDestructiveEdit(courseId);
  return transaction((db) => {
    db.prepare("DELETE FROM lessons WHERE id=?").run(lessonId);
    if (lesson.video_storage_key) queueDiscardedVideo(db, String(lesson.video_storage_key));
    const sectionId = String(lesson.section_id);
    const rows = db.prepare("SELECT id FROM lessons WHERE section_id=? ORDER BY position").all(sectionId);
    db.prepare("UPDATE lessons SET position=position+100000 WHERE section_id=?").run(sectionId);
    rows.forEach((row, index) => db.prepare("UPDATE lessons SET position=? WHERE id=?").run(index, String(row.id)));
    updateCourseCounts(courseId, user);
    return { deleted: true };
  });
}

export function reorderSections(courseId: string, user: SessionUser, orderedIds: unknown) {
  editableCourse(courseId, user);
  if (!Array.isArray(orderedIds) || !orderedIds.every((value) => typeof value === "string")) throw new ApiError(422, "INVALID_ORDER", "Provide ordered section IDs.");
  const rows = getDb().prepare("SELECT id FROM course_sections WHERE course_id=?").all(courseId);
  if (rows.length !== orderedIds.length || new Set(orderedIds).size !== rows.length || rows.some((row) => !orderedIds.includes(String(row.id)))) {
    throw new ApiError(422, "INVALID_ORDER", "Order must contain each section exactly once.");
  }
  return transaction((db) => {
    db.prepare("UPDATE course_sections SET position=position+100000 WHERE course_id=?").run(courseId);
    orderedIds.forEach((sectionId, position) => db.prepare("UPDATE course_sections SET position=? WHERE id=?").run(position, sectionId));
    markRevision(courseId, user);
    return { orderedIds };
  });
}

export function reorderLessons(courseId: string, sectionId: string, user: SessionUser, orderedIds: unknown) {
  sectionForCourse(courseId, sectionId, user);
  if (!Array.isArray(orderedIds) || !orderedIds.every((value) => typeof value === "string")) throw new ApiError(422, "INVALID_ORDER", "Provide ordered lesson IDs.");
  const rows = getDb().prepare("SELECT id FROM lessons WHERE section_id=?").all(sectionId);
  if (rows.length !== orderedIds.length || new Set(orderedIds).size !== rows.length || rows.some((row) => !orderedIds.includes(String(row.id)))) {
    throw new ApiError(422, "INVALID_ORDER", "Order must contain each lesson exactly once.");
  }
  return transaction((db) => {
    db.prepare("UPDATE lessons SET position=position+100000 WHERE section_id=?").run(sectionId);
    orderedIds.forEach((lessonId, position) => db.prepare("UPDATE lessons SET position=? WHERE id=?").run(position, lessonId));
    markRevision(courseId, user);
    return { orderedIds };
  });
}
