import { randomUUID } from "node:crypto";
import { ApiError, id, json, requireSameOrigin, safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { getDb, transaction } from "@/server/db";
import { queueDiscardedVideo } from "@/server/discardedMedia";
import { deleteLocalMedia, storeVideoStream } from "@/server/localMedia";

type Context = { params: Promise<{ classId: string }> };

export async function POST(request: Request, { params }: Context) {
  return safe(async () => {
    requireSameOrigin(request);
    const user = await requireAnyRole(["instructor", "admin"]);
    const classId = id((await params).classId);
    const row = getDb().prepare("SELECT instructor_id,status,title FROM live_classes WHERE id=?").get(classId);
    if (!row) throw new ApiError(404, "LIVE_CLASS_NOT_FOUND", "Live class not found.");
    if (user.role !== "admin" && row.instructor_id !== user.id) throw new ApiError(403, "FORBIDDEN", "You can upload only your own class recording.");
    if (row.status !== "ended") throw new ApiError(409, "CLASS_NOT_ENDED", "Finish the class before uploading its recording.");
    const mimeType = request.headers.get("content-type") || "";
    const length = request.headers.get("content-length");
    const stored = await storeVideoStream(request.body, mimeType, length === null ? null : Number(length), request.signal);
    const assetId = randomUUID();
    try {
      transaction((db) => {
        const previous = db.prepare(`SELECT m.storage_key FROM live_class_recordings r JOIN media_assets m ON m.id=r.asset_id
          WHERE r.live_class_id=?`).get(classId)?.storage_key;
        db.prepare("DELETE FROM live_class_recordings WHERE live_class_id=?").run(classId);
        db.prepare(`INSERT INTO media_assets(id,owner_id,storage_key,mime_type,size_bytes,visibility)
          VALUES (?,?,?,?,?,'private')`).run(assetId, String(row.instructor_id), stored.storageKey, mimeType, stored.sizeBytes);
        db.prepare("INSERT INTO live_class_recordings(live_class_id,asset_id,title) VALUES (?,?,?)")
          .run(classId, assetId, String(row.title));
        if (previous) queueDiscardedVideo(db, String(previous));
      });
    } catch (error) {
      await deleteLocalMedia(stored.storageKey);
      throw error;
    }
    return json({ assetId, url: `/api/media/${assetId}/stream` }, 201);
  });
}
