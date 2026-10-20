# Elevate LMS

Elevate is a Next.js learning platform with learner, tutor, and administrator portals. This repository includes a persistent SQLite backend for authentication, free learning, course moderation and pricing, certificates, and stored live-class chat.

## Production deployment

**Supported deployment:** one long-running Node.js 24 process with a durable, writable SQLite volume and HTTPS at the public origin. Do not deploy this SQLite configuration to an ephemeral filesystem or multiple app instances. Razorpay checkout is implemented but requires operator credentials, a reachable signed webhook, and a real Test Mode transaction before live collection. Tutor video upload and authorized range playback use local disk; the media directory must be durable and backed up with SQLite. Cloud video delivery, transcoding, live audio/video, real-time engagement, and outbound notifications still require providers.

Set these values in the deployment environment before building or starting. Keep secrets in the host's secret manager, outside Git:

| Setting | Production value |
| --- | --- |
| `DATABASE_URL` | Absolute durable SQLite file URL, for example `file:/var/lib/elevate/elevate.sqlite` |
| `MEDIA_STORAGE_DIR` | Durable writable media directory, for example `/var/lib/elevate/media`; defaults to a `media` directory beside the SQLite file |
| `NEXT_PUBLIC_SITE_URL` | Exact public HTTPS origin, for example `https://your-domain.example` |
| `PORT` | Optional HTTP listen port; set according to the reverse proxy |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Razorpay credentials and separate webhook secret; leave empty to disable paid checkout |
| Google OAuth settings | Optional; configure a Web client and exact HTTPS callback as described below |

On a new database, install, migrate, provision the first administrator, build, and start:

```bash
npm ci
npm run db:migrate
# Set ADMIN_BOOTSTRAP_NAME, ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD
# privately in the operator environment for this one-time step.
npm run admin:bootstrap
npm run build
npm run start
```

Run migrations on every release **before** starting the new version. Back up the SQLite database consistently, including its WAL state, and test a restore; retain the volume across deployments. Never run `npm run db:seed` against a production database. Terminate HTTPS at a reverse proxy and forward requests to the Node process. Build with the production `NEXT_PUBLIC_SITE_URL` already set because public environment values are embedded in browser assets. The administrator login is `/control-center/login`; public signup creates learner accounts only. See [deployment notes](docs/backend/DEPLOYMENT.md), [backend readiness](docs/backend/BACKEND_READINESS.md), and [the QA matrix](QA_AUDIT.md) for limits and evidence.

On Render, use a **Node Web Service** with build command `npm ci && npm run build` and start command `npm run start`. The `&&` stops the build if dependency installation fails. Attach a persistent disk for both the SQLite database and media directory; run migrations against that disk before serving the new version. A static-site service or ephemeral disk cannot support this backend.

## Current QA status — 20 October 2026

Before this repository update, `npm run build`, `npm run test:backend` (33/33), and `npm run lint` (0 errors, 271 warnings) passed. The isolated Playwright Chrome suite passed 12/12 with `npm run test:browser -- --reporter=line`. These checks do not verify a live Razorpay transaction, Google OAuth consent, or live audio/video transport.

Video lessons now record server-checked watched ranges for enrolled learners. Completing a video requires at least 90% watched coverage and reaching the end; seeking straight to the end and sending a completion request directly do not count. The full isolated Chrome suite passed **12/12**, including a hosted-video playback and completion that persists after reload. The full backend suite passed **33/33**; the build passed and lint reported no errors (271 existing warnings). Run `npm run db:migrate` before starting this version against an existing database. Videos watched before this change need to be watched again because no earlier watch evidence was stored. The seek limit still resets when the player reloads, and browser playback checks cannot prevent every form of cheating.

Earlier paragraphs in this section document previous QA runs; their statements that video completion is unavailable are superseded by this update.

The learner player now hides the browser video menu and native settings, removes Picture-in-Picture, and limits seeking to video watched in the current player session. Tutor preview keeps free seeking. These controls reduce casual copying and skipping but cannot prevent an authorized viewer from obtaining delivered bytes; private media still requires server-side access checks and stronger protection would require a DRM-capable delivery provider. The final isolated Chrome suite passed **11/11**, and build plus lint (`--quiet`) passed. Watched-video completion remains unverified and is not credited merely because the player reaches the end.

Tutor thumbnails now upload to the private local media directory as JPG, PNG or WebP files up to 5 MB, rather than remaining browser-only previews. Draft images are visible to their tutor and admins; images for approved, published courses are public. If an image was selected before this fix, select it again in the builder because that earlier file was never saved. The isolated backend suite passed **33/33** and the full Chrome browser suite passed **10/10**, including thumbnail persistence across reloads and the video upload journey. `npm run build` and `npm run lint -- --quiet` passed. The tests used separate temporary SQLite databases and media directories, leaving user data untouched; remaining limitations are in [the QA audit](QA_AUDIT.md).

