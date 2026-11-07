import "server-only";
import { randomUUID } from "node:crypto";
import { ApiError, number, optionalText, text } from "@/server/api";
import { SessionUser } from "@/server/auth";
import { getDb } from "@/server/db";
import { markRevision, pricingForCourse, proposal } from "@/server/courseApproval";
import { readActivity } from "@/server/lessonActivities";
import { catalogCategory } from "@/lib/catalogTaxonomy";
import { requireCatalogCategory } from "@/server/catalogCategories";

type Row = Record<string, unknown>;
const courseSelect = `SELECT c.id,c.slug,c.title,c.subtitle,c.description,c.category,c.level,c.language,
  c.thumbnail,c.price_minor,c.currency,c.status,c.rating,c.duration_seconds,c.lesson_count,
  c.metadata_json,c.review_status,
  c.created_at,c.updated_at,c.published_at,c.instructor_id,u.name instructor_name,u.avatar instructor_avatar
  FROM courses c JOIN users u ON u.id=c.instructor_id`;

export function courseDto(row: Row) {
  const counts = getDb().prepare(`SELECT
    (SELECT COUNT(*) FROM enrollments WHERE course_id=?) learners,
    (SELECT COUNT(*) FROM reviews WHERE course_id=?) reviews`).get(String(row.id), String(row.id));
  const lastFeedback = getDb().prepare(`SELECT feedback FROM course_approval_history WHERE course_id=?
    AND action IN ('rejected','pricing_rejected','pricing_changes_requested') ORDER BY created_at DESC LIMIT 1`).get(String(row.id));
  return {
    id: String(row.id), slug: String(row.slug), title: String(row.title), subtitle: String(row.subtitle),
    description: String(row.description), category: catalogCategory(String(row.category)), level: String(row.level),
    language: String(row.language), thumbnail: row.thumbnail ? String(row.thumbnail) : null,
    price: Number(row.price_minor) / 100, currency: String(row.currency),
    status: row.status === "published" ? "published" : String(row.review_status || row.status),
    reviewStatus: String(row.review_status || "draft"), pricing: pricingForCourse(String(row.id)),
    reviewFeedback: lastFeedback?.feedback ? String(lastFeedback.feedback) : null,
    rating: Number(row.rating), durationSeconds: Number(row.duration_seconds), lessonCount: Number(row.lesson_count),
    studentsCount: Number(counts?.learners || 0), ratingCount: Number(counts?.reviews || 0),
    instructor: { id: String(row.instructor_id), name: String(row.instructor_name), avatar: row.instructor_avatar ? String(row.instructor_avatar) : null },
    metadata: JSON.parse(String(row.metadata_json || "{}")),
    createdAt: String(row.created_at), updatedAt: String(row.updated_at), publishedAt: row.published_at ? String(row.published_at) : null,
  };
}

export function listCourses(params: URLSearchParams) {
  const where = ["c.status='published'", "c.review_status='approved'"];
  const values: Array<string | number> = [];
  const search = params.get("search")?.trim();
  if (search) {
    if (search.length > 100) throw new ApiError(422, "INVALID_FILTER", "Search must be 100 characters or fewer.");
    where.push("(c.title LIKE ? ESCAPE '\\' OR c.description LIKE ? ESCAPE '\\' OR u.name LIKE ? ESCAPE '\\' OR c.category LIKE ? ESCAPE '\\')");
    const query = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
    values.push(query, query, query, query);
  }
  for (const [name, column] of [["category", "c.category"], ["level", "c.level"], ["language", "c.language"]] as const) {
    const value = params.get(name);
    if (value) {
      if (value.length > 100) throw new ApiError(422, "INVALID_FILTER", `${name} is too long.`);
      where.push(`${column}=?`);
      values.push(value);
    }
  }
  if (params.has("maxPrice")) { where.push("c.price_minor<=?"); values.push(number(Number(params.get("maxPrice")) * 100, "maxPrice", 0, 100_000_000)); }
  if (params.has("minRating")) { where.push("c.rating>=?"); values.push(number(Number(params.get("minRating")), "minRating", 0, 5)); }
  if (params.has("maxDurationHours")) { where.push("c.duration_seconds<=?"); values.push(number(Number(params.get("maxDurationHours")) * 3600, "maxDurationHours", 0, 100_000)); }
  const sort = params.get("sort") || "newest";
  const sorts: Record<string, string> = {
    newest: "c.published_at DESC", popular: "(SELECT COUNT(*) FROM enrollments e WHERE e.course_id=c.id) DESC",
    rating: "c.rating DESC", price_asc: "c.price_minor ASC", price_desc: "c.price_minor DESC",
  };
  if (!sorts[sort]) throw new ApiError(422, "INVALID_SORT", "Unsupported sort order.");
  const page = number(Number(params.get("page") || "1"), "page", 1, 100_000);
  const pageSize = number(Number(params.get("pageSize") || "12"), "pageSize", 1, 50);
  if (!Number.isInteger(page) || !Number.isInteger(pageSize)) throw new ApiError(422, "INVALID_PAGE", "Pagination values must be whole numbers.");
  const db = getDb();
  const clause = where.join(" AND ");
  const total = Number(db.prepare(`SELECT COUNT(*) total FROM courses c JOIN users u ON u.id=c.instructor_id WHERE ${clause}`).get(...values)?.total || 0);
  const rows = db.prepare(`${courseSelect} WHERE ${clause} ORDER BY ${sorts[sort]},c.id LIMIT ? OFFSET ?`)
    .all(...values, pageSize, (page - 1) * pageSize);
  return { items: rows.map(courseDto), total, page, pageSize };
}

