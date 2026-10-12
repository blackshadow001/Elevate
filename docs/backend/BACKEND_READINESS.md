# Backend readiness — Phase 1.5 audit

## Course lifecycle QA update — 12 October 2026

A new targeted matrix in `QA_AUDIT.md` records 37 scenarios: 25 PASS, 0 FAIL, 6 BLOCKED by external integration/scope, and 6 NOT IMPLEMENTED. These are current, executed outcomes where marked PASS; they do not replace the historical 72-case UI ledger. `npm run build` passed; isolated `npm run test:backend` passed 25/25; isolated Chrome `npm run test:browser` passed 8/8 grouped cases; the last lint run reported 0 errors and 270 warnings. Playwright JUnit evidence is `qa-artifacts/playwright-results.xml`. Tests used randomly named migrated/seeded databases and did not reset the local user database. The browser moderation journey exercised reading-course rejection feedback, tutor resubmission, explicit admin approval/pricing/publication, tutor API denial and public detail visibility; the same journey with a real uploaded video remains provider-blocked. Other browser journeys verified stored classroom chat after reload and server denial after leaving, marketplace search, category filtering, low/high price sorting, and learner logout invalidation.

The QA pass closed a high-risk progress gap: before this change, a client could submit `completed: true` or arbitrary `watchedSeconds` for a video lesson with a hosted key. Video progress now returns 409 `WATCH_EVIDENCE_REQUIRED` until server-validated watched-segment evidence is implemented; missing media still returns 409 `LESSON_MEDIA_UNAVAILABLE`. Reading lessons keep their idempotent completion path. A direct API regression verifies that no video progress or certificate row appears after forged requests. This is a deliberate protective limit, not a claim that video completion works.

The tutor builder now labels selected media as a **local preview** and **Not uploaded**, displays the actual selected MP4/WebM file through a blob URL, and rejects invalid preview files. A real valid upload still returns 503 `PROVIDER_NOT_CONFIGURED`; no private storage/transcoding service is configured. The player offers 1×, 1.25× and 1.5×; browser evidence confirms each changes the media element rate and 2× is absent. Captions, WebVTT authoring, watched-range persistence, live quizzes, actual device preflight, streaming, realtime fanout, and category CRUD remain absent or provider-pending as detailed in the matrix. Payment remains deferred.

## Admin portal route and access — 12 October 2026

The admin page tree moved from `/admin` to `/control-center`, with sign-in at `/control-center/login`. Former `/admin` page URLs return 404, including for an administrator. The URL change is organizational, not an authorization mechanism: the protected layout reads the server-side session and stored role on every request. An unauthenticated visitor is sent to the admin login; a signed-in learner or tutor receives a 404 for protected pages and is redirected to their own area if they open the admin login. Admin APIs remain under `/api/admin` for contract compatibility and continue to enforce server-side roles. The current production HTTP suite checked each protected page with admin, learner, tutor, and unauthenticated sessions; old URLs; and existing admin API denial. Build and backend suite passed (21/21); lint finished with 0 errors and 272 warnings. The browser UI was not retested for this URL change. Later sections retain historical route names and test results from the dates shown.

## Admin-only tutor provisioning — 12 October 2026

The super admin can create a tutor login in `/control-center/users`. `POST /api/admin/users` checks the persisted super-admin flag and current password, accepts only name, email and an audit reason, and creates an instructor account with a random temporary password displayed once. It stores only the password hash and writes a `tutor_created` audit entry. Learners, tutors, unauthenticated users and sub admins cannot call the endpoint. Public registration always assigns `learner` even when the request includes a forged role. An existing learner can be promoted only by the super admin through the audited user-directory action, which revokes existing sessions. The public instructor application remains a local preview; application submission/review and secure credential delivery are not implemented. Build and isolated backend HTTP tests passed (21/21), including forged role, access denial, CSRF, duplicate email, invalid payload/password, login, hash and audit assertions. Lint exited with 0 errors and 272 warnings. The new admin form itself was not browser-tested in this pass.

## Super admin profiles and password control — 11 October 2026

