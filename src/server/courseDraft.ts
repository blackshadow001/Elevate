import "server-only";

import { randomUUID } from "node:crypto";
import { ApiError, number, text } from "@/server/api";
import { SessionUser } from "@/server/auth";
import { createCourse, getCourse, ownedCourse, setCourseStatus, updateCourse } from "@/server/courses";
import { transaction } from "@/server/db";
import { queueDiscardedVideo } from "@/server/discardedMedia";
import { parseActivity } from "@/server/lessonActivities";
import { requireCatalogCategory, requireCatalogSubcategory } from "@/server/catalogCategories";

type Input = Record<string, unknown>;

function object(value: unknown, label: string): Input {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ApiError(422, "INVALID_INPUT", `${label} must be an object.`);
  return value as Input;
}

function lines(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.length > 50) throw new ApiError(422, "INVALID_INPUT", `${label} must be a list of up to 50 items.`);
  return value.map((item) => text(item, label, 1, 500));
}

function parseMinutes(value: unknown): number {
  const raw = text(value, "Lesson duration", 1, 30);
  const clock = /^(?:(\d+):)?(\d{1,2}):(\d{2})$/.exec(raw);
  if (clock) {
    const seconds = (Number(clock[1] || 0) * 3600) + (Number(clock[2]) * 60) + Number(clock[3]);
    if ((!clock[1] || Number(clock[2]) < 60) && Number(clock[3]) < 60 && seconds >= 1 && seconds <= 86_400) return seconds;
    throw new ApiError(422, "INVALID_DURATION", "Lesson duration must be between 1 second and 24 hours.");
  }
  const hours = /^(\d+)h(?:\s+(\d+)m)?$/i.exec(raw);
  const minutes = /^(\d+)\s*min(?:s|utes?)?$/i.exec(raw);
  const amount = hours ? Number(hours[1]) * 60 + Number(hours[2] || 0) : minutes ? Number(minutes[1]) : NaN;
  if (!Number.isInteger(amount) || amount < 1 || amount > 1440) throw new ApiError(422, "INVALID_DURATION", "Lesson duration must be between 1 minute and 24 hours.");
  return amount * 60;
}

