import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import next from 'next';

const port = Number(process.env.PORT || 3000);
if (!Number.isSafeInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port');

const app = next({ dev: process.env.NODE_ENV !== 'production', hostname: '0.0.0.0', port });
const handle = app.getRequestHandler();
await app.prepare();

const server = createServer((request, response) => { void handle(request, response); });
// A 1 GB upload can take much longer than Node's default five-minute request limit.
// Caddy still limits body size and aborts idle clients before requests reach this server.
server.requestTimeout = 3 * 60 * 60 * 1000;
server.headersTimeout = 60 * 1000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Elevate listening on port ${port}; request timeout ${server.requestTimeout}ms`);
  let cleaning = false;
  const cleanMedia = () => {
    if (cleaning) return;
    cleaning = true;
    const child = spawn(process.execPath, ['scripts/cleanup-discarded-videos.mjs'], { stdio: 'inherit' });
    child.on('error', (error) => { console.error('Media cleanup failed:', error); cleaning = false; });
    child.on('close', (code) => {
      if (code !== 0) console.error(`Media cleanup exited with code ${code}`);
      cleaning = false;
    });
  };
  cleanMedia();
  setInterval(cleanMedia, 60 * 60 * 1000).unref();
  let transcoding = false;
  const transcodeMedia = () => {
    if (transcoding) return;
    transcoding = true;
    const child = spawn(process.execPath, ['scripts/transcode-videos.mjs'], { stdio: 'inherit' });
    child.on('error', (error) => { console.error('Video transcoding failed:', error); transcoding = false; });
    child.on('close', (code) => {
      if (code !== 0) console.error(`Video transcoding exited with code ${code}`);
      transcoding = false;
    });
  };
  if (process.env.VIDEO_TRANSCODING_ENABLED === '1') {
    transcodeMedia();
    setInterval(transcodeMedia, 60 * 60 * 1000).unref();
  }
});