`/admin/profiles` is available only to an active account with the persisted `is_super_admin` flag. The super admin can create a new sub admin, reset an active sub admin's password, and change their own password after confirming their current password. Creation and reset produce a random one-time temporary password; the database stores only its scrypt hash. Resets and changes revoke all affected sessions and append a password-free audit event with actor, target, reason where applicable, and timestamp. User-directory pages and APIs are now super-admin-only. Sub admins keep operational admin access but cannot view administrator profiles, list user profiles, reset passwords, or change their own password through the admin portal. The operator-only CLI remains the recovery path for a lost super admin password. The current local database has one active super admin; deployments upgraded from migration 010 should review legacy accounts because that migration flagged pre-existing admin users as super admins.

The isolated production HTTP suite checked unauthorized learner/tutor/sub-admin access, direct profile-page redirects, creation payload role-escalation rejection, one-time password login, password reset and old-session invalidation, stored hash and audit records, weak own-password rejection, own-password change and re-login. Build and backend suite passed; lint reported zero errors and 291 warnings. Browser interaction remains unverified because the in-app browser automation launcher exits while enumerating a locked unrelated `E:` volume.


## Admin panel integration audit — 11 October 2026

Migration `011_admin_operations.sql` adds an append-only application audit table for user role/status and certificate revoke/restore actions, plus before/after JSON on course review and pricing history and indexes for admin filters. The existing local SQLite database was backed up with `VACUUM INTO` before migration 011; the isolated migration/test database also applied it. No production database outside this workspace was changed. Admin login was moved outside the protected `/admin` layout, resolving the redirect loop. The protected layout and every admin API still check the server-side role; only an active super admin can grant admin access. User changes revoke active sessions and require a reason.

The active admin dashboard reads SQLite counts and recent course/user/certificate audit actions. Its revenue and payout cards now report unavailable because no payment settlement or payout source exists. Admin course, user, live-class, certificate, and order APIs provide validated read filters and pagination. Order detail exposes stored quote items and any payment records without asserting settlement. Certificate revoke/restore and user moderation are transactional and audited. Course pricing history records the previous and new values; the UI distinguishes policy update from margin approval and uses the server's integer-minor-unit markup formula. The settings page is read-only for unsupported global platform-fee, settlement, streaming and payment controls. Category counts derive from courses; category CRUD is not implemented. Admin live operations show persisted schedules/attendance, not a streaming room service.

Verification: `npm run build` **PASS**; `npm run test:backend` **21/21 PASS**, including isolated migration, admin login/protected HTML, learner/tutor API denial, review/pricing lifecycle, user/certificate audit actions, order quote detail, restart persistence and the prior 47 route templates; `npm run lint` **0 errors, 291 warnings**. A current visual admin browser pass was **BLOCKED** because the in-app browser automation kernel exited while enumerating a locked unrelated `E:` volume. Direct local HTTP confirmed `/admin/login` rendered and an unauthenticated `/admin` response contained Next's redirect marker, but this is not a substitute for browser interaction testing. The earlier targeted admin browser observations below remain historical. The original 72-case matrix was not rerun this turn.

Remaining application work: category CRUD and a canonical category taxonomy; administrative course metadata editing beyond review/pricing; tutor application review; bulk actions and exports; configurable platform fee, payout/refund ledger only after financial rules/provider are defined; complete browser interaction and mobile acceptance. Payment capture/webhooks, private media delivery, live streaming/realtime engagement and outbound notifications remain provider-dependent. No completed transaction or delivery is claimed from a quote or local preview.


## Admin course review and pricing update — 10 October 2026

Migration `010_admin_course_review.sql` adds a dedicated admin role/provisioning flag, review state, per-course pricing policy and an actor/timestamp approval history without resetting existing users or courses. The operator-only `npm run admin:bootstrap` provisions the first super admin from environment variables after migrations; public registration cannot set a role. Only a super admin may promote an existing account through the protected user-management API. Role changes revoke the target's sessions. Admin login is at `/admin/login`; normal login rejects admin accounts. `/admin` is server protected and its APIs enforce the admin role. The admin page now explicitly waits for a request before reading the session in Next's partial prerendering mode.

