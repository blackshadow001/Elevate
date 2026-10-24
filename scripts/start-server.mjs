import { createServer } from 'node:http';
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
});
