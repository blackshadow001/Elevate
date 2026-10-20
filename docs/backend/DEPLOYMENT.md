# Local setup and deployment notes

Requires Node.js 24 (the current runtime supplies `node:sqlite`) and npm.

```powershell
npm ci
Copy-Item .env.example .env.local
# Set DATABASE_URL and optional provider settings in .env.local
npm run db:migrate
# Development data only: set DEV_SEED_PASSWORD to a unique local value, then:
npm run db:seed
npm run build
npm run test:backend
npm run dev
```

For a production start, run `npm run build` then `npm run start`. The start command applies pending migrations before starting Next.js and binds to `0.0.0.0` on `PORT`. Set `DATABASE_URL` to an absolute durable file URL such as `file:/var/lib/elevate/elevate.sqlite`, writable by the app, and keep its file outside the deployment bundle. Set `MEDIA_STORAGE_DIR` to a durable writable directory on the same host (or use the default `media` directory beside SQLite). Back up both SQLite with its WAL state and the media directory, and verify restore before accepting learner data. The HTTPS reverse proxy must permit video request bodies up to 1 GB and thumbnail images up to 5 MB, with sufficient upload time. Set `NEXT_PUBLIC_SITE_URL` to the public HTTPS origin **before building**. Do not run the development seed in production. Use HTTPS so session cookies have their Secure flag. Protect the environment and stored files; local env files, SQLite files and the default media directory are gitignored.

## Render launch settings

Use a paid **Node Web Service** with one instance. In Settings set build command `npm ci && npm run build`, start command `npm run start`, and HTTP health check path `/api/health`. In Disk attach a persistent disk mounted at `/var/data` with room for the SQLite database, its WAL, and uploaded videos. In Environment set `DATABASE_URL=file:/var/data/elevate.sqlite`, `MEDIA_STORAGE_DIR=/var/data/media`, and `NEXT_PUBLIC_SITE_URL=https://<your-service>.onrender.com` (or the final custom HTTPS domain). The site URL must be present during the build. Keep provider secrets in Render environment variables, not the repository. Leave Razorpay credentials unset until a real Test Mode transaction and signed webhook have been verified. Google login needs the exact production callback registered with Google and `GOOGLE_REDIRECT_URI=https://<your-service>.onrender.com/api/auth/google/callback`.

Render's build and pre-deploy phases cannot access a service's persistent disk. Migration therefore runs from `npm run start` on the mounted disk. After first start, provision the super admin once from the paid service's shell using private `ADMIN_BOOTSTRAP_NAME`, `ADMIN_BOOTSTRAP_EMAIL`, and `ADMIN_BOOTSTRAP_PASSWORD`, then remove those temporary values. Do not seed production data. Check `/api/health` returns `{"status":"ok"}` and exercise learner registration, admin sign-in, course upload and playback, and a restart before inviting users. Configure backups of both the SQLite database and media directory.

A Render **Free** web service cannot attach a persistent disk; its SQLite file, user accounts, progress, and uploads disappear after restarts or idle spin-down. Do not use it for a live LMS. A static site is also unsuitable because this app requires server routes and local persistent storage.

Run one long-running Node.js 24 application instance behind an HTTPS reverse proxy. This SQLite and local-media configuration is not suitable for an ephemeral serverless filesystem or horizontal replicas. Persist the database and media volumes across releases; `npm run start` applies pending migrations on that volume before the web server begins listening. Provision the first admin once with `npm run admin:bootstrap` and private operator environment variables; never seed development accounts in production. Local video upload/playback works on that single host; live AV, realtime engagement and outbound notifications still require providers. Paid checkout requires configured Razorpay credentials and a real Test Mode verification before live collection.

The current process is single-instance. SQLite is still experimental in the installed Node runtime and emits an experimental warning. Local video storage works without a media-provider key; cloud media, live streaming and email adapters remain unimplemented. The listed provider environment variables are placeholders except the implemented Razorpay settings.

Validation gates:

```powershell
npm run db:migrate
npm run build
npm run test:backend
npm run lint
```

Lint currently has zero errors and inherited unused import / image optimization warnings. Run the isolated backend tests against a fresh build; they create and remove a separate SQLite database.