### Earlier checks — 12 October 2026

**Current targeted checks:** The paid-course checkout implementation passed `npm run test:backend` **31/31** with a deterministic SDK mock and isolated SQLite. After the wishlist navigation fix, `npm run test:browser` passed **10/10**, including saved-only wishlist display/removal and disabled checkout without credentials. `npm run build` and `npx tsc --noEmit` passed; the last full lint exited with **0 errors, 272 warnings**. These results do not include a genuine Razorpay Test Mode purchase or provider-delivered webhook; both require credentials and a reachable endpoint. The existing user database was not changed for the tests. See [payment QA and setup](QA_PAYMENTS.md).

The targeted course-lifecycle pass uses isolated SQLite test databases and a local production server. `npm run build` passes; `npm run test:backend` passes 25/25; `npm run test:browser` passes 8/8 grouped Playwright journeys; lint reports 0 errors and 270 warnings at the last run. The browser journeys cover marketplace search/filter/sort, free learner enrollment through a reading-course certificate, admin/learner role isolation, tutor draft and local video preview, missing-media submission rejection, speed cap, mobile navigation, reading-course rejection/resubmission/approval/publication, stored classroom chat through reload/leave, and logout invalidation. The 72-case historical frontend matrix has **not** been rerun for this pass. See [QA automation](QA_AUTOMATION.md), [the dated QA matrix](QA_AUDIT.md), and [JUnit evidence](qa-artifacts/playwright-results.xml).

Local single-server private video upload and authorized range playback are available. Watched-video completion, captions, live AV/realtime delivery, and quizzes are not release-ready. Video completion refuses unverified client progress. The Razorpay code has passed isolated SDK-mock tests; a real Test Mode charge and signed webhook remain to be verified with operator credentials.

Elevate uses the tagline **Learn from Experts. Elevate Your Future.** The approved full logo is stored at `public/branding/elevate-orange-ribbon-logo.png`; the shared logo component displays that image across the LMS, while metadata and the install name read from `src/lib/brand.ts`. Existing database filenames and the `learnly_session` cookie name remain for compatibility with existing data and sessions.

The production build uses webpack and the Tailwind PostCSS plugin in `postcss.config.mjs`. Keep this plugin when changing the build pipeline: without it, a build can succeed while shipping HTML without Tailwind utility styles. `src/app/icon.svg` supplies the favicon and PWA icon, and `src/app/manifest.ts` supplies the install name.

Next.js 16 LMS with a persistent SQLite backend for learning, instructor management, live schedules, and admin-controlled course approval and pricing.

## Local setup

Requires Node.js 24 and npm.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run db:migrate
# Optional development fixtures: set a unique DEV_SEED_PASSWORD in .env.local first.
npm run db:seed
npm run dev
```

For a new non-seeded deployment, provision the **first** super admin after migrations with `ADMIN_BOOTSTRAP_NAME`, `ADMIN_BOOTSTRAP_EMAIL`, and a unique `ADMIN_BOOTSTRAP_PASSWORD` of at least 16 characters set in the operator environment, then run `npm run admin:bootstrap`. Do not put that password in source control or a shared shell history. The command refuses to run if a super admin or that email already exists. A logged-in super admin can subsequently promote an existing account with the protected `/api/admin/users/[userId]` endpoint; public registration always creates a learner. Existing admin accounts are promoted by migration `010`; no existing learner data is reset.

If the local super admin password is lost, an operator with database file access can set `DATABASE_URL` and `ADMIN_RESET_EMAIL`, then run `npm run admin:reset-password`. The command targets only an active super admin, generates a random password shown once in the terminal, hashes it with scrypt, and revokes that account's existing sessions. Keep the terminal output private and do not use this operation on an unintended database.

The development app opens at [http://localhost:4500](http://localhost:4500). `DATABASE_URL` defaults to `file:./data/learnly.sqlite` in development; set it explicitly to a durable file URL for production. Do not use the development seed in production.

Set `NEXT_PUBLIC_SITE_URL` to the deployed HTTPS origin so Open Graph and Twitter image URLs resolve correctly. The default is the local development URL; no production domain is assumed by the repository.

For testing from another laptop on the same Wi-Fi, use the host PC's reachable network address on port 4500 while `npm run dev` is running. `next.config.ts` lists the development hosts observed so far, including `172.31.144.1`; if the address changes, add the new hostname to `allowedDevOrigins` and restart the dev server. Otherwise Next.js may render the form but block its client scripts, causing a plain form reload instead of sign-in. The other device must be able to reach TCP port 4500 through the local firewall.

Learners and instructors sign in through the same `/login` form. The server determines the account role from the stored email record; instructor accounts open Instructor Studio and can switch to Learner View there. A new login for the same account invalidates its previous sessions. Protected API access is revoked immediately, and an open previous browser updates its sign-in state on focus or within 15 seconds while visible.

### Google sign-in

The `/login` and `/signup` pages also offer Google sign-in. The server exchanges Google's authorization code, verifies the signed ID token and one-time nonce, and creates the normal Elevate session. New Google users are **learners only**. Existing tutors retain their stored role; administrators continue to use `/control-center/login`. An existing Gmail or Google Workspace account can be matched to a verified Google email. For other existing email addresses, sign in with the password first and use **Connect Google account** on `/login`; this avoids taking over an existing account based only on a third-party email claim. A second login revokes the previous session, including a password session.

Use a **Web application** OAuth client. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` as private server environment variables, or set `GOOGLE_CREDENTIALS_FILE` to the downloaded web client JSON. Set `GOOGLE_REDIRECT_URI` to the exact callback, for example `http://localhost:4500/api/auth/google/callback`, and add that exact URI to **Authorized redirect URIs** in Google Cloud Console. Configure the OAuth consent screen and add test users while the app is in testing mode. Restart Next.js after changing environment variables. Keep the credential JSON out of source control; `.gitignore` excludes `client_secret_*.json`.

