# Elevate frontend QA audit

## Network admin login reload — 12 October 2026

The browser was opened at `http://172.31.144.1:4500/control-center/login?`. The development log explicitly showed Next.js blocking dev assets from `172.31.144.1`, which was absent from `allowedDevOrigins`. With client JavaScript blocked, form submission fell back to a normal GET reload. Added the observed host to the allowlist and removed redundant client auth refresh/redirect calls after a successful admin login. After a browser reload, the Show/Hide password control responded, confirming that client JavaScript loaded from that host. Build passed, isolated backend tests passed 21/21, and lint finished with 0 errors and 272 warnings. A credentialed browser sign-in was not performed on the user's database; the isolated backend suite covers admin login, session and protected-page authorization.

## Admin route access check — 12 October 2026

The admin page tree is now `/control-center`; sign-in is `/control-center/login`. The old `/admin` pages return 404. The admin session and stored role are checked by the protected layout and each admin API; a renamed URL is not treated as a security control. The production HTTP suite fetched every admin page with admin, learner, and tutor sessions, verified unauthenticated redirection, checked old URLs, and repeated API authorization checks. Build passed, backend tests passed 21/21, and lint finished with 0 errors and 272 warnings. A browser interaction check of the renamed navigation was not run in this pass. Older sections below retain the historical `/admin` URLs as records of tests performed before the rename.

## Elevate branding validation — 12 October 2026

- Replaced user-facing Learnly copy across public pages, learner flows, instructor/admin shells, certificate, live learning, seed notification template, and demo video. The approved supplied artwork is at `public/branding/elevate-orange-ribbon-logo.png`; the reusable wordmark and metadata use `src/lib/brand.ts`.
- Production build passed after adding the Tailwind PostCSS plugin. A browser check caught a prior webpack build that served unexpanded `@tailwind utilities`; the corrected CSS contains utility rules and the homepage renders with the intended styling.
- Backend suite passed 21/21, including HTTP page-route smoke checks. Lint passed with 0 errors and 272 warnings. The first backend attempt was blocked from reaching its temporary localhost server by the sandbox; the successful rerun used localhost networking.
- Browser checked `/`, `/courses`, `/login`, `/signup`, `/admin/login`, and `/about`: Elevate titles and visible copy, loaded logo image, no horizontal overflow, no captured console errors or warnings. At 390px, `/`, `/courses`, `/login`, and `/admin/login` had no horizontal overflow; the admin login layout was visually inspected. Icon, manifest, Open Graph title and image URL were verified on `/`.
- Authenticated learner, instructor, and admin page visuals were not rechecked with logged-in browser sessions. The existing 72-case interaction ledger below remains historical and was not rerun for this branding task.
- Intentional old-name references remain in the session cookie, SQLite filename, mock meeting URL, and historical QA/API documentation. Read-only inspection found two existing local demo rows with old-brand text: the `usr_003` admin display name and `seed-notification-1` title. They were left unchanged to preserve stored user and notification data; operators may review those demo records separately.

## Super admin profile and password controls — 11 October 2026

The new `/admin/profiles` page lets the super admin create sub admins, reset their passwords, and change their own password. Existing passwords are never displayed. The user directory and administrator profiles are hidden from sub-admin navigation and protected by server-side super-admin checks. The generated temporary password is returned once, stored only as a scrypt hash, and reset revokes the target's sessions. Changing the super admin's password revokes their sessions and sends the UI back to `/admin/login`.

| Check | Actual test | Status |
|---|---|---|
| Access and role escalation | Isolated production HTTP denied unauthenticated, learner, tutor, and sub-admin profile API access; direct sub-admin page request contained a redirect; crafted `isSuperAdmin` creation field returned 422. | PASS at HTTP layer. |
| Sub-admin creation | Super admin re-entered current password in API request, created a new admin with `is_super_admin=0`; generated one-time password signed in; stored hash did not contain plaintext. | PASS at HTTP layer. |
| Sub-admin reset | Wrong super-admin password and sub-admin self reset were denied. Valid reset replaced the password, revoked the old session, rejected old credentials, accepted new credentials, and wrote an audit record. | PASS at HTTP layer. |
| Super-admin own password | Weak password and sub-admin change were denied. Valid change revoked the old session, rejected old credentials, accepted new credentials and allowed logout. | PASS at HTTP layer. |
| Visual browser controls | The in-app browser automation kernel again exited while enumerating an unrelated locked `E:` drive. | BLOCKED; UI interaction and mobile layout not visually verified. |

`npm run build` passed; `npm run test:backend` passed 21/21; lint reported 0 errors and 291 warnings. This targeted addition does not change the historical 72-case matrix count below.


## Admin backend connection pass — 11 October 2026

This delta covers the admin request only. It does not replace the original 72 case IDs or claim a fresh browser matrix pass. The current browser automation kernel failed to start while enumerating an unrelated locked `E:` drive. No admin visual interaction was marked PASS from this run.

| Area | Actual verification | Result |
|---|---|---|
| Admin login and protected pages | Production HTTP test rendered `/admin/login`, checked unauthenticated `/admin` for Next's redirect marker, and fetched 10 protected admin page templates with an admin session. Normal login rejected admin; admin login rejected tutor. | PASS at HTTP layer; browser interaction BLOCKED by launcher. |
| Admin API authorization | Isolated tests checked 401 unauthenticated and 403 learner/tutor responses for users, certificates, live classes, orders and courses. Non-super admin role change was denied; public registration could not choose admin. | PASS. |
| Course review and pricing | Existing journey created/submitted/rejected/resubmitted/approved/published/unpublished a course, rejected tutor admin writes and invalid margin bounds, verified price in catalogue/detail/order item and restart persistence. Pricing UI now separates policy save and margin approval. | PASS at API layer; current browser controls unverified. |
| Users and audit | Server-side search/role/status/page validation, user detail GET, mandatory reason, session revocation and audit row after role promotion were tested. | PASS at API layer; browser controls unverified. |
| Certificates | Registry search/status/page validation; instructor revoke denied; missing reason rejected; revoke/restore each wrote an audit row in isolated SQLite. | PASS at API layer; browser controls unverified. |
| Orders | Server-side search/status/page, persisted quote list and detail with item price and empty payment records; learner detail denied. UI now labels quotes/statuses without claiming settlement. | PASS at API layer; browser controls unverified. |
| Live operations | Admin-only persisted schedule list and invalid-filter response tested. UI now uses the real endpoint and correct classroom URL; streaming is explicitly provider-pending. | PASS at API layer; browser controls unverified. |
| Settings and categories | Settings' fake save and provider claims removed. Category page uses stored course aggregation. Global fee/payout settings and category CRUD are absent. | Read-only truthful fallback; write controls NOT IMPLEMENTED. |
| Other admin controls | No UI/backend exists for tutor application review, bulk actions, financial exports, or editing course metadata beyond review/pricing. | NOT IMPLEMENTED; no fake success state is shown. |
| Build, lint, existing flows | `npm run build` PASS; `npm run test:backend` 21/21 PASS, including prior 47 route-template smoke, learner/instructor journeys, migration and restart; `npm run lint` 0 errors, 291 warnings. | PASS for executed checks. |

Migration `011_admin_operations.sql` was applied to the local SQLite database after a consistent `VACUUM INTO` snapshot. No payment, private media, streaming, realtime fanout, reminder delivery, refund or payout provider was added. The current admin UI still requires a visual desktop/mobile pass once browser automation can start; the historical 69 PASS / 2 BLOCKED / 1 NOT IMPLEMENTED frontend ledger below is unchanged.