export function getCourse(idOrSlug: string, publishedOnly = true) {
  const db = getDb();
  const row = db.prepare(`${courseSelect} WHERE (c.id=? OR c.slug=?) ${publishedOnly ? "AND c.status='published' AND c.review_status='approved'" : ""}`).get(idOrSlug, idOrSlug);
  if (!row) throw new ApiError(404, "COURSE_NOT_FOUND", "This course is unavailable.");
  const sections = db.prepare("SELECT id,title,position FROM course_sections WHERE course_id=? ORDER BY position").all(String(row.id));
  return {
    ...courseDto(row),
    sections: sections.map((section) => ({
      id: String(section.id), title: String(section.title), position: Number(section.position),
      lessons: db.prepare(`SELECT l.id,l.title,l.description,l.activity_json,l.position,l.type,l.duration_seconds,l.is_preview,l.status,
        m.id media_asset_id FROM lessons l LEFT JOIN media_assets m ON m.storage_key=l.video_storage_key
        WHERE l.section_id=? ${publishedOnly ? "AND l.status='published'" : ""} ORDER BY l.position`).all(String(section.id)).map((lesson) => ({
          id: String(lesson.id), title: String(lesson.title), description: String(lesson.description),
          activity: publishedOnly ? null : readActivity(lesson.activity_json),
          position: Number(lesson.position), type: String(lesson.type), durationSeconds: Number(lesson.duration_seconds),
          isPreview: Boolean(lesson.is_preview), status: String(lesson.status),
          mediaAssetId: lesson.media_asset_id ? String(lesson.media_asset_id) : null,
        })),
    })),
  };
}

export function ownedCourse(id: string, user: SessionUser): Row {
  const row = getDb().prepare("SELECT * FROM courses WHERE id=?").get(id);
  if (!row) throw new ApiError(404, "COURSE_NOT_FOUND", "Course not found.");
  if (user.role !== "admin" && row.instructor_id !== user.id) throw new ApiError(403, "FORBIDDEN", "You can manage only your own courses.");
  return row;
}

