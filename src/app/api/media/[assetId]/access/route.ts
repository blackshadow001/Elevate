import { ApiError, id, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { getDb } from "@/server/db";
import { mediaService } from "@/server/integrations";

export async function GET(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  return safe(async () => {
    const user = await requireAuth();
    const asset = getDb().prepare("SELECT * FROM media_assets WHERE id=?").get(id((await params).assetId));
    if (!asset) throw new ApiError(404, "MEDIA_NOT_FOUND", "Media asset not found.");
    if (asset.visibility !== "public" && asset.owner_id !== user.id && user.role !== "admin") {
      const allowed = getDb().prepare(`SELECT 1 FROM lessons l JOIN course_sections s ON s.id=l.section_id
        JOIN enrollments e ON e.course_id=s.course_id WHERE l.video_storage_key=? AND e.user_id=?
        AND e.status IN ('active','completed')`).get(String(asset.storage_key), user.id);
      const preview = getDb().prepare(`SELECT 1 FROM lessons l JOIN course_sections s ON s.id=l.section_id
        JOIN courses c ON c.id=s.course_id WHERE l.video_storage_key=? AND l.is_preview=1
        AND l.status='published' AND c.status='published'`)
        .get(String(asset.storage_key));
      const resource = getDb().prepare(`SELECT 1 FROM course_resources r JOIN enrollments e ON e.course_id=r.course_id
        WHERE r.storage_key=? AND e.user_id=? AND e.status IN ('active','completed')`).get(String(asset.storage_key), user.id);
      if (!allowed && !preview && !resource) throw new ApiError(403, "FORBIDDEN", "You cannot access this media asset.");
    }
    return mediaService.getMediaUrl(String(asset.storage_key));
  });
}
