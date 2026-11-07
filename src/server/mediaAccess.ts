import "server-only";

import { ApiError, id } from "@/server/api";
import { currentUser } from "@/server/auth";
import { getDb } from "@/server/db";

export async function authorizedMediaAsset(assetId: string) {
  const user = await currentUser();
  const db = getDb();
  const asset = db.prepare("SELECT * FROM media_assets WHERE id=?").get(id(assetId));
  if (!asset) throw new ApiError(404, "MEDIA_NOT_FOUND", "Media asset not found.");
  if (asset.visibility !== "public" && asset.owner_id !== user?.id && user?.role !== "admin") {
    const allowed = db.prepare(`SELECT 1 FROM lessons l JOIN course_sections s ON s.id=l.section_id
      JOIN enrollments e ON e.course_id=s.course_id WHERE l.video_storage_key=? AND e.user_id=?
      AND e.status IN ('active','completed')`).get(String(asset.storage_key), user?.id || "");
    const preview = db.prepare(`SELECT 1 FROM lessons l JOIN course_sections s ON s.id=l.section_id
      JOIN courses c ON c.id=s.course_id WHERE l.video_storage_key=? AND l.is_preview=1
      AND l.status='published' AND l.duration_seconds BETWEEN 30 AND 60
      AND c.status='published' AND c.review_status='approved' AND ? BETWEEN 30 AND 60`).get(String(asset.storage_key), Number(asset.duration_seconds || 0));
    const resource = db.prepare(`SELECT 1 FROM course_resources r JOIN enrollments e ON e.course_id=r.course_id
      WHERE r.storage_key=? AND e.user_id=? AND e.status IN ('active','completed')`).get(String(asset.storage_key), user?.id || "");
    const recording = db.prepare(`SELECT 1 FROM live_class_recordings r
      JOIN live_classes l ON l.id=r.live_class_id
      WHERE r.asset_id=? AND l.status='ended' AND (
        l.course_id IS NULL OR EXISTS(SELECT 1 FROM enrollments e WHERE e.course_id=l.course_id
          AND e.user_id=? AND e.status IN ('active','completed'))
        OR EXISTS(SELECT 1 FROM bootcamp_sessions s JOIN bootcamp_registrations b ON b.bootcamp_id=s.bootcamp_id
          WHERE s.live_class_id=l.id AND b.user_id=?))`).get(String(asset.id), user?.id || "", user?.id || "");
    if (!allowed && !preview && !resource && !recording) throw user
      ? new ApiError(403, "FORBIDDEN", "You cannot access this media asset.")
      : new ApiError(401, "AUTH_REQUIRED", "Sign in to access this media asset.");
  }
  return { id: String(asset.id), storageKey: String(asset.storage_key), mimeType: String(asset.mime_type), sizeBytes: Number(asset.size_bytes) };
}
