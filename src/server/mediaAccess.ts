import "server-only";

import { ApiError, id } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { getDb } from "@/server/db";

export async function authorizedMediaAsset(assetId: string) {
  const user = await requireAuth();
  const db = getDb();
  const asset = db.prepare("SELECT * FROM media_assets WHERE id=?").get(id(assetId));
  if (!asset) throw new ApiError(404, "MEDIA_NOT_FOUND", "Media asset not found.");
  if (asset.visibility !== "public" && asset.owner_id !== user.id && user.role !== "admin") {
    const allowed = db.prepare(`SELECT 1 FROM lessons l JOIN course_sections s ON s.id=l.section_id
      JOIN enrollments e ON e.course_id=s.course_id WHERE l.video_storage_key=? AND e.user_id=?
      AND e.status IN ('active','completed')`).get(String(asset.storage_key), user.id);
    const preview = db.prepare(`SELECT 1 FROM lessons l JOIN course_sections s ON s.id=l.section_id
      JOIN courses c ON c.id=s.course_id WHERE l.video_storage_key=? AND l.is_preview=1
      AND l.status='published' AND c.status='published'`).get(String(asset.storage_key));
    const resource = db.prepare(`SELECT 1 FROM course_resources r JOIN enrollments e ON e.course_id=r.course_id
      WHERE r.storage_key=? AND e.user_id=? AND e.status IN ('active','completed')`).get(String(asset.storage_key), user.id);
    if (!allowed && !preview && !resource) throw new ApiError(403, "FORBIDDEN", "You cannot access this media asset.");
  }
  return { id: String(asset.id), storageKey: String(asset.storage_key), mimeType: String(asset.mime_type), sizeBytes: Number(asset.size_bytes) };
}