export async function saveCourseDraft(user: SessionUser, body: Input) {
  const title = text(body.title, "Title", 3, 200);
  const slug = text(body.slug, "Slug", 3, 100).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new ApiError(422, "INVALID_SLUG", "Slug must use lowercase words separated by hyphens.");
  const subtitle = text(body.subtitle ?? "", "Subtitle", 0, 500);
  const description = text(body.description ?? "", "Description", 0, 20_000);
  const category = requireCatalogCategory(body.category);
  const subcategory = requireCatalogSubcategory(category, body.subcategory);
  const price = number(body.price, "Price", 0, 1_000_000);
  if (!Number.isInteger(Math.round(price * 100)) || Math.abs(price * 100 - Math.round(price * 100)) > 0.00001) throw new ApiError(422, "INVALID_PRICE", "Price supports two decimal places.");
  const image = text(body.image ?? "", "Thumbnail", 0, 2000);
  if (image && !image.startsWith("/") && !image.startsWith("https://")) throw new ApiError(422, "INVALID_THUMBNAIL", "Thumbnail must be a site path or HTTPS URL.");
  const outcomes = lines(body.whatYouWillLearn ?? [], "Learning outcomes");
  const requirements = lines(body.requirements ?? [], "Requirements");
  const status = body.status === "Pending Approval" || body.status === "Published" ? "published" : body.status === "Archived" ? "archived" : "draft";
  if (!Array.isArray(body.sections) || body.sections.length > 100) throw new ApiError(422, "INVALID_CURRICULUM", "Provide up to 100 sections.");
  let lessonCount = 0;
  const sections = body.sections.map((value) => {
    const section = object(value, "Section");
    const sectionTitle = text(section.title, "Section title", 1, 200);
    if (!Array.isArray(section.lessons) || section.lessons.length > 100) throw new ApiError(422, "INVALID_CURRICULUM", "Each section supports up to 100 lessons.");
    lessonCount += section.lessons.length;
    const lessons = section.lessons.map((value) => {
      const lesson = object(value, "Lesson");
      const type = text(lesson.type, "Lesson type", 1, 20);
      if (!["video", "reading", "quiz", "project"].includes(type)) throw new ApiError(422, "INVALID_TYPE", "Unsupported lesson type.");
      if (lesson.isPreview === true && type !== "video") throw new ApiError(422, "INVALID_PREVIEW", "Only a video lesson can be a free preview.");
      return { id: typeof lesson.id === "string" ? lesson.id : "", title: text(lesson.title, "Lesson title", 1, 200), type,
        isPreview: lesson.isPreview === true,
        durationSeconds: parseMinutes(lesson.duration), description: text(lesson.content ?? "", "Lesson content", 0, 5000),
        activity: parseActivity(lesson.activity, type, status === "published") };
    });
    return { id: typeof section.id === "string" ? section.id : "", title: sectionTitle, lessons };
  });
  if (lessonCount > 500) throw new ApiError(422, "INVALID_CURRICULUM", "A course supports up to 500 lessons.");
  const allLessons = sections.flatMap((section) => section.lessons);
  if (allLessons.filter((lesson) => lesson.isPreview).length > 1)
    throw new ApiError(422, "INVALID_PREVIEW", "Choose only one free preview clip per course.");
  if (status === "published" && allLessons.some((lesson) => lesson.isPreview) && !allLessons.some((lesson) => lesson.type === "video" && !lesson.isPreview))
    throw new ApiError(422, "INVALID_PREVIEW", "Add a separate full video lesson before submitting a preview clip.");
  if (status === "published" && (!subtitle || !description || !image || !outcomes.length || lessonCount === 0)) {
    throw new ApiError(422, "COURSE_INCOMPLETE", "Add a subtitle, description, thumbnail, learning outcomes and lessons before publishing.");
  }

  const course = transaction((db) => {
    const incomingId = typeof body.id === "string" ? body.id : "";
    const existing = incomingId && !incomingId.startsWith("local-") ? ownedCourse(incomingId, user) : null;
    let courseId: string;
    const existingSections = new Set<string>();
    const existingLessons = new Map<string, { storageKey: string | null; mediaDurationSeconds: number | null }>();
    if (existing) {
      courseId = incomingId;
      if (existing.slug !== slug) throw new ApiError(422, "SLUG_IMMUTABLE", "Course slug cannot be changed after creation.");
      if (db.prepare("SELECT 1 FROM enrollments WHERE course_id=? LIMIT 1").get(courseId)) {
        throw new ApiError(409, "COURSE_HAS_LEARNERS", "This course has learners. Use the individual edit actions instead of replacing its curriculum.");
      }
      for (const row of db.prepare("SELECT id FROM course_sections WHERE course_id=?").all(courseId)) existingSections.add(String(row.id));
      for (const row of db.prepare(`SELECT l.id,l.video_storage_key,m.duration_seconds AS media_duration_seconds
        FROM lessons l JOIN course_sections s ON s.id=l.section_id
        LEFT JOIN media_assets m ON m.storage_key=l.video_storage_key WHERE s.course_id=?`).all(courseId))
        existingLessons.set(String(row.id), { storageKey: row.video_storage_key ? String(row.video_storage_key) : null,
          mediaDurationSeconds: row.media_duration_seconds === null ? null : Number(row.media_duration_seconds) });
      updateCourse(courseId, user, { title, subtitle, description, category, level: body.level, language: body.language,
        thumbnail: image || null, ...(body.marginBps === undefined ? { price } : { marginBps: body.marginBps }) });
      db.prepare("DELETE FROM course_sections WHERE course_id=?").run(courseId);
    } else {
      const created = createCourse(user, { title, slug, subtitle, description, category,
        level: body.level, language: body.language, thumbnail: image || undefined, price });
      courseId = created.id;
    }
    db.prepare("UPDATE courses SET metadata_json=? WHERE id=?").run(JSON.stringify({ subcategory, whatYouWillLearn: outcomes, requirements,
      originalPrice: typeof body.originalPrice === "number" ? body.originalPrice : price }), courseId);
    let durationSeconds = 0;
    const usedSectionIds = new Set<string>();
    const usedLessonIds = new Set<string>();
    sections.forEach((section, position) => {
      const sectionId = existingSections.has(section.id) ? section.id : randomUUID();
      if (usedSectionIds.has(sectionId)) throw new ApiError(422, "INVALID_CURRICULUM", "A section appears more than once.");
      usedSectionIds.add(sectionId);
      db.prepare("INSERT INTO course_sections (id,course_id,title,position) VALUES (?,?,?,?)").run(sectionId, courseId, section.title, position);
      section.lessons.forEach((lesson, lessonPosition) => {
        const preserved = existingLessons.get(lesson.id);
        const actualDuration = lesson.type === "video" && preserved?.storageKey && preserved.mediaDurationSeconds
          ? preserved.mediaDurationSeconds : lesson.durationSeconds;
        if (status === "published" && lesson.isPreview && (actualDuration < 30 || actualDuration > 60))
          throw new ApiError(422, "INVALID_PREVIEW", "A free preview clip must be 30–60 seconds long.");
        durationSeconds += actualDuration;
        const lessonId = preserved ? lesson.id : randomUUID();
        if (usedLessonIds.has(lessonId)) throw new ApiError(422, "INVALID_CURRICULUM", "A lesson appears more than once.");
        usedLessonIds.add(lessonId);
        db.prepare(`INSERT INTO lessons (id,section_id,title,description,activity_json,position,type,video_storage_key,duration_seconds,is_preview,status)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(lessonId, sectionId, lesson.title, lesson.description, lesson.activity ? JSON.stringify(lesson.activity) : null,
          lessonPosition, lesson.type, lesson.type === "video" ? preserved?.storageKey || null : null,
          actualDuration, lesson.isPreview ? 1 : 0, "published");
      });
    });
    db.prepare("UPDATE courses SET lesson_count=?,duration_seconds=? WHERE id=?").run(lessonCount, durationSeconds, courseId);
    setCourseStatus(courseId, user, status);
    for (const key of new Set([...existingLessons.values()].map((lesson) => lesson.storageKey).filter((key): key is string => Boolean(key)))) {
      queueDiscardedVideo(db, key);
    }
    return getCourse(courseId, false);
  });
  return course;
}