## Admin approval and pricing feature delta — 10 October 2026

This section records the new feature's verification without rewriting the original 72 case IDs below. The old case **61** describes a tutor publishing directly; that behavior is intentionally superseded. A tutor now submits for approval, and an admin must separately approve content and pricing and explicitly publish. The 72-case ledger remains historical evidence and has **not** been fully rerun after this feature. Its prior result was 69 PASS, 2 BLOCKED and 1 NOT IMPLEMENTED; no new 72-case acceptance count is claimed.

| New check | Actual test and result | Status / remaining work |
|---|---|---|
| Admin authentication and access | Isolated browser signed in at `/admin/login`, opened protected `/admin`, logged out to admin login; tutor direct navigation redirected. HTTP suite denied learner/tutor admin APIs, denied normal login to an admin account, rejected public role escalation, revoked sessions on promotion, and denied non-super admin promotion. | PASS for tested routes and API boundaries. |
| Dashboard and review queue | Browser showed course/tutor/learner counts, search narrowed the list to one matching course, selected preview displayed content/pricing/history. HTTP suite found tutor submission only in the protected admin workflow. | PASS for tested desktop interactions; full mobile/accessibility sweep not run. |
| Tutor draft and media validation | Browser saved a synthetic draft, saw it in the course list after navigation, attempted submission, received hosted-media validation, and draft remained draft. HTTP suite tested reading and video completeness. | PASS for tested paths; provider-backed video delivery remains BLOCKED. |
| Approval state machine | HTTP test created a draft, submitted, rejected with reason, revised/resubmitted, approved content, verified still private, explicitly published, then unpublished and verified public detail/order denial. Actor/history persisted after server restart. | PASS at API layer; browser approve/reject/publish sequence not yet automated or manually completed. |
| Pricing authority | Browser set a ₹2,000 base and 10–25% range; 20% calculated ₹2,400 and history recorded the update. HTTP tests denied tutor writes to admin fields, checked 9%/26% failures and cap, approved 20%, and matched catalogue/detail and persisted order item at 240,000 minor units. | PASS for tested browser/API paths; paid checkout provider remains BLOCKED. |
| Ownership and persistence | HTTP tests denied another tutor's edit, denied tutor admin review/pricing, confirmed course review/history survived application restart, and migration preserved published legacy prices. | PASS. |
| Existing page templates | Backend HTTP suite revisited the pre-existing 47 page route templates. `/admin/login` and `/admin` were checked in the targeted browser session. | PASS as smoke checks only; route status does not prove interaction behavior. |

**Executed gates:** `npm run build` PASS (including the final `/admin` request-time boundary); `npm run test:backend` 21/21 PASS (isolated SQLite); `npm run lint` 0 errors, 204 warnings. One initial sandboxed backend run could not connect to its temporary loopback server; the authorized local-access rerun passed. The new admin browser checks used an isolated QA database on port 4503; the rebuilt protected dashboard rendered on a fresh tab with no browser console errors or warnings. The temporary QA database and server were removed after testing; the user's port 4500 server and primary database were not used for test mutations. Payment, private media, live streaming, realtime engagement and outbound notifications remain provider-dependent. No charge or tutor payout was claimed.

---

## Final browser acceptance gate — 9 October 2026

This ledger retains the original 72 case IDs, descriptions and expected actions. The 53 previously passed cases use the earlier isolated Phase 1.5 browser evidence; the 18 then-open cases were revisited in this gate. The HTTP route sweep is reported separately. **The gate is not full acceptance** while cases 44, 51 and 59 remain open.