export function createCourse(user: SessionUser, body: Record<string, unknown>) {
  const title = text(body.title, "Title", 3, 200);
  const slug = text(body.slug, "Slug", 3, 100).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new ApiError(422, "INVALID_SLUG", "Slug must use lowercase words separated by hyphens.");
  const price = number(body.price ?? 0, "Price", 0, 1_000_000);
  const category = requireCatalogCategory(body.category ?? "Technology & Programming");
  if (!Number.isInteger(price * 100)) throw new ApiError(422, "INVALID_PRICE", "Price supports two decimal places.");
  const id = randomUUID();
  const db = getDb();
  if (db.prepare("SELECT 1 FROM courses WHERE slug=?").get(slug)) throw new ApiError(409, "SLUG_EXISTS", "A course already uses this slug.");
  db.prepare(`INSERT INTO courses
    (id,title,slug,subtitle,description,category,level,language,thumbnail,instructor_id,price_minor,currency)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    id, title, slug, optionalText(body.subtitle, "Subtitle", 500) || "", optionalText(body.description, "Description", 20_000) || "",
    category,
    body.level === "Intermediate" || body.level === "Advanced" ? body.level : "Beginner",
    typeof body.language === "string" ? text(body.language, "Language", 2, 60) : "English",
    typeof body.thumbnail === "string" ? text(body.thumbnail, "Thumbnail", 1, 2000) : null,
    user.id, 0, "INR"
  );
  proposal(id, user, { price });
  return getCourse(id, false);
}

export function updateCourse(id: string, user: SessionUser, body: Record<string, unknown>) {
  const course = ownedCourse(id, user);
  if (course.status === "published") throw new ApiError(409, "REVIEW_REQUIRED", "An admin must unpublish this course before content changes.");
  for (const key of ["basePriceMinor", "minMarginBps", "maxMarginBps", "maxFinalMinor", "approvedMarginBps", "currency", "price_minor", "review_status"]) {
    if (key in body) throw new ApiError(403, "ADMIN_FIELD", `${key} is managed by an admin.`);
  }
  const map: Record<string, string> = {
    title: "title", subtitle: "subtitle", description: "description", category: "category",
    level: "level", language: "language", thumbnail: "thumbnail",
  };
  const updates: string[] = [];
  const values: Array<string | number | null> = [];
  for (const [field, column] of Object.entries(map)) {
    if (!(field in body)) continue;
    let value: string | number | null;
    if (field === "level") {
      if (!["Beginner", "Intermediate", "Advanced"].includes(String(body.level))) throw new ApiError(422, "INVALID_LEVEL", "Invalid course level.");
      value = String(body.level);
    } else if (field === "category") {
      value = requireCatalogCategory(body.category);
    } else if (field === "thumbnail") {
      value = body.thumbnail === null ? null : text(body.thumbnail, "Thumbnail", 1, 2000);
    } else {
      value = text(body[field], field, field === "description" || field === "subtitle" ? 0 : 1, field === "description" ? 20_000 : 500);
    }
    updates.push(`${column}=?`);
    values.push(value);
  }
  if (!updates.length && body.price === undefined && body.marginBps === undefined) throw new ApiError(422, "NO_CHANGES", "No editable fields were provided.");
  if (updates.length) getDb().prepare(`UPDATE courses SET ${updates.join(",")},updated_at=? WHERE id=?`)
    .run(...values, new Date().toISOString(), id);
  if (body.price !== undefined || body.marginBps !== undefined) proposal(id, user, body);
  markRevision(id, user);
  return getCourse(id, false);
}

export function setCourseStatus(id: string, user: SessionUser, status: "draft" | "published" | "archived") {
  const row = ownedCourse(id, user);
  const db = getDb();
  if (row.status === "published") throw new ApiError(403, "ADMIN_ONLY", "Only an admin can unpublish a course.");
  if (status === "published") {
    if (row.status === "archived" || !["draft", "rejected", "unpublished"].includes(String(row.review_status)))
      throw new ApiError(409, "INVALID_TRANSITION", "Edit or restore this course before submitting it for review.");
    const count = Number(db.prepare(`SELECT COUNT(*) total FROM lessons l JOIN course_sections s ON s.id=l.section_id
      WHERE s.course_id=? AND l.status='published'`).get(id)?.total || 0);
    if (!String(row.description).trim() || !row.thumbnail || count === 0) {
      throw new ApiError(422, "COURSE_INCOMPLETE", "Add a description, thumbnail, section and published lesson before publishing.");
    }
    const missingMedia = db.prepare(`SELECT 1 FROM lessons l JOIN course_sections s ON s.id=l.section_id
      WHERE s.course_id=? AND l.status='published' AND l.type='video' AND (l.video_storage_key IS NULL OR l.video_storage_key='') LIMIT 1`).get(id);
    if (missingMedia) throw new ApiError(422, "COURSE_MEDIA_INCOMPLETE", "Add hosted media to every video lesson before submitting for review.");
    const incompleteActivity = db.prepare(`SELECT 1 FROM lessons l JOIN course_sections s ON s.id=l.section_id
      WHERE s.course_id=? AND l.status='published' AND l.type IN ('quiz','project') AND l.activity_json IS NULL LIMIT 1`).get(id);
    if (incompleteActivity) throw new ApiError(422, "COURSE_ACTIVITY_INCOMPLETE", "Add quiz questions and assignment instructions before submitting.");
    const emptyReading = db.prepare(`SELECT 1 FROM lessons l JOIN course_sections s ON s.id=l.section_id
      WHERE s.course_id=? AND l.status='published' AND l.type='reading' AND trim(l.description)='' AND l.activity_json IS NULL LIMIT 1`).get(id);
    if (emptyReading) throw new ApiError(422, "COURSE_READING_INCOMPLETE", "Add content to every published reading lesson before publishing.");
  }
  if (status === "published") {
    db.prepare("UPDATE courses SET review_status='pending_approval',updated_at=? WHERE id=?")
      .run(new Date().toISOString(), id);
    db.prepare("INSERT INTO course_approval_history(id,course_id,actor_id,action) VALUES (?,?,?,'submitted')")
      .run(randomUUID(), id, user.id);
  } else {
    db.prepare("UPDATE courses SET status=?,review_status='draft',updated_at=? WHERE id=?")
      .run(status, new Date().toISOString(), id);
  }
  return getCourse(id, false);
}