Tutors can save and revise owned drafts and submit complete content for review. An admin can reject with feedback, approve content, approve/override pricing, publish explicitly, and unpublish. Public catalogue/detail and new orders require both published status and approved review. Tutors cannot change the official base, margin range, cap or status through crafted course payloads. A published course must be unpublished before tutor edits; those edits return it to draft for another submission. Enrolled learners can keep reading a course that an admin later unpublishes. Approval history records the actor, action, feedback and time. This is a **manual** unpublish/review cycle; staged live revisions are not implemented.

Pricing is a markup model, **not** a tutor payout model. INR prices are stored in minor units, margins in basis points, and the final amount is `base + round(base × marginBps / 10000)`. The server enforces range/cap on proposals and approvals and recomputes the approved final amount for orders. Existing published courses migrate with their current price as base and a 0% approved margin. Paid orders remain quotes/intents only; checkout returns `PAYMENT_REQUIRED`, with no charge, payout or webhook integration.

Verification after this change: production build **PASS**; backend tests **21/21 PASS** (including the legacy migration, one-time bootstrap, role escalation denial, admin transitions, margin bounds, official price/order consistency, unpublish visibility, session revocation and restart persistence); prior 47 page route templates were smoke checked again inside the HTTP suite. Lint: **0 errors, 204 warnings**. Targeted isolated-browser checks covered admin login/dashboard, course search/detail, pricing editor, tutor draft creation and missing-media submission guard, admin logout and tutor denial from `/admin`. The historical 72-case browser matrix was **not** rerun end to end for this change; its earlier 69 PASS, 2 BLOCKED, 1 NOT IMPLEMENTED ledger remains prior evidence rather than a new acceptance claim. See `QA_AUDIT.md` for scope and test details.

Remaining release gates: configure durable provider-backed media so new video submissions can pass validation; integrate payment checkout and trusted webhooks before paid enrollment; define revenue/payout rules before any tutor settlement; automate an admin UI browser suite including review transitions and mobile layouts; add a staged revision workflow if published courses must remain continuously available while being edited. Existing live streaming, realtime engagement and outbound notification provider limitations still apply below.

---

Audit date: 9 October 2026. Scope: this repository and an isolated seeded SQLite database. This is a single-instance prototype, not a production launch approval.

## Verified implementation

- Auth: salted scrypt hashes, 7-day HttpOnly session cookies, server-side expiry/revocation, same-origin write checks, and per-process login/registration throttling. Registration ignores client-supplied role and user ID.
- Data at the time of this Phase 1.5 audit: ordered migrations `001`–`009`, foreign keys, WAL, a 5-second busy timeout, and unique constraints for enrollments, lesson progress, certificates, wishlists, active classroom participants, and event/bootcamp registrations. Migration `010` is documented in the update above.
- Learner: published catalogue; search, filters, sorting and pagination; free enrollment; lesson progress; certificate issuance and public verification; wishlist; stored notifications; free event/bootcamp registration.
- Instructor: owned course creation/editing/publish validation, students/analytics scoped to owned courses, owned live class scheduling/status, stored classroom chat and moderation, owned bootcamp/session publishing.
- Live: schedule, reminder preferences, attendance and stored chat. Reminder delivery and real-time fanout are not implemented.

## Findings and corrections

The final browser gate found stale lesson content after Previous navigation, an elapsed bootcamp date hiding a linked live classroom, and a certificate frame that clipped long fields in PDF export. The lesson now follows the route, linked live-class status takes precedence, and the certificate frame grows with its content. The browser verified each correction, including a rendered one-page A4 landscape stress PDF. Instructor curriculum order and reading content now persist; server publication rejects blank readings and quiz/project lessons lacking an authoring workflow. The isolated HTTP suite includes regressions for live bootcamp status and these publish guards. Mobile toasts now fit a 390 px viewport; four queued notices were observed in order with manual dismissal and duplicate suppression.