| # | Original location / element | Expected action | Final status | Actual browser test and result | Fix / remaining dependency |
|---:|---|---|---|---|---|
| 1 | Public logo | Home | PASS | Earlier isolated Phase 1.5 browser pass: Opens `/` | — |
| 2 | Navbar Courses | Marketplace | PASS | Earlier isolated Phase 1.5 browser pass: Opens `/courses` | — |
| 3 | Navbar Career Paths | Paths | PASS | Earlier isolated Phase 1.5 browser pass: Opens `/career-paths` | — |
| 4 | Navbar Live Learning | Live hub | PASS | Earlier isolated Phase 1.5 browser pass: Opens `/live` | — |
| 5 | Navbar Explore | Category/path menu | PASS | Earlier isolated Phase 1.5 browser pass: Opens submenu with real destinations | — |
| 6 | Navbar search | Course search | PASS | Earlier isolated Phase 1.5 browser pass: Submits query to marketplace | — |
| 7 | Login / Sign Up | Auth pages | PASS | Earlier isolated Phase 1.5 browser pass: Correct routes and role-aware signed-in state | — |
| 8 | Mobile menu open/close | Toggle drawer | PASS | Earlier isolated Phase 1.5 browser pass: Both states render | — |
| 9 | Mobile Explore | Toggle submenu | PASS | Earlier isolated Phase 1.5 browser pass: Expands/collapses | — |
| 10 | Mobile link navigation | Navigate and close menu | PASS | Earlier isolated Phase 1.5 browser pass: `/career-paths` opened and drawer closed | — |
| 11 | Footer platform links | Correct pages | PASS | Earlier isolated Phase 1.5 browser pass: Routes resolve | — |
| 12 | Footer resource links | Correct pages | PASS | Earlier isolated Phase 1.5 browser pass: Routes resolve | — |
| 13 | Footer company/legal links | Correct pages | PASS | Earlier isolated Phase 1.5 browser pass: Routes resolve | — |
| 14 | Marketplace search by title | Filter results | PASS | Earlier isolated Phase 1.5 browser pass: Matching cards render | — |
| 15 | Marketplace search by instructor | Filter results | PASS | Earlier isolated Phase 1.5 browser pass: Matching cards render | — |
| 16 | Marketplace search no result/clear | Helpful recovery | PASS | Earlier isolated Phase 1.5 browser pass: Empty state and clear action work | — |
| 17 | Marketplace category | Filter cards | PASS | Earlier isolated Phase 1.5 browser pass: Slug mappings resolve | — |
| 18 | Marketplace level/price/rating | Combine filters | PASS | Selected single and combined level, category, rating and price filters; counts reached 5, 3, 1 and a recoverable zero-result state. | — |
| 19 | Marketplace sort options | Five sorts | PASS | Selected all five sorts; first card changed for newest, price low and price high; popular/rating ordering matched their scores. | — |
| 20 | Course card body/image/title | Correct detail | PASS | Earlier isolated Phase 1.5 browser pass: Opens selected course | — |
| 21 | Course card wishlist | Save/unsave | PASS | Earlier isolated Phase 1.5 browser pass: Toggles without card navigation, 44px target | — |
| 22 | Course detail tabs | Change content | PASS | Overview, Curriculum and Instructor tabs switched visible tabpanels; curriculum accordion still opened. | Tab panels now change content. |
| 23 | Course curriculum accordion | Open/close section | PASS | Earlier isolated Phase 1.5 browser pass: Independent state and keyboard button | — |
| 24 | Course enroll | Persistent free enrollment | PASS | Earlier isolated Phase 1.5 browser pass: Adds enrolled course without claiming payment | — |
| 25 | Enrollment modal | Cancel/confirm/close | PASS | Cancelled enrollment and dismissed modal by Escape and close; confirmed free enrollment appeared in learning. | — |
| 26 | Dashboard My Learning | Continue course | PASS | Earlier isolated Phase 1.5 browser pass: Enrolled course appears and opens player | — |
| 27 | Lesson selection/next/previous | Navigate lessons | PASS | Previous, Next and sidebar selection changed URL and visible lesson; stale lesson display was reproduced and fixed. | Lesson derives from the route; page-local notes/questions are lesson-scoped. |
| 28 | Mark lesson complete | Idempotent progress | PASS | Earlier isolated Phase 1.5 browser pass: Repeated action does not double count | — |
| 29 | Final lesson | Complete course | PASS | Earlier isolated Phase 1.5 browser pass: Certificate record created | — |
| 30 | Video play/pause | Control media | PASS | Earlier isolated Phase 1.5 browser pass: Local demo clip loads and time advances/pauses | — |
| 31 | Video seek/volume/mute/speed | Control media | PASS | Dragged video timeline (0 to 6 of 12 seconds), adjusted volume to 0.3, and checked mute and speed. | — |
| 32 | Video fullscreen/keyboard | Player control | PASS | Entered and exited fullscreen; keyboard media controls were exercised in the prior browser pass. | — |
| 33 | Player notes/Q&A/resources | Honest demo action | PASS | Submitted note and Q&A text; empty resource state explained availability. Notes/Q&A now remain tied to the current lesson only. | Clarified demo persistence and empty resources. |
| 34 | My Certificates | Earned list | PASS | Earlier isolated Phase 1.5 browser pass: Newly earned record appears for current learner | — |
| 35 | Certificate detail | Dynamic fields | PASS | Earlier isolated Phase 1.5 browser pass: Learner, course, instructor, date and ID from record | — |
| 36 | Certificate download/print | A4 landscape PDF/print | PASS | Exported normal and long-field browser PDFs; both were one-page A4 landscape. Rendered pages showed borders, names, tags, signatures and verification details without clipping. | Certificate frame grows for long content. |
| 37 | Certificate verification | Known/unknown ID | PASS | Earlier isolated Phase 1.5 browser pass: Generated ID verifies; unknown ID fails clearly | — |
| 38 | Live hub cards/tabs | Detail navigation | PASS | Earlier isolated Phase 1.5 browser pass: Class, bootcamp, event routes resolve | — |
| 39 | Learner class details | Join classroom | PASS | Earlier isolated Phase 1.5 browser pass: Correct class ID/title, unavailable ID handled | — |
| 40 | Classroom chat | Send message | PASS | Earlier isolated Phase 1.5 browser pass: Message appears and input clears | — |
| 41 | Classroom Q&A | Ask question | PASS | Earlier isolated Phase 1.5 browser pass: Question appears | — |
| 42 | Classroom raise hand | Raise/lower | PASS | Earlier isolated Phase 1.5 browser pass: State toggles for learner | — |
| 43 | Classroom microphone/camera | Demo state | PASS | Earlier isolated Phase 1.5 browser pass: Controls toggle local states and explain no device connection | — |
| 44 | Classroom resources | Open/download | BLOCKED | Opened the Resources tab; the public React documentation link was usable, while three file entries correctly showed Pending. | Private file delivery needs a storage provider; pending files are not downloadable. |
| 45 | Classroom poll | Select/vote/close | PASS | Voted once in the sample poll, observed results and repeated-vote block, then closed the poll. | — |
| 46 | Classroom leave | Exit | PASS | Earlier isolated Phase 1.5 browser pass: Confirmation modal and `/live` exit tested | — |
| 47 | Event registration | Register/cancel | PASS | Registered and cancelled a free event in the UI; reload preserved cancellation. | — |
| 48 | Event share | Share/copy | PASS | Earlier isolated Phase 1.5 browser pass: Link copy fallback and success notice tested | — |
| 49 | Bootcamp registration | Register/unregister | PASS | Registered and unregistered a free bootcamp in the UI; reload preserved cancellation. | — |
| 50 | Bootcamp sessions | Join available session | PASS | The linked Day 5 session displayed Live Now despite its elapsed date; after registration, Join opened the authorized `/live/classes/live-1` classroom. | Live class status now overrides an elapsed bootcamp date; HTTP regression added. |
| 51 | Bootcamp progress | Show actual completion | NOT IMPLEMENTED | The visible percentage counts elapsed scheduled sessions, not learner attendance or completion; no completion record exists. | Actual learner completion needs persisted session attendance/completion rules; no provider-backed attestation exists. |
| 52 | Login learner | Role redirect | PASS | Earlier isolated Phase 1.5 browser pass: Opens `/dashboard` | — |
| 53 | Login instructor | Role redirect | PASS | Earlier isolated Phase 1.5 browser pass: Opens `/instructor` | — |
| 54 | Logout | Clear session | PASS | Earlier isolated Phase 1.5 browser pass: Opens `/login`, role UI clears | — |
| 55 | Signup | Validate and create learner account | PASS | Empty form and password mismatch showed validation. With action-time approval, synthetic registration redirected to a new learner dashboard. | — |
| 56 | Forgot password | Explain recovery | PASS | Earlier isolated Phase 1.5 browser pass: Clear backend-required message | — |
| 57 | Contact form | Validate/submit | PASS | Earlier isolated Phase 1.5 browser pass: Empty, invalid email and valid demo preview tested | — |
| 58 | Instructor application | Validate/submit | PASS | Earlier isolated Phase 1.5 browser pass: Empty/valid demo preview tested | — |
| 59 | Instructor create course | Add basics/curriculum | BLOCKED | Added, edited, deleted and reordered sections/lessons; saved draft, refreshed, edited reading content, and verified media publish rejection. Interactive quiz, assignment and resource authoring remain unavailable. | Added move controls, reading authoring, and server publish guards. Quiz/project/resource authoring and private media provider remain pending. |
| 60 | Instructor save draft | Persist | PASS | Earlier isolated Phase 1.5 browser pass: Draft appears in list after refresh | — |
| 61 | Instructor publish | Validate required data | PASS | Earlier isolated Phase 1.5 browser pass: Incomplete course blocked; published course appears in marketplace | — |
| 62 | Instructor edit course | Persist edits | PASS | Earlier isolated Phase 1.5 browser pass: Existing create builder prepopulates saved course | — |
| 63 | Instructor create live class | Schedule | PASS | Earlier isolated Phase 1.5 browser pass: New ID and detail route survive refresh | — |
| 64 | Instructor edit/reschedule class | Update details | PASS | Earlier isolated Phase 1.5 browser pass: Saved schedule survives refresh | — |
| 65 | Instructor cancel class | Confirm/cancel | PASS | Earlier isolated Phase 1.5 browser pass: Modal dismiss and confirmation state tested | — |
| 66 | Instructor start class | Enter studio | PASS | Earlier isolated Phase 1.5 browser pass: Correct class title and status | — |
| 67 | Instructor studio controls | Toggle demo states | PASS | Earlier isolated Phase 1.5 browser pass: Mic, camera, screen share, poll, whiteboard, recording and end state reviewed | — |
| 68 | Instructor create bootcamp | Save sessions/details | PASS | Earlier isolated Phase 1.5 browser pass: New bootcamp opens learner detail | — |
| 69 | Instructor analytics/students/settings | Navigate and render | PASS | Earlier isolated Phase 1.5 browser pass: Pages load without broken links or console errors | — |
| 70 | Notifications | Queue and dismiss | PASS | Four rapid classroom actions produced one toast at a time in the order Mic Unmuted, Camera On, Hand Raised, Mic Muted. Manual/auto dismissal advanced; duplicate Link copied was suppressed; 390px toast fit within 16px margins. | Mobile toast positioning corrected; queue logic verified in browser. |
| 71 | Invalid dynamic routes | Recover | PASS | Earlier isolated Phase 1.5 browser pass: Course, lesson, class, bootcamp and certificate show useful error actions | — |
| 72 | Support/blog/company routes | Navigate/render | PASS | Opened all three blog articles and checked article content; support, company and footer routes were checked in the prior browser pass. | — |