The authorization redirect, PKCE, state, and callback validation were tested locally. A complete Google consent and token exchange remains unverified until a deployment supplies an authorized callback and test identity. Google sign-in from another device via a private LAN IP will not work with a localhost callback; use the configured HTTPS domain. Password login remains available.

Tutor logins are provisioned only by the super admin in **People → User Directory** at `/control-center/users`. Creating one requires the super admin's current password and an audit reason. The server generates a temporary password shown once, stores only its hash, and assigns the instructor role; public `/signup` always creates a learner, regardless of a submitted role. An existing learner may also be promoted by the super admin in the directory; their active sessions are revoked so they must sign in again. The public instructor application is a local preview and does not create an account or send an application.

Administrators sign in separately at `/control-center/login`, which is outside the protected admin layout. The dashboard is `/control-center`; former `/admin` page URLs return 404. The server checks the stored role on every protected page and admin API. An unauthenticated visitor or a signed-in learner or tutor opening a protected admin page is redirected to the dedicated admin sign-in. A learner or tutor may open that page and sign in with an administrator account to switch the browser session; their existing account cannot authenticate there. The portal includes the dashboard, course catalogue/review/pricing, users, order quotes and detail, category counts, live schedules, certificate registry, and integration status. User role/status and certificate status changes require an administrative reason and write audit records. Course review and pricing history includes actor, reason, timestamp and before/after metadata. Tutors save drafts and submit complete courses for review; admins separately approve the content, approve the price, and publish. A published course must be unpublished by an admin before the tutor can revise it, after which it needs review again. Unpublished courses disappear from the public catalogue and new checkout while previously enrolled learners retain their course access.

To manage administrator passwords, sign in as the super admin and open **People → Admin Profiles** at `/control-center/profiles` (also linked from the super admin name in the header). This page can create a sub admin, reset an active sub admin's password, and change the super admin's own password. Creation and reset require the super admin's current password and an audit reason; a strong temporary password is displayed once and never stored in plaintext. Reset revokes the sub admin's sessions. Changing the super admin password revokes all their sessions and returns to `/control-center/login`. Sub admins cannot access this page, the user directory, or these APIs. Existing passwords cannot be viewed; if the super admin password is lost, use the operator-only `admin:reset-password` command described above.

Pricing uses INR minor units. **Tutor margin is a markup added to the admin base price, not a payout or commission:** `final minor units = base minor units + round(base minor units × margin basis points / 10,000)`. For example, a ₹2,000 base and a 20% margin produce ₹2,400. The admin sets the base, allowed range and optional cap; the tutor may propose a margin within those bounds. The server calculates the official price and order snapshot. Razorpay checkout grants enrollment only after the server verifies a captured payment; tutor payouts are not implemented. See [payment setup and QA](QA_PAYMENTS.md).

## Verification

```powershell
npm run build
npm run test:backend
npm run test:browser
npm run lint
```

