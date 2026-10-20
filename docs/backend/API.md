# LMS API (Phase 1)

All endpoints are relative to the application origin. Successful responses are `{ "data": ... }`; errors are `{ "error": { "code": "...", "message": "..." } }`. Auth uses the `learnly_session` HttpOnly cookie. JSON writes require `Content-Type: application/json`; browser writes must be same-origin. Identifiers in paths are database IDs except `[slug]` and certificate numbers.

| Area | Endpoints | Access and behavior |
| --- | --- | --- |
| Session | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` | Register creates a learner. Login issues a revocable 7-day session. Login and registration are rate limited. |
| Courses | `GET /api/courses`, `GET /api/courses/[courseId]` | Published catalogue, search, category/level/price filters and sort. Query parameters include `search`, `category`, `level`, `language`, `maxPrice`, `minRating`, `maxDurationHours`, `sort`, `page`, `pageSize`. |
| Learning | `POST /api/courses/[courseId]/enroll`, `GET /api/courses/[courseId]/progress`, `PUT /api/courses/[courseId]/lessons/[lessonId]/progress`, `POST /api/courses/[courseId]/lessons/[lessonId]/watch`, `POST /api/courses/[courseId]/lessons/[lessonId]/complete` | Learner session. Free enrollment and completion are idempotent. Paid enrollment returns `PAYMENT_REQUIRED`. Hosted video completion requires time-bounded watched ranges covering at least 90% and reaching the end. Watch reports accept `positionSeconds`, `durationSeconds`, `playbackRate` (1–1.5) and `state` (`playing`, `paused`, `seek`, `ended`). |
| Learner account | `GET /api/me/enrollments`, `GET /api/me/certificates`, `GET /api/me/wishlist`, `POST /api/me/wishlist`, `DELETE /api/me/wishlist/[courseId]`, `GET /api/me/orders`, `GET /api/me/notifications`, `PATCH /api/me/notifications/[notificationId]`, `GET /api/me/analytics` | Authenticated learner data; wishlist and notifications persist. |
| Certificates | `GET /api/certificates/[certificateId]`, `GET /api/certificates/verify/[certificateNumber]` | Certificate owner/admin for private detail; public verification returns validity and public certificate fields. |
| Reviews | `GET/POST /api/courses/[courseId]/reviews` | Published reviews; writing requires eligible enrollment. |
| Instructor courses | `GET/POST /api/instructor/courses`, `POST /api/instructor/courses/save`, `GET/PATCH /api/instructor/courses/[courseId]`, section/lesson/resource subroutes | Instructor/admin. Ownership is checked on every mutation. Save persists builder sections and lessons. Publish rejects incomplete curriculum or missing hosted video. |
| Instructor reports | `GET /api/instructor/students`, `GET /api/instructor/analytics` | Own data; no fabricated revenue. |
| Live classes | `GET /api/live/classes`, `GET /api/live/classes/[classId]`, `GET/POST/DELETE /api/live/classes/[classId]/reminder`, `GET/POST /api/instructor/live-classes`, `PATCH /api/instructor/live-classes/[classId]` | Public schedule; instructor-owned creation and status changes. Reminder preferences persist, but delivery is pending. Room streaming is not configured. |
| Attendance/chat | `POST /api/live/classes/[classId]/join`, `POST /api/live/classes/[classId]/leave`, `GET/POST /api/live/classes/[classId]/messages`, `DELETE /api/instructor/live-classes/[classId]/messages/[messageId]` | Join requires a live class and eligibility. Messages persist after joining; delivery is stored only, without real-time fanout. |
| Bootcamps | `GET /api/bootcamps`, `GET /api/bootcamps/[slug]`, `GET/POST/DELETE /api/bootcamps/[slug]/register`, `GET/POST /api/instructor/bootcamps`, `PATCH /api/instructor/bootcamps/[bootcampId]`, session subroutes | Published listing and idempotent learner registration. Instructor owns draft/session/publish operations. |
| Events | `GET /api/events`, `GET /api/events/[slug]`, `GET/POST/DELETE /api/events/[slug]/register` | Free registration persists. Paid event registration returns `PAYMENT_REQUIRED` until checkout exists. |
| Orders/media | `POST /api/orders`, `POST /api/orders/[orderId]/checkout`, `POST /api/instructor/courses/[courseId]/media/upload`, `GET /api/media/[assetId]/access` | Order intent and media metadata routes exist. Provider actions return `PROVIDER_NOT_CONFIGURED`; no fake payment or private playback URL. |
| Admin | `GET /api/admin/users`, `PATCH /api/admin/users/[userId]`, `GET /api/admin/analytics`, `PATCH /api/admin/certificates/[certificateId]` | Admin session required. |

Representative request:

```http
POST /api/courses/course-free-foundations/enroll
Cookie: learnly_session=<session cookie>
Origin: http://localhost:4500
```

The API uses 400 for malformed JSON, 401 for unauthenticated, 403 for forbidden/CSRF, 404 for missing resources, 409 for state conflicts or payment requirements, 422 for validation, 429 for rate limits and 503 for unavailable providers.