**Final ledger: 69 PASS, 2 BLOCKED, 1 NOT IMPLEMENTED.** Case 44 requires private resource storage/delivery. Case 59 requires quiz, assignment and resource authoring plus a configured private media provider to finish the grouped builder/media scope. Case 51 needs a persisted learner session completion model; elapsed dates are schedule status only. The historical 53 passes were not all repeated after the final small builder/print fixes, so this is not a fresh 72-for-72 rerun.

### Gate evidence and test environment

- Isolated acceptance database: `data/phase15-acceptance.sqlite`, migrated and seeded with 8 users, 9 courses, 30 lessons, 4 live classes, 2 bootcamps and 5 events. The test-only signup and draft were created there. A second clean seed (`data/phase15-finalcheck.sqlite`) confirmed the registered learner could enter the linked live classroom. Both isolated databases and WAL files were removed after testing; the primary `data/learnly.sqlite` was untouched.
- Browser: production build on port 4502. The long certificate fixture was restored after stress testing. The generated PDF reported one A4 landscape page (841.89 × 595.28 pt); rendered evidence for [normal fields](docs/qa-evidence/certificate-normal.png) and [long fields](docs/qa-evidence/certificate-long.png) showed no clipping or surrounding navigation.
- `npm run build`: pass. `npm run test:backend`: 18/18 pass, including the 47-page route smoke, ownership, media/publish, bootcamp live-status, session revocation and restart tests. `npm run lint`: 0 errors, 203 warnings.
- Browser console inspection on the checked learner and certificate paths showed no application errors. This does not establish a clean console on every route.
- Provider boundaries: free enrollment/progress/certificate issuance, registration, persisted scheduling/chat and reminders work in SQLite. Payments, private media delivery, live streaming, real-time engagement, outbound reminders and trustworthy attended-session completion are pending. No payment or delivery success was simulated.

### Corrections made in this gate

- Fixed route/lesson display synchronization and scoped temporary notes/questions to the selected lesson.
- Made course-detail tabs switch content and added readable demo/pending labels where actions lacked stored results.
- Corrected live bootcamp joining when the linked class is live even after the scheduled date; added a regression assertion.
- Added builder move controls and reading content editing; blocked publishing empty reading and unsupported interactive activities with HTTP regressions.
- Fixed mobile toast positioning and certificate overflow with long names, titles and skills.

### Remaining acceptance work

1. Connect private lesson/class resource storage and authorized delivery, then repeat case 44 with an actual file.
2. Implement and test quiz, assignment and resource authoring/submission and configure hosted media, then finish case 59 end to end.
3. Define and persist a learner bootcamp session completion rule, then verify case 51 across join, leave, end and reload.
4. Automate browser interaction coverage for all 72 cases and rerun the historical 53 cases after the next integration change.

---

## Phase 1.5 regression matrix — 9 October 2026

The historical matrix below records the earlier backend-integrated browser pass against an isolated seeded production build. **B2:** some actions in the grouped case were exercised, but the full expected behavior was not established. **B4:** the seeded bootcamp session was not joinable at the test time, so the join outcome could not be exercised. **N1:** actual learner session completion progress is not implemented; the UI now labels elapsed schedule status. HTTP coverage never counts as an interaction pass.

| # | Location / element | Expected action | Phase 1.5 UI status |
|---:|---|---|---|
| 1 | Public logo | Home | PASS |
| 2 | Navbar Courses | Marketplace | PASS |
| 3 | Navbar Career Paths | Paths | PASS |
| 4 | Navbar Live Learning | Live hub | PASS |
| 5 | Navbar Explore | Category/path menu | PASS |
| 6 | Navbar search | Course search | PASS |
| 7 | Login / Sign Up | Auth pages | PASS |
| 8 | Mobile menu open/close | Toggle drawer | PASS |
| 9 | Mobile Explore | Toggle submenu | PASS |
| 10 | Mobile link navigation | Navigate and close menu | PASS |
| 11 | Footer platform links | Correct pages | PASS |
| 12 | Footer resource links | Correct pages | PASS |
| 13 | Footer company/legal links | Correct pages | PASS |
| 14 | Marketplace search by title | Filter results | PASS |
| 15 | Marketplace search by instructor | Filter results | PASS |
| 16 | Marketplace search no result/clear | Helpful recovery | PASS |
| 17 | Marketplace category | Filter cards | PASS |
| 18 | Marketplace level/price/rating | Combine filters | BLOCKED (B2) |
| 19 | Marketplace sort options | Five sorts | BLOCKED (B2) |
| 20 | Course card body/image/title | Correct detail | PASS |
| 21 | Course card wishlist | Save/unsave | PASS |
| 22 | Course detail tabs | Change content | BLOCKED (B2) |
| 23 | Course curriculum accordion | Open/close section | PASS |
| 24 | Course enroll | Persistent free enrollment | PASS |
| 25 | Enrollment modal | Cancel/confirm/close | BLOCKED (B2) |
| 26 | Dashboard My Learning | Continue course | PASS |
| 27 | Lesson selection/next/previous | Navigate lessons | BLOCKED (B2) |
| 28 | Mark lesson complete | Idempotent progress | PASS |
| 29 | Final lesson | Complete course | PASS |
| 30 | Video play/pause | Control media | PASS |
| 31 | Video seek/volume/mute/speed | Control media | BLOCKED (B2) |
| 32 | Video fullscreen/keyboard | Player control | BLOCKED (B2) |
| 33 | Player notes/Q&A/resources | Honest demo action | BLOCKED (B2) |
| 34 | My Certificates | Earned list | PASS |
| 35 | Certificate detail | Dynamic fields | PASS |
| 36 | Certificate download/print | A4 landscape PDF/print | BLOCKED (B2) |
| 37 | Certificate verification | Known/unknown ID | PASS |
| 38 | Live hub cards/tabs | Detail navigation | PASS |
| 39 | Learner class details | Join classroom | PASS |
| 40 | Classroom chat | Send message | PASS |
| 41 | Classroom Q&A | Ask question | PASS |
| 42 | Classroom raise hand | Raise/lower | PASS |
| 43 | Classroom microphone/camera | Demo state | PASS |
| 44 | Classroom resources | Open/download | BLOCKED (B2) |
| 45 | Classroom poll | Select/vote/close | BLOCKED (B2) |
| 46 | Classroom leave | Exit | PASS |
| 47 | Event registration | Register/cancel | BLOCKED (B2) |
| 48 | Event share | Share/copy | PASS |
| 49 | Bootcamp registration | Register/unregister | BLOCKED (B2) |
| 50 | Bootcamp sessions | Join available session | BLOCKED (B4) |
| 51 | Bootcamp progress | Show actual completion | NOT IMPLEMENTED (N1) |
| 52 | Login learner | Role redirect | PASS |
| 53 | Login instructor | Role redirect | PASS |
| 54 | Logout | Clear session | PASS |
| 55 | Signup | Validate and create learner account | BLOCKED (B2) |
| 56 | Forgot password | Explain recovery | PASS |
| 57 | Contact form | Validate/submit | PASS |
| 58 | Instructor application | Validate/submit | PASS |
| 59 | Instructor create course | Add basics/curriculum | BLOCKED (B2) |
| 60 | Instructor save draft | Persist | PASS |
| 61 | Instructor publish | Validate required data | PASS |
| 62 | Instructor edit course | Persist edits | PASS |
| 63 | Instructor create live class | Schedule | PASS |
| 64 | Instructor edit/reschedule class | Update details | PASS |
| 65 | Instructor cancel class | Confirm/cancel | PASS |
| 66 | Instructor start class | Enter studio | PASS |
| 67 | Instructor studio controls | Toggle demo states | PASS |
| 68 | Instructor create bootcamp | Save sessions/details | PASS |
| 69 | Instructor analytics/students/settings | Navigate and render | PASS |
| 70 | Notifications | Queue and dismiss | BLOCKED (B2) |
| 71 | Invalid dynamic routes | Recover | PASS |
| 72 | Support/blog/company routes | Navigate/render | BLOCKED (B2) |

