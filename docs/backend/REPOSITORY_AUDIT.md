# Repository and backend audit

Date: 8 October 2026. This audit precedes backend changes and uses the existing QA baseline in `QA_AUDIT.md`.

## Existing architecture

- Framework: Next.js 16.4.0 App Router, React 19.3, TypeScript strict mode. `cacheComponents` and partial prefetching are enabled. There are 47 `page.tsx` route templates in `src/app`; no `src/app/api` route handlers existed at audit time.
- UI: 52 reusable components, with public and instructor layouts. Most pages read static fixtures directly or through thin `src/services` wrappers.
- Mock data: 18 modules in `src/data`, including users, courses and curricula, certificates, live classes, bootcamps, events, reviews/testimonials, participants and chat messages. Data types are spread between `src/types/index.ts` and individual mock modules.
- State: `AuthContext` stores a user object and role in localStorage and accepts any password for a known mock email. `WishlistContext`, `learningState`, `instructorCourses`, `bootcampRegistration`, and `liveService` use localStorage. These values are suitable only for the approved frontend prototype.
- Services: `courseService`, `authService`, `instructorService`, `liveClassService`, and `liveService` return fixtures or browser storage. They are not authoritative server APIs.
- Backend: no database configuration, ORM, migrations, API clients, server actions, middleware/proxy, server session, RBAC enforcement, server input validation, payment provider, media provider, live provider, or backend tests were present. No environment file or deployment configuration for a database was present.
- Toolchain: Node 24.11.1 includes `node:sqlite` with SQLite 3.50.4, but marks the module experimental. This can support a local development backend without an external service; production deployment needs an explicit durable database choice.

## Model and consumer map

| Domain | Current source | Primary consumers / gap |
|---|---|---|
| Users, roles | `src/data/users.ts`, `AuthContext`, `authService` | Login/signup/navigation and instructor gate trust browser state; no server identity. |
| Courses, sections, lessons, instructors | `src/data/courses.ts`, `src/types/index.ts`, `courseService`, `instructorCourses` | Marketplace, details, builder, learner player; custom edits live only in browser storage. |
| Enrollment, lesson progress | `learningState`, `src/data/userProgress.ts` | Dashboard/player/certificate flow is user-scoped locally, but not authoritative or cross-device. |
| Certificates | `src/data/certificates.ts`, `learningState` | Detail/verification can read local data; no issued server record. |
| Live classes/bootcamps/events | `src/data/liveClasses.ts`, `bootcamps.ts`, `events.ts`, `liveService` | Public and instructor pages persist in browser storage; classroom stream/chat are demo-only. |
| Notifications | `NotificationProvider` | One-at-a-time visual queue; no durable inbox or read state. |
| Payments, resources, analytics | UI and fixtures | No orders, verified payment confirmation, private media storage, or measured server analytics. |

## Migration constraints

Keep the approved UI and fixtures available while introducing server contracts. Server identity must come from an HttpOnly session cookie and database lookup; localStorage roles and enrollment cannot authorize APIs. Paid enrollment must remain unavailable until a trusted payment integration exists. Repeated enrollment, progress and certificate requests need database uniqueness and transactions. The initial SQLite implementation is a local development target; filesystem persistence and the experimental Node module are not suitable for all production hosts.

## Initial implementation order

1. Add schema, migrations, database connection and seed mapping for existing IDs/slugs.
2. Add registration/login/logout/session and server RBAC.
3. Add validated course, enrollment, progress and certificate endpoints with ownership checks and idempotency.
4. Add instructor, media/live, payment and analytics contracts; connect frontend services incrementally and retest the 47-route/72-case baseline.

The readiness report tracks implemented items and external-provider limits without treating this audit as evidence of production readiness.
