import "server-only";

import { randomUUID } from "node:crypto";
import { ApiError, number, text } from "@/server/api";
import { SessionUser } from "@/server/auth";
import { createCourse, getCourse, ownedCourse, setCourseStatus, updateCourse } from "@/server/courses";
import { getDb, transaction } from "@/server/db";

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
  const hours = /^(\d+)h(?:\s+(\d+)m)?$/i.exec(raw);
  const minutes = /^(\d+)\s*min(?:s|utes?)?$/i.exec(raw);
  const amount = hours ? Number(hours[1]) * 60 + Number(hours[2] || 0) : minutes ? Number(minutes[1]) : NaN;
  if (!Number.isInteger(amount) || amount < 1 || amount > 1440) throw new ApiError(422, "INVALID_DURATION", "Lesson duration must be between 1 minute and 24 hours.");
  return amount * 60;
}

export function saveCourseDraft(user: SessionUser, body: Input) {
  const title = text(body.title, "Title", 3, 200);
  const slug = text(body.slug, "Slug", 3, 100).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new ApiError(422, "INVALID_SLUG", "Slug must use lowercase words separated by hyphens.");
  const subtitle = text(body.subtitle ?? "", "Subtitle", 0, 500);
  const description = text(body.description ?? "", "Description", 0, 20_000);
  const category = text(body.category, "Category", 1, 100);
  const price = number(body.price, "Price", 0, 1_000_000);
  if (!Number.isInteger(Math.round(price * 100)) || Math.abs(price * 100 - Math.round(price * 100)) > 0.00001) throw new ApiError(422, "INVALID_PRICE", "Price supports two decimal places.");
  const image = text(body.image ?? "", "Thumbnail", 0, 2000);
  if (image && !image.startsWith("/") && !image.startsWith("https://")) throw new ApiError(422, "INVALID_THUMBNAIL", "Thumbnail must be a site path or HTTPS URL.");
  const outcomes = lines(body.whatYouWillLearn ?? [], "Learning outcomes");
  const requirements = lines(body.requirements ?? [], "Requirements");
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
      return { title: text(lesson.title, "Lesson title", 1, 200), type,
        durationSeconds: parseMinutes(lesson.duration), description: text(lesson.content ?? "", "Lesson content", 0, 5000) };
    });
    return { title: sectionTitle, lessons };
  });
  if (lessonCount > 500) throw new ApiError(422, "INVALID_CURRICULUM", "A course supports up to 500 lessons.");
  const status = body.status === "Pending Approval" || body.status === "Published" ? "published" : body.status === "Archived" ? "archived" : "draft";
  if (status === "published" && (!subtitle || !description || !image || !outcomes.length || lessonCount === 0)) {
    throw new ApiError(422, "COURSE_INCOMPLETE", "Add a subtitle, description, thumbnail, learning outcomes and lessons before publishing.");
  }

  return transaction((db) => {
    const incomingId = typeof body.id === "string" ? body.id : "";
    const existing = incomingId && !incomingId.startsWith("local-") ? ownedCourse(incomingId, user) : null;
    let courseId: string;
    if (existing) {
      courseId = incomingId;
      if (existing.slug !== slug) throw new ApiError(422, "SLUG_IMMUTABLE", "Course slug cannot be changed after creation.");
      if (db.prepare("SELECT 1 FROM enrollments WHERE course_id=? LIMIT 1").get(courseId)) {
        throw new ApiError(409, "COURSE_HAS_LEARNERS", "This course has learners. Use the individual edit actions instead of replacing its curriculum.");
      }
      updateCourse(courseId, user, { title, subtitle, description, category, level: body.level, language: body.language,
        thumbnail: image || null, ...(body.marginBps === undefined ? { price } : { marginBps: body.marginBps }) });
      db.prepare("DELETE FROM course_sections WHERE course_id=?").run(courseId);
    } else {
      const created = createCourse(user, { title, slug, subtitle, description, category,
        level: body.level, language: body.language, thumbnail: image || undefined, price });
      courseId = created.id;
    }
    db.prepare("UPDATE courses SET metadata_json=? WHERE id=?").run(JSON.stringify({ whatYouWillLearn: outcomes, requirements,
      originalPrice: typeof body.originalPrice === "number" ? body.originalPrice : price }), courseId);
    let durationSeconds = 0;
    sections.forEach((section, position) => {
      const sectionId = randomUUID();
      db.prepare("INSERT INTO course_sections (id,course_id,title,position) VALUES (?,?,?,?)").run(sectionId, courseId, section.title, position);
      section.lessons.forEach((lesson, lessonPosition) => {
        durationSeconds += lesson.durationSeconds;
        db.prepare(`INSERT INTO lessons (id,section_id,title,description,position,type,duration_seconds,is_preview,status)
          VALUES (?,?,?,?,?,?,?,?,?)`).run(randomUUID(), sectionId, lesson.title, lesson.description,
          lessonPosition, lesson.type, lesson.durationSeconds, position === 0 && lessonPosition === 0 ? 1 : 0, "published");
      });
    });
    db.prepare("UPDATE courses SET lesson_count=?,duration_seconds=? WHERE id=?").run(lessonCount, durationSeconds, courseId);
    setCourseStatus(courseId, user, status);
    return getCourse(courseId, false);
  });
}
