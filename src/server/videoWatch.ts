import "server-only";

import { randomUUID } from "node:crypto";
import { ApiError, number } from "@/server/api";
import { SessionUser } from "@/server/auth";
import { getDb, transaction } from "@/server/db";

type Segment = [number, number];
type WatchRow = {
  storage_key: string; duration_seconds: number; segments_json: string;
  last_position_seconds: number; last_reported_at_ms: number;
  last_playing: number; reached_end: number;
};

export const WATCH_COMPLETION_THRESHOLD = 0.9;
const MAX_GAP_MS = 60_000;

function segmentsFrom(raw: string): Segment[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((part): part is Segment => Array.isArray(part) && part.length === 2 &&
    part.every((value) => typeof value === "number" && Number.isFinite(value)) && part[1] >= part[0]);
}

function mergeSegments(parts: Segment[]): Segment[] {
  const merged: Segment[] = [];
  for (const [start, end] of parts.sort((a, b) => a[0] - b[0])) {
    const previous = merged.at(-1);
    if (previous && start <= previous[1] + 0.2) previous[1] = Math.max(previous[1], end);
    else merged.push([start, end]);
  }
  return merged;
}

function coveredSeconds(parts: Segment[]): number {
  return parts.reduce((sum, [start, end]) => sum + end - start, 0);
}

export function verifiedWatch(userId: string, lessonId: string, storageKey: string): { watchedSeconds: number; complete: boolean } {
  const row = getDb().prepare("SELECT * FROM video_watch_evidence WHERE user_id=? AND lesson_id=? AND storage_key=?")
    .get(userId, lessonId, storageKey) as WatchRow | undefined;
  if (!row) return { watchedSeconds: 0, complete: false };
  const watchedSeconds = coveredSeconds(segmentsFrom(row.segments_json));
  return { watchedSeconds: Math.floor(watchedSeconds),
    complete: Boolean(row.reached_end) && watchedSeconds >= Number(row.duration_seconds) * WATCH_COMPLETION_THRESHOLD };
}

export function recordVideoWatch(courseId: string, lessonId: string, user: SessionUser, body: Record<string, unknown>) {
  const position = number(body.positionSeconds, "positionSeconds", 0, 86_400);
  const reportedDuration = number(body.durationSeconds, "durationSeconds", 0.1, 86_400);
  const rate = number(body.playbackRate, "playbackRate", 1, 1.5);
  const state = body.state;
  if (!["playing", "paused", "seek", "ended"].includes(String(state)))
    throw new ApiError(422, "INVALID_WATCH_STATE", "Invalid playback state.");
  if (position > reportedDuration + 0.5)
    throw new ApiError(422, "INVALID_POSITION", "Playback position exceeds video duration.");

  return transaction((db) => {
    if (!db.prepare("SELECT 1 FROM enrollments WHERE user_id=? AND course_id=? AND status IN ('active','completed')")
      .get(user.id, courseId)) throw new ApiError(403, "NOT_ENROLLED", "Enroll in this course before watching lessons.");
    const lesson = db.prepare(`SELECT l.type,l.status,l.video_storage_key,l.duration_seconds,m.id AS media_id,
      m.duration_seconds AS media_duration_seconds FROM lessons l
      JOIN course_sections s ON s.id=l.section_id
      LEFT JOIN media_assets m ON m.storage_key=l.video_storage_key
      WHERE l.id=? AND s.course_id=?`).get(lessonId, courseId);
    if (!lesson || lesson.status !== "published") throw new ApiError(404, "LESSON_NOT_FOUND", "This lesson is unavailable.");
    if (lesson.type !== "video" || !lesson.video_storage_key || !lesson.media_id)
      throw new ApiError(409, "LESSON_MEDIA_UNAVAILABLE", "This lesson has no hosted video.");

    const trustedDuration = lesson.media_duration_seconds === null ? null : Number(lesson.media_duration_seconds);
    if (trustedDuration && Math.abs(reportedDuration - trustedDuration) > Math.max(2, trustedDuration * 0.02))
      throw new ApiError(422, "DURATION_MISMATCH", "The player duration does not match the uploaded video metadata.");
    // Older uploads have no media duration. Never let a reported value lower the saved lesson duration.
    const now = Date.now();
    const previous = db.prepare("SELECT * FROM video_watch_evidence WHERE user_id=? AND lesson_id=?")
      .get(user.id, lessonId) as WatchRow | undefined;
    const sameMedia = previous?.storage_key === lesson.video_storage_key;
    const duration = trustedDuration || Math.max(reportedDuration, Number(lesson.duration_seconds),
      sameMedia ? Number(previous!.duration_seconds) : 0);
    const segments = sameMedia ? segmentsFrom(previous!.segments_json) : [];
    const elapsedMs = sameMedia ? now - Number(previous!.last_reported_at_ms) : 0;
    const advance = position - (sameMedia ? Number(previous!.last_position_seconds) : position);
    const canCredit = sameMedia && Boolean(previous!.last_playing) && state !== "seek" &&
      elapsedMs > 0 && elapsedMs <= MAX_GAP_MS && advance > 0 &&
      advance <= (elapsedMs / 1000) * rate + 0.5;
    if (canCredit) segments.push([Math.max(0, Number(previous!.last_position_seconds)), Math.min(position, duration)]);
    const merged = mergeSegments(segments);
    const reachedEnd = Boolean(sameMedia && previous!.reached_end) ||
      state === "ended" && position >= reportedDuration - 1 &&
      coveredSeconds(merged) >= duration * 0.85;
    const playing = state === "playing";
    db.prepare(`INSERT INTO video_watch_evidence
      (user_id,lesson_id,course_id,storage_key,duration_seconds,segments_json,last_position_seconds,last_reported_at_ms,last_playing,reached_end)
      VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(user_id,lesson_id) DO UPDATE SET
        course_id=excluded.course_id,storage_key=excluded.storage_key,duration_seconds=excluded.duration_seconds,
        segments_json=excluded.segments_json,last_position_seconds=excluded.last_position_seconds,
        last_reported_at_ms=excluded.last_reported_at_ms,last_playing=excluded.last_playing,reached_end=excluded.reached_end`)
      .run(user.id, lessonId, courseId, String(lesson.video_storage_key), duration, JSON.stringify(merged),
        position, now, playing ? 1 : 0, reachedEnd ? 1 : 0);
    const watched = Math.floor(coveredSeconds(merged));
    db.prepare(`INSERT INTO lesson_progress (id,user_id,lesson_id,course_id,watched_seconds)
      VALUES (?,?,?,?,?) ON CONFLICT(user_id,lesson_id) DO UPDATE SET
        watched_seconds=MAX(lesson_progress.watched_seconds,excluded.watched_seconds),updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')`)
      .run(randomUUID(), user.id, lessonId, courseId, watched);
    return { watchedSeconds: watched, durationSeconds: duration,
      coveragePercent: Math.min(100, Math.floor(coveredSeconds(merged) / duration * 100)),
      canComplete: reachedEnd && coveredSeconds(merged) >= duration * WATCH_COMPLETION_THRESHOLD };
  });
}
