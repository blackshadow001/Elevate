import "server-only";

import { ApiError } from "@/server/api";
import { getDb } from "@/server/db";
import { deleteThumbnail, storeThumbnail, thumbnailStat, thumbnailStream } from "@/server/localThumbnail";

const avatarPattern = /^\/api\/avatars\/([0-9a-f-]{36}\.(?:jpg|png|webp))$/;

export function avatarKey(url: string | null | undefined): string | null {
  return avatarPattern.exec(url || "")?.[1] || null;
}

export async function saveAvatar(userId: string, request: Request): Promise<string> {
  const lengthHeader = request.headers.get("content-length");
  const stored = await storeThumbnail(request.body, request.headers.get("content-type") || "",
    lengthHeader === null ? null : Number(lengthHeader), request.signal);
  const url = `/api/avatars/${stored.key}`;
  let oldKey: string | null = null;
  try {
    const db = getDb();
    const old = db.prepare("SELECT avatar FROM users WHERE id=? AND status='active'").get(userId);
    if (!old) throw new ApiError(401, "UNAUTHENTICATED", "Sign in to continue.");
    db.prepare("UPDATE users SET avatar=?,updated_at=? WHERE id=?").run(url, new Date().toISOString(), userId);
    oldKey = avatarKey(old.avatar ? String(old.avatar) : null);
  } catch (error) {
    await deleteThumbnail(stored.key).catch(() => {});
    throw error;
  }
  if (oldKey) await deleteThumbnail(oldKey).catch(() => {});
  return url;
}

export async function removeAvatar(userId: string): Promise<void> {
  const db = getDb();
  const old = db.prepare("SELECT avatar FROM users WHERE id=? AND status='active'").get(userId);
  if (!old) throw new ApiError(401, "UNAUTHENTICATED", "Sign in to continue.");
  db.prepare("UPDATE users SET avatar=NULL,updated_at=? WHERE id=?").run(new Date().toISOString(), userId);
  const key = avatarKey(old.avatar ? String(old.avatar) : null);
  if (key) await deleteThumbnail(key).catch(() => {});
}

export async function publicAvatarResponse(key: string): Promise<Response> {
  const url = `/api/avatars/${key}`;
  if (avatarKey(url) !== key || !getDb().prepare("SELECT 1 FROM users WHERE avatar=? AND status='active'").get(url))
    throw new ApiError(404, "AVATAR_NOT_FOUND", "Profile photo not found.");
  const file = await thumbnailStat(key).catch(() => { throw new ApiError(404, "AVATAR_NOT_FOUND", "Profile photo not found."); });
  const extension = key.split(".").pop();
  const mimeType = extension === "jpg" ? "image/jpeg" : extension === "png" ? "image/png" : "image/webp";
  return new Response(thumbnailStream(key), { headers: {
    "Content-Type": mimeType, "Content-Length": String(file.size),
    "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
  } });
}