| Severity | Finding | Correction / evidence |
|---|---|---|
| P1 | A published preview lesson in a draft course could pass the media-access authorization query. A configured media provider would have returned its URL to an unrelated learner. | Preview access now requires the parent course to be published. A regression constructs a draft preview asset and confirms 403. The current provider still returns 503 for authorized requests. |
| P1 | An instructor could add a published lesson or change a lesson's status/type after learners enrolled, making existing progress and certificates inconsistent. | Progress-changing curriculum edits now return 409 once a course has enrollments; an HTTP regression covers each path. Draft additions and text edits remain available. |
| P2 | Rescheduling a cancelled class displayed a success toast but left its status cancelled. | The instructor UI now sends a single validated `cancelled` to `scheduled` update with a future date; an HTTP regression covers ownership, invalid transitions and past dates. The browser confirmed the class appears as Upcoming after reload. |
| P2 | Some frontend labels presented fixture-based engagement analytics and provider-free classroom actions as real outcomes. | Live summary and list labels now describe schedule/attendance data actually stored, and device/poll/streaming controls identify their demo state. Dashboard recommendations use the catalogue API rather than fixture counts. |
| P3 | The live class card compressed the participant and streaming labels together at the checked desktop width. | Added spacing and wrapping to the status row without changing the card design. |
| P2 | Privacy/terms copy claimed telemetry, TLS 1.3, paid access and refunds absent from this prototype; bootcamp copy presented elapsed sessions as learner progress. | Copy now describes current implementation and pending production policy/provider work. The bootcamp card labels schedule status. |
| Documentation | API reference listed `POST` for the lesson progress endpoint and an unsupported `price` filter. | Corrected to `PUT` and `maxPrice` in `API.md`. |

No critical/high security finding remains open from the exercised cases. This is not proof that untested endpoints or deployment configurations are secure.

## Verification run

| Gate | Result |
|---|---|
| `npm run build` | PASS, production compile and TypeScript completed. |
| `npm run test:backend` | PASS, 18/18 subtests in one isolated production HTTP suite. |
| Page templates | 47/47 returned HTTP status below 400 in the suite; this is not visual or interaction QA. |
| `npm run lint` | PASS with 0 errors and 203 warnings. Most are unused bindings and raw `<img>` performance recommendations; no broad cleanup was attempted. |
| SQLite backup/restore | PASS on isolated QA data: `VACUUM INTO` snapshot copied to a restore file; 9 course rows matched and `PRAGMA integrity_check` returned `ok`. |
| Browser interaction matrix | Final ledger: 69 PASS, 2 BLOCKED, 1 NOT IMPLEMENTED across 72 grouped cases in [QA_AUDIT.md](../../QA_AUDIT.md). Port 4502 used an isolated seeded QA database. The previously passed 53 cases were retained from the earlier port 4501 run, not all freshly repeated after the last fixes. The checked learner/certificate browser console had no app errors. This is not full acceptance. |

The HTTP suite covers unauthenticated access, role and cross-instructor boundaries, forged role/user fields, cross-user enrollment/wishlist/certificate access, malformed inputs, rate limiting, CSRF, session expiry/logout, 8-way concurrent enrollment/progress/certificate retries, event/bootcamp repeat registration, lesson-course mismatch, foreign-key integrity, classroom attendance/chat/leave, cancelled-class rescheduling, publish guards and an application restart. It does **not** cover multi-process write contention, every endpoint variant, all UI outcomes, every browser console path, print layout, or a full accessibility audit.

## SQLite operations and limits

`DATABASE_URL=file:<path>` must point to a durable writable file; production has no default. Run `npm run db:migrate` before the server and after deploying new migration files. The migration runner records applied filenames in `schema_migrations` and wraps each migration in `BEGIN IMMEDIATE`. The API enables foreign keys, WAL and a 5-second busy timeout on its connection. The HTTP suite demonstrated persisted sessions, enrollment and certificates after a real production server restart.

For a consistent online backup, use SQLite `VACUUM INTO` with a new target path, then open the copy and run `PRAGMA integrity_check` and `PRAGMA foreign_key_check`. Restore only with the app stopped: preserve the original file, copy the verified snapshot to the configured `DATABASE_URL` path, run migrations if the code requires newer schema, and check representative records before reopening traffic. Never copy only the main `.sqlite` file while a WAL writer is active. The isolated snapshot/restore check above is a procedure test, not a backup of production learner data.

SQLite fits one durable host with modest writes. WAL still allows one writer at a time; in-memory rate limits are per process; concurrent app instances need shared persistence and throttling. Ephemeral or serverless filesystems would lose data. Node 24 currently emits an experimental `node:sqlite` warning. Do not move to another database without load evidence, schema/ID mapping, migration/backfill, cutover and rollback plans.

## Provider and contract boundaries