**Phase 1.5 UI result:** 53 PASS, 0 observed FAIL, 18 BLOCKED (17 partial B2; 1 timing-bound B4), 1 NOT IMPLEMENTED. The grouped PASS rows record the observed action family, not every seeded instance. Browser logs on the checked learner/certificate pages contained no errors or warnings. Marketplace, dashboard, live hub and certificate pages showed no document-level horizontal overflow at 1440, 1280, 1024, 768, 430, 390 and 375 px, with narrower checks on the latter pages. A print-layout inspection, complete notification-type queue, and remaining B2/B4 cases still require a browser pass.

The isolated browser journey used a free reading course: enrollment appeared on the dashboard; two lesson completions yielded 50% then 100%; one earned certificate appeared in My Certificates and its public verification succeeded. The course card wishlist toggled without navigating. The live classroom saved chat across reload and the leave action removed access. Instructor course draft edits persisted, publishing without required media was rejected, and a new bootcamp with seven sessions published. Cancelling and then rescheduling a live class initially showed a false success while leaving the class cancelled; the service and API transition were corrected, and the class appeared as Upcoming after a reload. This is the P2 correction covered by the new HTTP regression. Event share produced a copied link; invalid course, class and certificate IDs showed recovery states. Full browser evidence for the 18 blocked grouped cases is still outstanding.

### Unfinished grouped interactions

These rows are explicitly **not** counted as browser passes. B2 means only the stated portion was observed; the remainder needs a controlled UI run. B4 is timing-bound by the seeded session schedule.

| Row | Observed | Missing browser evidence / constraint |
|---:|---|---|
| 18 | Development, Beginner and Free filters worked together. | Rating selection and every price/level combination were not exercised. |
| 19 | Price ascending and descending changed card order. | Popular, newest and highest-rated order were not all compared. |
| 22 | Curriculum content and accordion changed. | Overview and Reviews tab content transitions were not both exercised. |
| 25 | Enrollment confirmation completed. | Modal cancellation and outside/Escape dismissal were not rerun. |
| 27 | Lesson selection advanced through two lessons. | Previous navigation and every sidebar selection were not rerun. |
| 31 | Play/pause, mute, speed and keyboard seek responded. | Volume slider and pointer dragging of the timeline were not confirmed. |
| 32 | Keyboard seek responded. | Fullscreen persistence and exit were not confirmed by the browser. |
| 33 | Player panels rendered. | Notes, Q&A and resource submit/open outcomes were not all exercised. |
| 36 | PDF download produced a certificate file. | Print preview, tablet and A4 landscape visual inspection remain open. |
| 44 | Resource panel displayed a provider-pending link. | Opening/downloading private resources requires the media provider; no success is claimed. |
| 45 | A demo poll vote appeared. | Poll close and repeated-vote behavior were not exercised. |
| 47 | Free event registration succeeded. | UI cancellation was not exercised; the HTTP suite does cover registration deletion. |
| 49 | Free bootcamp registration persisted across reload. | UI unregister was not exercised; the HTTP suite covers repeat registration. |
| 50 | Published bootcamp schedule displayed its sessions. | No scheduled session was joinable at the observed time; joining requires an open linked live class. |
| 55 | Empty signup showed validation. | Final browser account creation was not submitted because that flow accepts the displayed terms; API registration was tested separately. |
| 59 | Instructor course basics/draft and publish guard were exercised. | Every curriculum/resource/quiz builder action and validation branch was not rerun. |
| 70 | Rapid duplicate notices remained one-at-a-time; auto and manual dismiss worked. | Four different notification types and full queue order were not established. |
| 72 | Support/company/footer destinations rendered. | Every blog detail and content route interaction was not exercised. |


> Historical frontend baseline before the Phase 1 backend migration. The service/state inventory and mock interaction observations below describe that baseline. Current backend integration status and outstanding regression work are tracked in [docs/backend/BACKEND_READINESS.md](docs/backend/BACKEND_READINESS.md).

Audit date: 8 October 2026. Scope: the local Next.js frontend at `http://localhost:4500`, with demo learner and instructor accounts. This document records rendered routes, source inspection, browser interactions, responsive checks, fixes, and backend boundaries. `PASS` means the named behavior was exercised in the browser; `FIXED` means it failed or was misleading and was corrected and retested; `REVIEWED` means source and rendered state were inspected without a full end-to-end browser action; `BACKEND REQUIRED` means the frontend has an explicit demo fallback.

## Inventory and route map

There are **47 page route templates**, **52 reusable component files**, **18 mock-data modules**, **5 service modules**, **2 contexts**, and **3 task-specific state modules** in `src/lib`. Dynamic templates are listed once even when they serve multiple slugs or IDs.

| Area | Route templates |
|---|---|
| Public discovery | `/`, `/courses`, `/courses/[slug]`, `/career-paths`, `/career-paths/[slug]`, `/programs/beginner`, `/blog`, `/blog/[slug]` |
| Live | `/live`, `/live-classes`, `/live-classes/[id]`, `/live/classes/[id]`, `/live/bootcamps`, `/live/bootcamps/[slug]`, `/live/events`, `/live/events/[slug]` |
| Learner and auth | `/login`, `/login/welcome`, `/signup`, `/dashboard`, `/learn/[courseSlug]/[lessonId]`, `/certificates`, `/certificates/[certificateId]`, `/certificates/verify`, `/certificates/verify/[certificateId]` |
| Support and company | `/about`, `/careers`, `/contact`, `/privacy`, `/terms`, `/faq`, `/help`, `/community` |
| Instructor | `/instructor`, `/instructor/apply`, `/instructor/courses`, `/instructor/courses/create`, `/instructor/courses/[id]/edit`, `/instructor/live-classes`, `/instructor/live-classes/create`, `/instructor/live-classes/[id]`, `/instructor/bootcamps`, `/instructor/bootcamps/create`, `/instructor/students`, `/instructor/analytics`, `/instructor/messages`, `/instructor/settings` |

There is no separate `/instructor/courses/[id]` route: the existing edit route serves that workflow. The older `/live-classes` route family is retained as an equivalent public route. The build prerenders 140 paths, including static instances of dynamic templates.

### Component and state map

