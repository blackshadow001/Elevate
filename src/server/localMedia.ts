import "server-only";

import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, open, rename, stat, unlink } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { Readable } from "node:stream";
import { ApiError } from "@/server/api";
import { MAX_VIDEO_SIZE_BYTES } from "@/lib/mediaLimits";

const keyPattern = /^[0-9a-f-]{36}\.(mp4|webm)$/;

export function mediaDirectory(): string {
  const database = process.env.DATABASE_URL?.slice(5) || "./data/learnly.sqlite";
  return resolve(process.env.MEDIA_STORAGE_DIR || join(dirname(resolve(database)), "media"));
}

export function localMediaPath(storageKey: string): string {
  if (!keyPattern.test(storageKey)) throw new ApiError(404, "MEDIA_NOT_FOUND", "Media asset not found.");
  return join(mediaDirectory(), storageKey);
}

export function dataSaverPath(storageKey: string): string {
  return `${localMediaPath(storageKey)}.720p.mp4`;
}

function hasVideoSignature(bytes: Uint8Array, mimeType: string): boolean {
  if (mimeType === "video/webm") return bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  return bytes.length >= 12 && String.fromCharCode(...bytes.subarray(4, 8)) === "ftyp";
}

export async function storeVideoStream(stream: ReadableStream<Uint8Array> | null, mimeType: string, declaredSize: number | null,
  signal: AbortSignal): Promise<{ storageKey: string; sizeBytes: number }> {
  if (!stream) throw new ApiError(400, "EMPTY_UPLOAD", "Choose a video file to upload.");
  if (mimeType !== "video/mp4" && mimeType !== "video/webm") throw new ApiError(415, "INVALID_MEDIA_TYPE", "Choose an MP4 or WebM video.");
  if (declaredSize !== null && (!Number.isSafeInteger(declaredSize) || declaredSize < 1 || declaredSize > MAX_VIDEO_SIZE_BYTES))
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Video must be no larger than 1 GB.");
  const root = mediaDirectory();
  await mkdir(root, { recursive: true });
  const storageKey = `${randomUUID()}.${mimeType === "video/mp4" ? "mp4" : "webm"}`;
  const temporary = join(root, `${storageKey}.part`);
  const target = localMediaPath(storageKey);
  const reader = stream.getReader();
  const file = await open(temporary, "wx", 0o600);
  let written = 0;
  let head = new Uint8Array(0);
  try {
    while (true) {
      if (signal.aborted) throw new ApiError(400, "UPLOAD_INTERRUPTED", "Video upload was interrupted. Try again.");
      const { done, value } = await reader.read();
      if (done) break;
      written += value.byteLength;
      if (written > MAX_VIDEO_SIZE_BYTES) throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Video must be no larger than 1 GB.");
      if (head.length < 16) {
        const combined = new Uint8Array(Math.min(16, head.length + value.length));
        combined.set(head);
        combined.set(value.subarray(0, combined.length - head.length), head.length);
        head = combined;
      }
      let offset = 0;
      while (offset < value.length) offset += (await file.write(value, offset, value.length - offset)).bytesWritten;
    }
    if (!written || (declaredSize !== null && written !== declaredSize))
      throw new ApiError(400, "UPLOAD_INTERRUPTED", "Video upload was incomplete. Try again.");
    if (!hasVideoSignature(head, mimeType)) throw new ApiError(422, "INVALID_MEDIA_CONTENT", "File contents do not match the selected video type.");
    await file.sync();
    await file.close();
    await rename(temporary, target);
    return { storageKey, sizeBytes: written };
  } catch (error) {
    await file.close().catch(() => {});
    await unlink(temporary).catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
}

export async function localMediaStat(storageKey: string) { return stat(localMediaPath(storageKey)); }

export async function dataSaverStat(storageKey: string) { return stat(dataSaverPath(storageKey)); }

export function localMediaStream(storageKey: string, start: number, end: number): ReadableStream<Uint8Array> {
  return Readable.toWeb(createReadStream(localMediaPath(storageKey), { start, end })) as ReadableStream<Uint8Array>;
}

export function dataSaverStream(storageKey: string, start: number, end: number): ReadableStream<Uint8Array> {
  return Readable.toWeb(createReadStream(dataSaverPath(storageKey), { start, end })) as ReadableStream<Uint8Array>;
}

export async function deleteLocalMedia(storageKey: string): Promise<void> {
  for (const path of [localMediaPath(storageKey), dataSaverPath(storageKey)]) {
    await unlink(path).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    });
  }
}
