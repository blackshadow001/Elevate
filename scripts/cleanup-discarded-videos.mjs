import { DatabaseSync } from 'node:sqlite';
import { readdir, stat, unlink } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

const hour = 60 * 60 * 1000;
const threeDays = 72 * hour;
const now = Date.now();
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl?.startsWith('file:')) throw new Error('DATABASE_URL is required for media cleanup');
const databasePath = resolve(databaseUrl.slice(5));
const mediaPath = resolve(process.env.MEDIA_STORAGE_DIR || join(dirname(databasePath), 'media'));
const db = new DatabaseSync(databasePath);
db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');

const videoKey = /^[0-9a-f-]{36}\.(mp4|webm)$/;
const partialKey = /^[0-9a-f-]{36}\.(mp4|webm)\.part$/;
const variantKey = /^([0-9a-f-]{36}\.(?:mp4|webm))\.720p\.(?:mp4|mp4\.part|failed)$/;
const used = db.prepare(`SELECT 1 WHERE EXISTS(SELECT 1 FROM lessons WHERE video_storage_key=?)
  OR EXISTS(SELECT 1 FROM course_resources WHERE storage_key=?)
  OR EXISTS(SELECT 1 FROM media_assets WHERE storage_key=?)`);
let deleted = 0;
let partials = 0;

try {
  // A completed upload always has an asset row. A row without a lesson or
  // resource reference is an abandoned upload left by an older release.
  const abandoned = db.prepare(`SELECT m.storage_key FROM media_assets m WHERE m.mime_type IN ('video/mp4','video/webm')
    AND NOT EXISTS(SELECT 1 FROM lessons WHERE video_storage_key=m.storage_key)
    AND NOT EXISTS(SELECT 1 FROM course_resources WHERE storage_key=m.storage_key)`).all();
  for (const row of abandoned) {
    const key = String(row.storage_key);
    if (!videoKey.test(key)) continue;
    db.prepare('DELETE FROM media_assets WHERE storage_key=?').run(key);
    db.prepare('INSERT OR IGNORE INTO discarded_videos(storage_key,discarded_at_ms) VALUES (?,?)').run(key, now);
  }

  // Sweep hourly. Starting at 71 hours keeps normal deletion within 72 hours.
  const due = db.prepare('SELECT storage_key FROM discarded_videos WHERE discarded_at_ms<=?').all(now - threeDays + hour);
  for (const row of due) {
    const key = String(row.storage_key);
    if (!videoKey.test(key) || used.get(key, key, key)) {
      db.prepare('DELETE FROM discarded_videos WHERE storage_key=?').run(key);
      continue;
    }
    let failed = false;
    for (const name of [key, `${key}.720p.mp4`, `${key}.720p.mp4.part`, `${key}.720p.failed`]) {
      try { await unlink(join(mediaPath, name)); if (name === key) deleted++; }
      catch (error) {
        if (error.code !== 'ENOENT') { console.error(`Could not remove discarded video ${name}:`, error); failed = true; }
      }
    }
    if (failed) continue;
    db.prepare('DELETE FROM discarded_videos WHERE storage_key=?').run(key);
  }

  let entries = [];
  try { entries = await readdir(mediaPath, { withFileTypes: true }); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const key = entry.name;
    const variant = variantKey.exec(key);
    if (!partialKey.test(key) && !videoKey.test(key) && !variant) continue;
    const info = await stat(join(mediaPath, key));
    if (partialKey.test(key) || key.endsWith('.720p.mp4.part')) {
      // Request handling is capped at three hours; an idle six-hour partial
      // cannot belong to an active upload. Transcoding can take longer, so
      // its partial files receive a full day before cleanup.
      const staleAfter = partialKey.test(key) ? 6 * hour : 24 * hour;
      if (info.mtimeMs <= now - staleAfter) {
        await unlink(join(mediaPath, key));
        partials++;
      }
    } else if (variant) {
      const original = variant[1];
      if (info.mtimeMs <= now - threeDays && !used.get(original, original, original)) {
        await unlink(join(mediaPath, key));
        deleted++;
      }
    } else if (info.mtimeMs <= now - threeDays &&
      !db.prepare('SELECT 1 FROM discarded_videos WHERE storage_key=?').get(key) &&
      !used.get(key, key, key)) {
      // A completed file without an asset or references may be left by a
      // process crash before the upload transaction committed.
      await unlink(join(mediaPath, key));
      deleted++;
    }
  }
  console.log(`Media cleanup: removed ${deleted} discarded videos and ${partials} abandoned partial uploads`);
} finally {
  db.close();
}