The HTTP integration suite requires a build. It creates a separate temporary SQLite database, exercises core learner/instructor/admin workflows and smoke checks the prior 47 page route templates. On 11 October 2026, the build passed, backend suite passed 21/21 tests (including super-admin profile creation, password reset/change, session revocation, admin API and protected-page HTTP checks), and lint exited with 0 errors and 291 warnings. The current admin UI was not visually retested: the in-app browser automation launcher exited while enumerating an unrelated locked `E:` drive. Earlier targeted browser checks are retained in the [acceptance ledger](QA_AUDIT.md) as historical evidence; the full 72-case matrix was not rerun. HTTP page responses do not establish UI behavior.

On 12 October 2026, the Google sign-in change passed the production build, the isolated backend suite (**23/23**), and lint (**0 errors, 272 warnings**). The added HTTP case checked the authorization redirect, PKCE, state cookie, callback state rejection, and unauthenticated account-link denial; the database test checked unique Google identity links. Browser checks confirmed the new controls on `/login` and `/signup`. The running local endpoint generated a Google authorization redirect with the configured callback, state, PKCE and cookie. Live Google consent, token exchange, and account creation remain unverified until the callback is authorized in Google Cloud Console.

On 12 October 2026, the Elevate branding pass rebuilt successfully with generated Tailwind utilities. The backend HTTP suite passed 21/21, including route smoke checks, and lint exited with 0 errors and 272 warnings. Browser checks confirmed the brand, logo, metadata, and no horizontal overflow on `/`, `/courses`, `/login`, `/signup`, `/admin/login`, and `/about`, including 390px checks on the homepage, catalogue, and login pages. These are representative visual checks, not a rerun of the full 72-case interaction matrix or authenticated dashboard workflows. One existing demo admin name and one existing demo notification in the local database still contain the historical brand; database records were not rewritten by this branding pass.

On 12 October 2026, admin-only tutor provisioning passed `npm run build` and the isolated backend suite (21/21). The added HTTP assertions covered public role forgery, unauthorized learner/tutor/sub-admin requests, CSRF, invalid fields/password, duplicate email, tutor login, stored hash and audit entry. Lint exited with 0 errors and 272 existing warnings. The new admin form was not exercised in a browser during this change; the HTTP test used the same endpoint directly.

## Backend status

The admin portal route check on 12 October 2026 passed `npm run build` and the isolated backend HTTP suite (21/21). Tests covered all protected admin page templates with admin, learner, tutor, and unauthenticated sessions, the retired `/admin` URLs, and the existing admin API authorization rules. `npm run lint` completed with 0 errors and 272 warnings. The renamed navigation has not yet received a fresh browser interaction pass.

Apply migration `011_admin_operations.sql` with `npm run db:migrate` after a consistent SQLite backup. It adds administrative user/certificate audit records, before/after course change metadata, and filter indexes without resetting existing records. On this workspace, a `VACUUM INTO` snapshot was made and migration 011 applied to the local database on 11 October 2026. Categories are currently computed from course records; the admin category page is a read-only breakdown. Global platform fee, payouts, refunds, provider setup, and administrator self-service security settings are not implemented; the settings page reports these boundaries instead of claiming to save them.

Persistent free enrollment, idempotent progress, certificates, wishlist, owned instructor courses, admin approval/pricing, live schedules, bootcamp/event registration, stored classroom chat and reminder preferences are implemented. Curriculum edits that would change required lessons are blocked once learners enroll. The builder can reorder curriculum, edit reading content, and upload an MP4/WebM video of up to 1 GB to local private storage. Submission/publication of empty readings, unsupported interactive activities, and video without uploaded media is rejected. Paid course checkout uses Razorpay when configured; without credentials it remains disabled, and no genuine provider transaction has been verified here. Cloud media, transcoding, live streaming, outbound notifications and realtime engagement require provider integrations. Seeded published video courses have no hosted media and cannot be completed; the free reading starter course exercises the full learner path. Actual learner bootcamp session completion and instructor event creation are not implemented.

For deployment, use Node.js 24 and a durable writable SQLite file outside the release bundle. Run migrations before starting, back up with a consistent SQLite snapshot, and verify restores. The backend is designed for a single app instance; in-memory rate limits and the database file are not shared across instances. See [deployment](docs/backend/DEPLOYMENT.md) and [readiness](docs/backend/BACKEND_READINESS.md) for the tested limits and remaining security work.

See [API](docs/backend/API.md), [database](docs/backend/DATABASE.md), [authentication](docs/backend/AUTH.md), [provider integrations](docs/backend/INTEGRATIONS.md), [deployment](docs/backend/DEPLOYMENT.md), and the [readiness report](docs/backend/BACKEND_READINESS.md). The [QA audit](QA_AUDIT.md) begins with the current acceptance ledger and retains the historical frontend baseline below it.