| Group | Reusable components and actual role |
|---|---|
| Shared shell | `Providers` mounts auth, wishlist and notifications; `Navbar` and `Footer` serve public pages. Instructor routes use their studio layout. |
| UI | `Logo`, `Reveal`, `AnimatedNumber`, `Skeleton`, `ToastProvider`; `NotificationProvider` supplies the one-at-a-time queue. |
| Homepage | `Hero`, `Categories`, `PopularCourses`, `CareerPaths`, `Stats`, `Testimonials`, `CTA` compose `/`. |
| Courses | `CoursesExplorer` runs marketplace search/filter/sort; `CourseCard` and `CourseThumbnail` display listings; `CourseDetailRoute`, `CourseDetailClient`, `EnrollmentModal` serve detail and enrollment. |
| Learning | `CoursePlayerRoute`, `CoursePlayer`, `VideoPlayer` serve lessons, progress, resources and video controls. |
| Certificates | `CertificateDetailClient`, `CertificateDocument` render earned/sample records and print layout. |
| Live discovery | `LiveClassRoute`, `LiveClassGrid`, `LiveClassCard`, `LiveNowCard`, `UpcomingClass`, `BootcampCard`, `EventCard`, `LiveStatus` resolve listings/details. |
| Learner classroom | `LiveVideo`, `LiveControls`, `LiveChat`, `LiveQA`, `LiveResources`, `ParticipantPanel`, `Poll`, `Whiteboard` provide demo session interactions. |
| Instructor classroom | `InstructorLiveStudio`, `InstructorControls`, `ParticipantManager`, `PollCreator`, `ScreenShare`, `Whiteboard`, `LiveAnalytics` provide local demo control states. |
| Legacy implementation | `CourseBuilder` remains in source; the actual create/edit pages now share the persisted builder in the create route. |

Mock data: `blogPosts`, `bootcamps`, `careerPaths`, `categories`, `certificates`, `chatMessages`, `courses`, `events`, `instructors`, `liveClasses`, `liveResources`, `participants`, `polls`, `students`, `supportData`, `testimonials`, `userProgress`, `users`. Services: `authService`, `courseService`, `instructorService`, `liveClassService`, `liveService`. Contexts: `AuthContext`, `WishlistContext`. There is no `src/hooks` directory; hooks are inside components/contexts. Local demo state is centralized in `learningState`, `instructorCourses`, and `bootcampRegistration`, plus `liveService` and event registration. The original sample IDs/slugs and cross references were reviewed alongside route loading; invalid course, lesson, class, bootcamp and certificate references now resolve to explicit unavailable states.

## Interaction matrix

Each row is a distinct interaction case. A grouped row records a repeated control family, not a claim that every data instance was separately clicked.

| # | Location / element | Expected action | Observed action and status |
|---:|---|---|---|
| 1 | Public logo | Home | Opens `/`; PASS |
| 2 | Navbar Courses | Marketplace | Opens `/courses`; PASS |
| 3 | Navbar Career Paths | Paths | Opens `/career-paths`; PASS |
| 4 | Navbar Live Learning | Live hub | Opens `/live`; PASS |
| 5 | Navbar Explore | Category/path menu | Opens submenu with real destinations; FIXED |
| 6 | Navbar search | Course search | Submits query to marketplace; PASS |
| 7 | Login / Sign Up | Auth pages | Correct routes and role-aware signed-in state; FIXED |
| 8 | Mobile menu open/close | Toggle drawer | Both states render; PASS |
| 9 | Mobile Explore | Toggle submenu | Expands/collapses; PASS |
| 10 | Mobile link navigation | Navigate and close menu | `/career-paths` opened and drawer closed; PASS |
| 11 | Footer platform links | Correct pages | Routes resolve; FIXED |
| 12 | Footer resource links | Correct pages | Routes resolve; FIXED |
| 13 | Footer company/legal links | Correct pages | Routes resolve; FIXED |
| 14 | Marketplace search by title | Filter results | Matching cards render; PASS |
| 15 | Marketplace search by instructor | Filter results | Matching cards render; PASS |
| 16 | Marketplace search no result/clear | Helpful recovery | Empty state and clear action work; FIXED |
| 17 | Marketplace category | Filter cards | Slug mappings resolve; FIXED |
| 18 | Marketplace level/price/rating | Combine filters | List and count change, including mobile; FIXED |
| 19 | Marketplace sort options | Five sorts | Order changes for popular, newest, rating and both price directions; FIXED |
| 20 | Course card body/image/title | Correct detail | Opens selected course; PASS |
| 21 | Course card wishlist | Save/unsave | Toggles without card navigation, 44px target; FIXED |
| 22 | Course detail tabs | Change content | Overview/curriculum/reviews switch; PASS |
| 23 | Course curriculum accordion | Open/close section | Independent state and keyboard button; PASS |
| 24 | Course enroll | Mock confirmation | Adds enrolled course without claiming payment; FIXED |
| 25 | Enrollment modal | Cancel/confirm/close | Modal closes and enrollment action updates state; FIXED |
| 26 | Dashboard My Learning | Continue course | Enrolled course appears and opens player; FIXED |
| 27 | Lesson selection/next/previous | Navigate lessons | Correct lesson route and progression; FIXED |
| 28 | Mark lesson complete | Idempotent progress | Repeated action does not double count; FIXED |
| 29 | Final lesson | Complete course | Certificate record created; FIXED |
| 30 | Video play/pause | Control media | Local demo clip loads and time advances/pauses; FIXED |
| 31 | Video seek/volume/mute/speed | Control media | Seek, volume and 1.5x rate verified; FIXED |
| 32 | Video fullscreen/keyboard | Player control | Keyboard seek/mute and fullscreen enter/exit exercised; unavailable-browser message added; FIXED |
| 33 | Player notes/Q&A/resources | Honest demo action | Local notes/questions and resource availability shown; FIXED |
| 34 | My Certificates | Earned list | Newly earned record appears for current learner; FIXED |
| 35 | Certificate detail | Dynamic fields | Learner, course, instructor, date and ID from record; FIXED |
| 36 | Certificate download/print | A4 landscape PDF/print | Landscape sizing and responsive document checked; FIXED |
| 37 | Certificate verification | Known/unknown ID | Generated ID verifies; unknown ID fails clearly; FIXED |
| 38 | Live hub cards/tabs | Detail navigation | Class, bootcamp, event routes resolve; PASS |
| 39 | Learner class details | Join classroom | Correct class ID/title, unavailable ID handled; FIXED |
| 40 | Classroom chat | Send message | Message appears and input clears; PASS |
| 41 | Classroom Q&A | Ask question | Question appears; PASS |
| 42 | Classroom raise hand | Raise/lower | State toggles for learner; FIXED |
| 43 | Classroom microphone/camera | Demo state | Controls toggle local states and explain no device connection; FIXED |
| 44 | Classroom resources | Open/download | Real link works; unavailable resources are labelled pending; FIXED |
| 45 | Classroom poll | Select/vote/close | Vote increments responses, one toast, close has accessible name; FIXED |
| 46 | Classroom leave | Exit | Confirmation modal and `/live` exit tested; PASS |
| 47 | Event registration | Register/cancel | Count and state toggle and survive refresh; FIXED |
| 48 | Event share | Share/copy | Link copy fallback and success notice tested; PASS |
| 49 | Bootcamp registration | Register/unregister | State persists across refresh; FIXED |
| 50 | Bootcamp sessions | Join available session | Linked live class opens; unavailable session has clear state; FIXED |
| 51 | Bootcamp progress | Show actual completion | Derived from completed sessions; FIXED |
| 52 | Login learner | Role redirect | Opens `/dashboard`; PASS |
| 53 | Login instructor | Role redirect | Opens `/instructor`; PASS |
| 54 | Logout | Clear session | Opens `/login`, role UI clears; PASS |
| 55 | Signup | Validate and create demo profile | Empty/mismatch/valid cases and learner redirect; FIXED |
| 56 | Forgot password | Explain recovery | Clear backend-required message; FIXED |
| 57 | Contact form | Validate/submit | Empty, invalid email and valid demo preview tested; FIXED |
| 58 | Instructor application | Validate/submit | Empty/valid demo preview tested; FIXED |
| 59 | Instructor create course | Add basics/curriculum | Section, lesson and media entry available; FIXED |
| 60 | Instructor save draft | Persist | Draft appears in list after refresh; FIXED |
| 61 | Instructor publish | Validate required data | Incomplete course blocked; published course appears in marketplace; FIXED |
| 62 | Instructor edit course | Persist edits | Existing create builder prepopulates saved course; FIXED |
| 63 | Instructor create live class | Schedule | New ID and detail route survive refresh; FIXED |
| 64 | Instructor edit/reschedule class | Update details | Saved schedule survives refresh; FIXED |
| 65 | Instructor cancel class | Confirm/cancel | Modal dismiss and confirmation state tested; FIXED |
| 66 | Instructor start class | Enter studio | Correct class title and status; PASS |
| 67 | Instructor studio controls | Toggle demo states | Mic, camera, screen share, poll, whiteboard, recording and end state reviewed; FIXED |
| 68 | Instructor create bootcamp | Save sessions/details | New bootcamp opens learner detail; FIXED |
| 69 | Instructor analytics/students/settings | Navigate and render | Pages load without broken links or console errors; PASS |
| 70 | Notifications | Queue and dismiss | Four rapid actions showed at most one alert; manual/auto dismiss checked; FIXED |
| 71 | Invalid dynamic routes | Recover | Course, lesson, class, bootcamp and certificate show useful error actions; FIXED |
| 72 | Support/blog/company routes | Navigate/render | Every route template rendered in route sweep; PASS |

