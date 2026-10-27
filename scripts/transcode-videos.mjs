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
const qualities = [
  { name: '360p', width: 640, height: 360, videoBitrate: 450, audioBitrate: 64 },
  { name: '480p', width: 854, height: 480, videoBitrate: 700, audioBitrate: 80 },
  { name: '720p', width: 1280, height: 720, videoBitrate: 1100, audioBitrate: 96 },
  { name: '1080p', width: 1920, height: 1080, videoBitrate: 2200, audioBitrate: 128 },
];

async function exists(path) {
  try { await stat(path); return true; }
  catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

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
    if (!(await exists(source))) continue;
    const sourceInfo = await stat(source);
    const next = await (async () => {
      for (const quality of qualities) {
        if (!(await exists(`${source}.${quality.name}.mp4`)) && !(await exists(`${source}.${quality.name}.failed`))) return quality;
      }
      return null;
    })();
    if (!next) continue;
    const target = `${source}.${next.name}.mp4`;
    const failure = `${source}.${next.name}.failed`;
    const temporary = `${target}.part`;
    try {
      const probe = JSON.parse(await run('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height:format=duration', '-of', 'json', source]));
      const width = Number(probe.streams?.[0]?.width);
      const height = Number(probe.streams?.[0]?.height);
      const duration = Number(probe.format?.duration);
      if (!width || !height || !duration || !Number.isFinite(duration))
        throw new Error('Video dimensions or duration are unavailable');
      if (height < next.height) {
        await writeFile(failure, `The source video is below ${next.name}.`);
        continue;
      }
      const scale = Math.min(1, next.width / width, next.height / height);
      const targetWidth = Math.max(2, Math.floor(width * scale / 2) * 2);
      const targetHeight = Math.max(2, Math.floor(height * scale / 2) * 2);
      const expectedSize = duration * (next.videoBitrate + next.audioBitrate) * 1000 / 8;
      if (expectedSize >= sourceInfo.size * 0.85) {
        await writeFile(failure, `The source video is already close to the ${next.name} bitrate.`);
        continue;
      }
      const disk = await statfs(mediaPath);
      if (disk.bavail * disk.bsize < expectedSize + 512_000_000) {
        console.warn(`Not enough free disk space to transcode ${key} at ${next.name}`);
        break;
      }
      await unlink(temporary).catch((error) => { if (error.code !== 'ENOENT') throw error; });
      await run('ffmpeg', ['-hide_banner', '-nostdin', '-loglevel', 'error', '-y', '-threads', '1', '-i', source,
        '-map', '0:v:0', '-map', '0:a:0?', '-sn', '-dn', '-vf', `scale=${targetWidth}:${targetHeight}`,
        '-filter_threads', '1', '-c:v', 'libx264', '-preset', 'veryfast', '-threads', '1', '-pix_fmt', 'yuv420p',
        '-b:v', `${next.videoBitrate}k`, '-maxrate', `${Math.round(next.videoBitrate * 1.1)}k`, '-bufsize', `${next.videoBitrate * 2}k`,
        '-c:a', 'aac', '-b:a', `${next.audioBitrate}k`, '-movflags', '+faststart', '-f', 'mp4', temporary]);
      const result = await stat(temporary);
      if (result.size >= sourceInfo.size * 0.85) {
        await unlink(temporary);
        await writeFile(failure, `The ${next.name} output did not materially reduce file size.`);
        break;
      }
      await rename(temporary, target);
      converted++;
    } catch (error) {
      await unlink(temporary).catch(() => {});
      await writeFile(failure, String(error));
      console.error(`Could not transcode ${key} at ${next.name}:`, error);
    }
    // At most one conversion per scheduled run keeps playback responsive.
    break;
  }
  console.log(`Video transcoding: created ${converted} quality versions`);
} finally {
  db.close();
}