| Area | Current result | Remaining integration |
|---|---|---|
| Paid courses/events | 409 `PAYMENT_REQUIRED`; order intent has no checkout success | Payment provider, trusted webhook, reconciliation, refund policy/tests |
| Private video/resources | 503 `PROVIDER_NOT_CONFIGURED`; newly published video lessons require hosted media keys. Classroom sample resources show Pending except the public documentation link. | Private storage, upload processing, signed playback/download, authorization tests |
| Live streaming | Class status/attendance persist; classroom preview is local | Room provider, short-lived tokens, provider event verification |
| Chat/engagement | Chat records persist; no real-time fanout. Q&A, polls, raise hand, device controls and whiteboard are local preview state | Real-time transport, presence, moderation, durable engagement |
| Reminders/notifications | Preferences and in-app records persist; no delivery | Email/push transport, workers, retry and preference rules |
| Certificates | Issuance, owner detail and public lookup persist; browser PDF export rendered as one A4 landscape page for normal and long-field fixtures | Production identity, anti-fraud and signed export policy |
| Bootcamp learner completion | Schedule status and registration persist; no actual attendee completion percentage is recorded | Define completion/attendance rules, persist per-session evidence, verify after reload |
| Events | Seeded events can be listed and registered; no instructor event creation API/UI | Event authoring/moderation workflow if product scope requires it |
| Analytics | Stored aggregate counts; views/revenue are unavailable | Event pipeline and payment reconciliation |

Seeded published video courses lack hosted media and cannot be completed through the backend. The free reading starter course is the validated learner-to-certificate path. Public marketing, career-path and some classroom displays still use deliberate fixtures; they are not authoritative account data. The dashboard recommendation list reads the catalogue API. `QA_AUDIT.md` distinguishes observed UI behavior from remaining partial cases.

## Next gates

1. Resolve the two blocked browser cases (private classroom resources and full builder authoring/media) and the unimplemented learner bootcamp completion case. Automate and freshly rerun all 72 grouped cases before acceptance.
2. Add endpoint-wide authorization and payload fuzzing, including admin and provider callback routes as they are introduced.
3. Add multi-process SQLite write/load tests and monitor lock timeouts before raising traffic limits.
4. Automate versioned backups, restore drills, retention and off-host storage for the real deployment target.
5. Configure private media and signed delivery before enabling video publication at scale.
6. Integrate payments with trusted webhook state transitions before paid enrollment.
7. Add a live provider and real-time engagement transport with presence and moderation.
8. Establish production privacy, terms, support and notification-delivery workflows.
# Google sign-in update — 12 October 2026

Google authorization-code sign-in is implemented for the main learner/tutor login and learner signup. It uses the server-held web client credentials, PKCE, state and nonce cookies, Google's signed ID-token verification, an additive `auth_identities` table keyed by Google `sub`, and the existing one-session-per-user cookie. New identities create learner records only; existing tutor roles come from the database; admin accounts are refused on this route. Non-authoritative third-party email claims require an authenticated password-session linking step. The local database was backed up to `data/learnly-pre-google-2026-10-12.sqlite` before migration `012_google_identities.sql` was applied. The supplied JSON is ignored by Git and referenced from ignored `.env.local`.

**Acceptance boundary:** The JSON contains a web client ID and secret but lists no authorized redirect URI. The operator must register `http://localhost:4500/api/auth/google/callback` (or the deployed HTTPS equivalent) in Google Cloud Console and configure consent-screen test users. Until then, an actual Google consent/token round trip is not verified. Local HTTP tests cover the outbound authorization URL, PKCE, state cookie and rejection, and link access guard; they do not prove Google callback success. Cross-device LAN-IP login requires a configured HTTPS origin because the localhost redirect targets the device running the browser.

Verification for this change: `npm run build` passed; `npm run test:backend` passed **23/23**; `npm run lint` reported **0 errors, 272 warnings**; `npm audit --omit=dev` found **0 production dependency advisories**. Browser inspection confirmed the Google options on `/login` and `/signup`. The local endpoint produced an authorization redirect with the configured callback, state, PKCE and cookie; the LAN endpoint returned a same-host origin error without contacting Google. The SQLite migration passed `PRAGMA integrity_check` and `PRAGMA foreign_key_check`.

