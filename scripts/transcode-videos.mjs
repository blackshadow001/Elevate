import { spawn } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { rename, stat, statfs, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl?.startsWith('file:')) throw new Error('DATABASE_URL is required for video transcoding');
const databasePath = resolve(databaseUrl.slice(5));
const mediaPath = resolve(process.env.MEDIA_STORAGE_DIR || join(dirname(databasePath), 'media'));
const db = new DatabaseSync(databasePath, { readOnly: true });
const videoKey = /^[0-9a-f-]{36}\.(mp4|webm)$/;

function run(command, args) {
  return new Promise((resolveRun, reject) => {
    const useNice = process.platform === 'linux' && command === 'ffmpeg';
    const child = spawn(useNice ? 'nice' : command, useNice ? ['-n', '15', command, ...args] : args,
      { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    let output = '';
    let errorText = '';
    child.stdout.on('data', (chunk) => { output = `${output}${chunk}`.slice(-100_000); });
    child.stderr.on('data', (chunk) => { errorText = `${errorText}${chunk}`.slice(-4000); });
    child.on('error', reject);
    child.on('close', (code) => code === 0 ? resolveRun(output) : reject(new Error(`${command} exited ${code}: ${errorText}`)));
  });
}

try {
  await run('ffprobe', ['-version']);
  await run('ffmpeg', ['-version']);
  const rows = db.prepare(`SELECT DISTINCT m.storage_key FROM media_assets m
    JOIN lessons l ON l.video_storage_key=m.storage_key
    WHERE m.mime_type IN ('video/mp4','video/webm')`).all();
  let converted = 0;
  for (const row of rows) {
    const key = String(row.storage_key);
    if (!videoKey.test(key)) continue;
    const source = join(mediaPath, key);
    const target = `${source}.720p.mp4`;
    const failure = `${source}.720p.failed`;
    let sourceInfo;
    try {
      sourceInfo = await stat(source);
      await stat(target);
      continue;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      if (!sourceInfo) continue;
    }
    // A failed encode should not consume the small app server's CPU every hour.
    try { await stat(failure); continue; } catch (error) { if (error.code !== 'ENOENT') throw error; }
    const temporary = `${target}.part`;
    try {
      const probe = JSON.parse(await run('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height:format=duration', '-of', 'json', source]));
      const width = Number(probe.streams?.[0]?.width);
      const height = Number(probe.streams?.[0]?.height);
      const duration = Number(probe.format?.duration);
      if (!width || !height || !duration || !Number.isFinite(duration))
        throw new Error('Video dimensions or duration are unavailable');
      const scale = Math.min(1, 1280 / width, 720 / height);
      const targetWidth = Math.max(2, Math.floor(width * scale / 2) * 2);
      const targetHeight = Math.max(2, Math.floor(height * scale / 2) * 2);
      // Skip videos that are already close to the data-saver bitrate.
      const expectedSize = duration * 1_300_000 / 8;
      if (expectedSize >= sourceInfo.size * 0.85) continue;
      const disk = await statfs(mediaPath);
      if (disk.bavail * disk.bsize < expectedSize + 512_000_000) {
        console.warn(`Not enough free disk space to transcode ${key}`);
        break;
      }
      await unlink(temporary).catch((error) => { if (error.code !== 'ENOENT') throw error; });
      await run('ffmpeg', ['-hide_banner', '-nostdin', '-loglevel', 'error', '-y', '-threads', '1', '-i', source,
        '-map', '0:v:0', '-map', '0:a:0?', '-sn', '-dn', '-vf', `scale=${targetWidth}:${targetHeight}`,
        '-filter_threads', '1', '-c:v', 'libx264', '-preset', 'veryfast', '-threads', '1', '-pix_fmt', 'yuv420p',
        '-b:v', '1100k', '-maxrate', '1200k', '-bufsize', '2400k',
        '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', '-f', 'mp4', temporary]);
      const result = await stat(temporary);
      if (result.size >= sourceInfo.size * 0.85) {
        await unlink(temporary);
        await writeFile(failure, 'The 720p output did not materially reduce file size.');
        break;
      }
      await rename(temporary, target);
      converted++;
    } catch (error) {
      await unlink(temporary).catch(() => {});
      await writeFile(failure, String(error));
      console.error(`Could not transcode ${key}:`, error);
    }
    // At most one conversion per scheduled run keeps playback responsive.
    break;
  }
  console.log(`Video transcoding: created ${converted} data-saver versions`);
} finally {
  db.close();
}
