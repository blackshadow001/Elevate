# Elevate LMS QA automation

## Run the verified suites

Use Node.js 24 and `npm ci`. Keep the existing `.env.local` and user SQLite database untouched. The test suites create randomly named databases and media directories under `data/`, migrate and seed them, launch a production Next.js server on a free loopback port, then remove only their own records and files.

The local-media regression uses a real bundled WebM upload through the tutor browser and production HTTP API. The API test checks access denial, byte ranges, draft resave, submission, admin approval/publication, enrolled playback and persistence after server restart. On 20 October 2026, the full isolated backend suite passed 33/33 and the Playwright Chrome suite passed 12/12 grouped cases. The older coverage inventory below records the preceding local-preview-only phase.

```powershell
npm run build
npm run test:backend
npm run test:browser
npm run lint
```

`test:browser` uses installed Google Chrome at `C:\Program Files\Google\Chrome\Application\chrome.exe`. It requires that executable and a completed build. Its machine-readable JUnit report is `qa-artifacts/playwright-results.xml`; on failure Playwright retains a screenshot and trace in `test-results/`. The latter is ignored by Git because it can contain captured page data. `test:backend` requires a completed build and verifies HTTP APIs, migrations, authorization, ownership, idempotency, pricing, moderation, and restart persistence.

The tests generate a unique seed password per run. They do not use local user credentials, the live port 4500 database, external OAuth, or a payment provider. The seed provides isolated super admin, tutor, and learner personas. Browser tests use separate contexts for learner and admin. The account under test is never a production identity.

## Historical coverage boundaries — 12 October 2026

The browser suite currently covers public browsing and marketplace search/filter/sort, learner password login, free enrollment, two reading lessons, certificate visibility after reload, learner denial of the admin portal, admin password login, tutor draft creation/reload, invalid local preview file, real local-file video preview, actual 1×/1.25×/1.5× player rates and absence of 2×, missing-hosted-media submission rejection, 390px touch navigation, a complete reading-course moderation journey through rejection feedback, tutor resubmission, admin approval, price approval, explicit publication and public detail, a stored classroom-chat journey through join, send, reload and leave, and learner logout invalidation with no uncaught page exceptions on representative pages. These are eight grouped Playwright tests, not a rerun of the historical 72 grouped frontend cases.

The backend suite has 25 passing Node test cases as of 12 October 2026. Its page-route smoke verifies responses, not visual or interaction behavior. See the dated end-to-end lifecycle matrix in `QA_AUDIT.md` for scenario-level status and evidence.

Private media upload, signed playback, automatic captions, streaming, realtime delivery, and payment are provider-pending. Video watched-segment verification, WebVTT authoring, live quiz persistence, and real device preflight are absent. The server currently refuses client-declared completion of video lessons so a seek-to-end or crafted request cannot issue a certificate. Reading lessons retain the existing completion flow. This is a safe boundary, not a complete video-learning workflow.

## Defect evidence and priority

1. **P1, video completion forgery:** `updateProgress` previously trusted `completed: true` and `watchedSeconds` for a hosted video. The watch endpoint now persists time-bounded playback ranges and completion requires 90% coverage plus reaching the end; direct forged progress is rejected. Regression: `video completion and forged watched seconds require verified evidence` in `tests/backend/journeys.test.mjs` and `watched hosted video completes and persists` in `tests/browser/lifecycle.spec.mjs`.
2. **P2, misleading upload state:** Builder previously showed a timed fake 100% upload, hardcoded codec/duration, and sample playback for an arbitrary selected file. It now previews the selected MP4/WebM locally and labels it **Not uploaded**. Browser regression: `tutor draft persists and local video preview respects speed cap`.
3. **P2, speed policy:** Player offered 0.75× and 2×. It now offers 1×, 1.25× and 1.5×; browser test checks the actual media element at 1.5× and absence of 2×.
4. **P3, builder field label:** Course Title was visually labeled but lacked a programmatic label/input association. Fixed with matching `htmlFor` and `id`; Playwright locates it by accessible name.

No database schema or production record was changed by this QA pass. The priority for next implementation is provider-backed media with integrity checks, then server-validated watched segments and captions, followed by live transport/realtime/quiz/device preflight. Payment remains deferred.
