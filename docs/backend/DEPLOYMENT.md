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

For a production start, run `npm run build` then `npm run start`. Set `DATABASE_URL` to an absolute durable file URL such as `file:/var/lib/elevate/elevate.sqlite`, writable by the app, and keep its file outside the deployment bundle. Set `NEXT_PUBLIC_SITE_URL` to the public HTTPS origin **before building**. Do not run the development seed in production. Back up the database consistently with its WAL state and verify restore before accepting learner data. Use HTTPS so session cookies have their Secure flag. Protect the environment and SQLite file; local env files and SQLite files are gitignored.

Run one long-running Node.js 24 application instance behind an HTTPS reverse proxy. This SQLite configuration is not suitable for an ephemeral serverless filesystem or horizontal replicas. Persist the database volume across releases and run `npm run db:migrate` against that volume before starting the new build. Provision the first admin once with `npm run admin:bootstrap` and private operator environment variables; never seed development accounts in production. The app can serve its implemented free-course and administration flows, but paid checkout, private media, live AV, realtime engagement, and outbound notifications must stay disabled until their providers are implemented and verified.

The current process is single-instance. SQLite is still experimental in the installed Node runtime and emits an experimental warning. Media, live streaming, payments and email adapters are intentionally disabled by default and must be implemented and tested before those features can be offered. The listed provider environment variables are placeholders for configuration, not working integrations.

Validation gates:

```powershell
npm run db:migrate
npm run build
npm run test:backend
npm run lint
```

Lint currently has zero errors and inherited unused import / image optimization warnings. Run the isolated backend tests against a fresh build; they create and remove a separate SQLite database.
