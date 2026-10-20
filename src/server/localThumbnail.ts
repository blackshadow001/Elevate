import "server-only";

import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, open, rename, stat, unlink } from "node:fs/promises";
import { join } from "node:path";
import { Readable } from "node:stream";
import { ApiError } from "@/server/api";
import { mediaDirectory } from "@/server/localMedia";

export const MAX_THUMBNAIL_SIZE_BYTES = 5_000_000;
const types: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const keyPattern = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;

export function thumbnailKey(url: string | null | undefined): string | null {
  const match = /^\/api\/course-thumbnails\/([^/?]+)$/.exec(url || "");
  return match && keyPattern.test(match[1]) ? match[1] : null;
}

export function thumbnailPath(key: string): string {
  if (!keyPattern.test(key)) throw new ApiError(404, "THUMBNAIL_NOT_FOUND", "Thumbnail not found.");
  return join(mediaDirectory(), key);
}

function matchesSignature(bytes: Uint8Array, mimeType: string): boolean {
  if (mimeType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return bytes.length >= 8 && Buffer.from(bytes.subarray(0, 8)).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return bytes.length >= 12 && Buffer.from(bytes.subarray(0, 4)).toString() === "RIFF" && Buffer.from(bytes.subarray(8, 12)).toString() === "WEBP";
}

export async function storeThumbnail(stream: ReadableStream<Uint8Array> | null, mimeType: string,
  declaredSize: number | null, signal: AbortSignal): Promise<{ key: string; url: string }> {
  if (!stream) throw new ApiError(400, "EMPTY_UPLOAD", "Choose a thumbnail image.");
  const extension = types[mimeType];
  if (!extension) throw new ApiError(415, "INVALID_MEDIA_TYPE", "Choose a JPG, PNG or WebP image.");
  if (declaredSize !== null && (!Number.isSafeInteger(declaredSize) || declaredSize < 1 || declaredSize > MAX_THUMBNAIL_SIZE_BYTES))
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Thumbnail must be no larger than 5 MB.");
  await mkdir(mediaDirectory(), { recursive: true });
  const key = `${randomUUID()}.${extension}`;
  const temporary = `${thumbnailPath(key)}.part`;
  const file = await open(temporary, "wx", 0o600);
  const reader = stream.getReader();
  let written = 0;
  let head = new Uint8Array(0);
  try {
    while (true) {
      if (signal.aborted) throw new ApiError(400, "UPLOAD_INTERRUPTED", "Thumbnail upload was interrupted. Try again.");
      const { done, value } = await reader.read();
      if (done) break;
      written += value.byteLength;
      if (written > MAX_THUMBNAIL_SIZE_BYTES) throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Thumbnail must be no larger than 5 MB.");
      if (head.length < 12) {
        const combined = new Uint8Array(Math.min(12, head.length + value.length));
        combined.set(head);
        combined.set(value.subarray(0, combined.length - head.length), head.length);
        head = combined;
      }
      let offset = 0;
      while (offset < value.length) offset += (await file.write(value, offset, value.length - offset)).bytesWritten;
    }
    if (!written || (declaredSize !== null && written !== declaredSize))
      throw new ApiError(400, "UPLOAD_INTERRUPTED", "Thumbnail upload was incomplete. Try again.");
    if (!matchesSignature(head, mimeType)) throw new ApiError(422, "INVALID_MEDIA_CONTENT", "File contents do not match the selected image type.");
    await file.sync();
    await file.close();
    await rename(temporary, thumbnailPath(key));
    return { key, url: `/api/course-thumbnails/${key}` };
  } catch (error) {
    await file.close().catch(() => {});
    await unlink(temporary).catch(() => {});
    throw error;
  } finally { reader.releaseLock(); }
}

export async function thumbnailStat(key: string) { return stat(thumbnailPath(key)); }
export function thumbnailStream(key: string): ReadableStream<Uint8Array> {
  return Readable.toWeb(createReadStream(thumbnailPath(key))) as ReadableStream<Uint8Array>;
}
export async function deleteThumbnail(key: string): Promise<void> {
  await unlink(thumbnailPath(key)).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
}
