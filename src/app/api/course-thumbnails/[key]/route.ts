import { ApiError, safe } from "@/server/api";
import { currentUser } from "@/server/auth";
import { getDb } from "@/server/db";
import { thumbnailKey, thumbnailStat, thumbnailStream } from "@/server/localThumbnail";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  return safe(async () => {
    const key = (await params).key;
    const url = `/api/course-thumbnails/${key}`;
    if (thumbnailKey(url) !== key) throw new ApiError(404, "THUMBNAIL_NOT_FOUND", "Thumbnail not found.");
    const row = getDb().prepare("SELECT instructor_id,status,review_status FROM courses WHERE thumbnail=? LIMIT 1").get(url);
    if (!row) throw new ApiError(404, "THUMBNAIL_NOT_FOUND", "Thumbnail not found.");
    if (row.status !== "published" || row.review_status !== "approved") {
      const user = await currentUser();
      if (!user || (user.role !== "admin" && user.id !== row.instructor_id))
        throw new ApiError(404, "THUMBNAIL_NOT_FOUND", "Thumbnail not found.");
    }
    const file = await thumbnailStat(key).catch(() => { throw new ApiError(404, "THUMBNAIL_NOT_FOUND", "Thumbnail file not found."); });
    const extension = key.split(".").pop();
    const mimeType = extension === "jpg" ? "image/jpeg" : extension === "png" ? "image/png" : "image/webp";
    return new Response(thumbnailStream(key), { headers: {
      "Content-Type": mimeType, "Content-Length": String(file.size), "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
    } });
  });
}
