import "server-only";

import type { DatabaseSync } from "node:sqlite";

const localVideoKey = /^[0-9a-f-]{36}\.(mp4|webm)$/;

export function queueDiscardedVideo(db: DatabaseSync, storageKey: string): void {
  const used = db.prepare(`SELECT 1 WHERE EXISTS(SELECT 1 FROM lessons WHERE video_storage_key=?)
    OR EXISTS(SELECT 1 FROM course_resources WHERE storage_key=?)`).get(storageKey, storageKey);
  if (used) return;
  db.prepare("DELETE FROM media_assets WHERE storage_key=?").run(storageKey);
  if (localVideoKey.test(storageKey)) {
    db.prepare("INSERT OR IGNORE INTO discarded_videos(storage_key,discarded_at_ms) VALUES (?,?)")
      .run(storageKey, Date.now());
  }
}