**Interaction case count: 72** (24 `PASS`, 48 `FIXED`). The statuses above are the source of truth; grouped rows should not be interpreted as exhaustive clicks on every repeated card. Browser work also included a 47-template route sweep, a 70-check viewport grid across 10 key pages at 1440, 1280, 1024, 768, 430, 390 and 375px, targeted mobile interactions, invalid-ID states and browser console inspection. The instructor 1024px overflow found in that grid was fixed and rechecked (`scrollWidth` 1016 within a 1024px viewport). Browser console error/warning log was empty at the end of the pass.

## Severity and corrections

| Severity | Finding | Correction / validation |
|---|---|---|
| P0 | Certificate verification route broke `next build` because `use(params)` lacked a Suspense boundary. | Added boundary; final production build succeeds. |
| P1 | Enrollment, lesson progress and certificates were disconnected or hardcoded. | Added user-scoped local state, idempotent completion and generated demo certificate; exercised full learner journey. |
| P1 | External video sample failed to load. | Bundled small local 12-second VP8 clip; verified playback, seek, mute and speed. The clip is intentionally a demo, not lesson-length content. |
| P1 | New instructor courses/classes/bootcamps did not reliably appear on learner routes. | Shared persisted local records and dynamic route resolution; exercised create-to-public journeys. |
| P2 | Marketplace category, filters/sort and wishlist/card interaction had incorrect behavior. | Corrected query mappings, combined filters, real sort order, event propagation and click target. |
| P2 | Mobile/studio layouts, menu and class controls had dead or unclear states. | Corrected 1024px studio overflow, mobile menu closure, class state toggles and unavailable resource copy. |
| P2 | Fast notifications could stack. | One visible queued notification, deduplication and close behavior; four rapid actions retested. |
| P3 | Inconsistent course names/counts, stale dates, fake send/download/payment/recording/accreditation copy. | Derived recurring counts from data, normalized labels and dates, and identified demo-only actions honestly. |
| P3 | Poll close icon lacked an accessible name. | Added `aria-label`; browser accessibility snapshot now exposes “Close live poll.” |

## Content, accessibility and state notes

Shared course data now drives repeated course titles, lesson counts and durations. Career-path and homepage counts are derived from course references. Event weekday/speaker details were corrected. Demo enrollment and certificates never imply a real payment or accredited credential. Contact and instructor application forms show a local preview rather than claiming delivery. Reduced-motion styles, visible focus, form labels and icon button names were checked on key pages. Loading shells cover root and dynamic routes, while absent records show recovery actions. User-scoped local storage prevents a new demo signup from inheriting another learner's progress or wishlist.

The source search found no `href="#"`, empty `href`, `javascript:void`, `TODO`, `FIXME`, “Coming soon”, “Under construction”, or “Lorem ipsum” occurrences in `src`. A targeted secret-pattern review found no embedded API keys or tokens. `npm run build` succeeds. `npm run lint` exits successfully with **0 errors and 217 warnings**: 182 unused variables/imports and 35 raw `<img>` recommendations. The hook dependency warning was fixed. The remaining warnings are cleanup/performance work and should be handled before release.

## Backend required

- Authentication, password recovery, authorization, and server sessions. Current account/role behavior is local demo state only.
- Payments/enrollment transactions and durable cross-device course progress.
- Real course video upload/transcoding/storage and lesson-length media. The bundled clip is a local playback demo.
- Live video/audio/screen sharing, participants, chat, Q&A, polling, recording and reminders. Classroom controls currently show local mock states.
- Course/bootcamp/event publishing, capacity and registrations across users.
- Issued certificate records, signed verification and authoritative download provenance. Current verification checks only local/sample data.
- Real analytics, student records, notifications and contact/application delivery.

## Next phase recommendations

1. Define API contracts and server IDs for users, courses, sections, lessons, sessions and certificates; keep the current client models as fixtures.
2. Add authentication with server role checks before connecting instructor routes to real data.
3. Implement enrollment/payment status as a server state machine, with explicit pending and failure responses.
4. Connect progress writes and certificate issuance to an idempotent server endpoint.
5. Introduce media upload/transcoding and signed delivery, then replace the local demo video.
6. Choose a real-time classroom provider and define chat, Q&A, poll, participant and recording permissions.
7. Add server validation, pagination and empty/error/loading contracts to each data service.
8. Resolve the remaining lint warnings, prioritize image optimization, and add focused end-to-end tests for the learner, instructor and certificate journeys.
## End-to-end lifecycle QA delta — 12 October 2026

This is a **new targeted acceptance matrix**, not a replacement or rerun of the historical 72-case frontend ledger below. The eight Playwright cases use a randomly named migrated/seeded SQLite database and an isolated production server. The Node HTTP suite does the same. Payment implementation was explicitly deferred. Source: `tests/browser/lifecycle.spec.mjs`, `tests/backend/journeys.test.mjs`, and `qa-artifacts/playwright-results.xml`.

Baseline before fixes: `npm run build` PASS; `npm run test:backend` 23/23 PASS; `npm run lint` 0 errors, 272 warnings. Final after fixes: `npm run build` PASS including TypeScript; `npm run test:backend` 25/25 PASS; `npm run test:browser` 8/8 PASS; last lint run 0 errors, 270 warnings. The backend page smoke exercised the existing route templates, but it is not a browser interaction check. The browser suite's final JUnit report records 8 tests, 0 failures. Browser testing used Chrome at desktop size and a 390px touch viewport.

