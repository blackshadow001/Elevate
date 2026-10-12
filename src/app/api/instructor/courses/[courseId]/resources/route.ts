import { randomUUID } from "node:crypto";
import { ApiError, id, json, readJson, safe, text } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { ownedCourse } from "@/server/courses";
import { getDb } from "@/server/db";
import { markRevision } from "@/server/courseApproval";

export async function POST(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  return safe(async () => {
    const user = await requireAnyRole(["instructor", "admin"]);
    const courseId = id((await params).courseId);
    const course = ownedCourse(courseId, user);
    if (course.status === "published") throw new ApiError(409, "REVIEW_REQUIRED", "An admin must unpublish this course before resource changes.");
    const body = await readJson(request);
    const name = text(body.name, "Resource name", 1, 200);
    const type = text(body.type, "Resource type", 1, 50);
    const lessonId = body.lessonId === undefined || body.lessonId === null ? null : id(text(body.lessonId, "Lesson ID", 1, 100));
    if (lessonId && !getDb().prepare(`SELECT 1 FROM lessons l JOIN course_sections s ON s.id=l.section_id
      WHERE l.id=? AND s.course_id=?`).get(lessonId, courseId)) throw new ApiError(404, "LESSON_NOT_FOUND", "Lesson not found in this course.");
    const storageKey = body.storageKey === undefined || body.storageKey === null ? null : text(body.storageKey, "Storage key", 1, 500);
    const externalUrl = body.externalUrl === undefined || body.externalUrl === null ? null : text(body.externalUrl, "URL", 1, 2000);
    if (Boolean(storageKey) === Boolean(externalUrl)) throw new ApiError(422, "INVALID_RESOURCE", "Provide exactly one storage key or HTTPS URL.");
    if (externalUrl) {
      let parsed: URL;
      try { parsed = new URL(externalUrl); } catch { throw new ApiError(422, "INVALID_URL", "Provide a valid HTTPS URL."); }
      if (parsed.protocol !== "https:") throw new ApiError(422, "INVALID_URL", "Resource URL must use HTTPS.");
    }
    if (storageKey) {
      const asset = getDb().prepare("SELECT owner_id FROM media_assets WHERE storage_key=?").get(storageKey);
      if (!asset || (user.role !== "admin" && asset.owner_id !== user.id)) throw new ApiError(403, "FORBIDDEN", "You can attach only your own uploaded media.");
    }
    const resourceId = randomUUID();
    getDb().prepare(`INSERT INTO course_resources
      (id,course_id,lesson_id,name,type,storage_key,external_url) VALUES (?,?,?,?,?,?,?)`)
      .run(resourceId, courseId, lessonId, name, type, storageKey, externalUrl);
    markRevision(courseId, user);
    return json({ id: resourceId, name, type, lessonId, externalUrl, privateMedia: Boolean(storageKey) }, 201);
  });
}