| ID | Acceptance scenario | Type and executed evidence | Status | Change / dependency |
| --- | --- | --- | --- | --- |
| EL-01 | Published catalog renders | Playwright `public browsing…`: free starter visible at `/courses` | PASS | Existing route |
| EL-02 | Course search, category filter, empty state and sorting | Playwright: nonsense query yields empty state, clear restores cards, Development reduces cards, low/high price sorting changes first card; backend escaped `%` test | PASS | Tested representative options, not every filter combination |
| EL-03 | Learner password sign-in | Playwright: Samira signs in and reaches `/dashboard` | PASS | Isolated seed |
| EL-04 | Free course enrollment and reload | Playwright: modal confirmation leads to lesson; access persists | PASS | No payment simulated |
| EL-05 | Reading completion and certificate | Playwright: two lessons reach 50%/100%, certificate link survives reload | PASS | Reading course only |
| EL-06 | Mobile menu, navigation and fit | Playwright: 390px touch menu opens, links to courses, closes, no document overflow | PASS | One mobile width checked |
| EL-07 | Learner denied admin page | Playwright: direct `/control-center` renders 404 | PASS | Server role guard |
| EL-08 | Admin password sign-in | Playwright: isolated admin reaches `/control-center` | PASS | OAuth admin login not part of this route |
| EL-09 | Tutor draft creation/persistence | Playwright: tutor saves named draft; it remains after course-list reload | PASS | Real SQLite mutation |
| EL-10 | Invalid local video preview file | Playwright: text file rejected and no file selected | PASS | Browser-side preview validation only |
| EL-11 | Selected video file preview | Playwright: actual bundled WebM selected; `<video>` source becomes local blob; UI says Not uploaded | PASS | File bytes are not persisted |
| EL-12 | Playback speed cap | Playwright: 1×, 1.25× and 1.5× each set the media `playbackRate`; 2× absent | PASS | Full 30-second playback not run |
| EL-13 | Tutor submission with missing hosted media | Playwright: draft submission returns 422 `COURSE_MEDIA_INCOMPLETE`; course remains listed | PASS | Provider-backed upload still needed |
| EL-14 | Auth, CSRF, role injection, session revocation | Backend `authentication and CSRF`, `unauthenticated, role, input and identity boundaries`, `session revocation` | PASS | HTTP assertions |
| EL-15 | Tutor ownership and private draft preview | Backend `cross-instructor ownership`, `draft preview media…` | PASS | Direct API requests rejected |
| EL-16 | Duplicate enrollment/progress/certificates | Backend idempotency and eight-way concurrent retries; one business record | PASS | Free reading course |
| EL-17 | Admin price/margin/order-quote authority | Backend `admin course review, price authority and public visibility` checks range, cap, denied tutor writes and consistent persisted quote | PASS | No paid settlement |
| EL-18 | Approval, rejection, publication, visibility | Playwright: isolated reading course rejected with feedback, tutor sees feedback and resubmits, admin approves, price approves and explicitly publishes, visitor opens detail; direct tutor approve denied. Backend case also checks unpublish. | PASS | Reading course; video workflow blocked by media provider |
| EL-19 | Live schedule, attendance, stored chat and leave | Playwright: tutor creates/starts class, learner joins, sends chat, reloads to see it, leaves, and direct messages API returns 403; backend reschedule/ownership tests | PASS | Stored HTTP workflow, no realtime transport |
| EL-20 | Bootcamp/event registration and ownership | Backend bootcamp/event cases, repeat registration and paid guard | PASS | No live completion attestation |
| EL-21 | Restart persistence and referential integrity | Backend restart case and `PRAGMA foreign_key_check` | PASS | Isolated DB |
| EL-22 | Upload-intent validation and role checks | Backend media-upload case: unauthenticated 401, other tutor 403, bad MIME/size 422, valid metadata 503 | PASS | Storage provider absent |
| EL-23 | Forged video completion protection | Backend video-progress case: direct complete and forged watched seconds rejected; no certificate | PASS | New server guard; real watched tracking absent |
| EL-24 | Existing route smoke | Backend `page route smoke` | PASS | HTTP only, not interaction acceptance |
| EL-25 | Upload/process/play a valid 30-second video, retry or interrupt upload | Upload endpoint returns 503 for valid metadata; no private media service or transcoder configured | BLOCKED | Configure media provider and processing |
| EL-26 | Signed private playback and authorized learner delivery | `mediaService.getMediaUrl` returns 503; browser has no provider asset | BLOCKED | Private storage, signed delivery and test asset |
| EL-27 | Full video tutor rejection/resubmission/approval/publication browser journey | Builder correctly rejects missing hosted media; cannot submit a real video course | BLOCKED | EL-25/26 first |
| EL-28 | Multi-participant realtime chat and reconnect fanout | SQLite stores messages; no realtime subscription/presence provider | BLOCKED | Realtime transport, two-context verification |
| EL-29 | Real live audio/video room and media transport | `liveProvider` returns 503; classroom preview is local | BLOCKED | Streaming provider and device-equipped environment |
| EL-30 | Paid checkout/settlement | Explicitly deferred by this task; API returns `PAYMENT_REQUIRED` | BLOCKED | Payment provider and trusted webhook in later phase |
| EL-31 | Server-validated watched segments and legitimate 1.5× completion | No watched-range evidence protocol/storage; completion is guarded off | NOT IMPLEMENTED | Design segment attestation and threshold, then test seek/reconnect |
| EL-32 | Automatic caption generation from speech | No transcription provider contract or generation job | NOT IMPLEMENTED | Transcription adapter and configured provider |
| EL-33 | WebVTT upload/edit/language/timing playback | No subtitle asset model/editor/player track workflow | NOT IMPLEMENTED | Add validated WebVTT pipeline |
| EL-34 | Category create/edit/delete administration | Categories are course-derived read-only data | NOT IMPLEMENTED | Taxonomy table and admin CRUD |
| EL-35 | Persisted live quizzes, private answers and scores | Existing poll UI is demo state; no quiz entities/API | NOT IMPLEMENTED | Quiz schema, auth, scoring and realtime delivery |
| EL-36 | Real tutor mic/camera preflight and input meter | Device controls are demo toggles, no `getUserMedia` preflight | NOT IMPLEMENTED | Browser permission/device flow and live transport |
| EL-37 | Learner logout and representative page exceptions | Playwright: public catalog/detail, learner login and certificates; navbar sign-out revokes `/api/auth/me` and redirects protected dashboard; no uncaught `pageerror` events | PASS | Representative pages only, not full console/network audit |

**Targeted matrix totals:** 37 scenarios: 25 PASS, 0 FAIL, 6 BLOCKED, 6 NOT IMPLEMENTED. These counts describe only the cases above. The prior 72-case matrix was not rerun in this pass. No complete release acceptance is claimed. The temporary browser test database was removed after the suite, and the user database was not reset or migrated.

**Prioritized findings:** P1 forged video completion accepted by the old server contract (fixed by requiring unavailable verified watch evidence); P2 fake timed upload/codec/duration UI (replaced with truthful local preview); P2 2× speed exposed (capped at 1.5×); P3 inaccessible Course Title label (associated). The first Playwright draft-save attempt failed on an arbitrary five-second toast expectation while notices were queued; the test now asserts the save HTTP response and persisted row. Failed-run screenshot/trace were retained transiently in ignored `test-results/`; the final JUnit report is checked in `qa-artifacts/`.

**Manual release gates:** configure private media and verify a real uploaded 30-second clip, add watched-range validation before enabling video completion, repeat the browser moderation journey with that video asset, wire captions and live providers, run two-device realtime and AV permission tests, run responsive/accessibility checks beyond 390px, and rerun the historical 72-case interaction matrix. Payment remains deferred.

