# Data model and migrations

SQLite is the Phase 1 persistent store. `DATABASE_URL` points to a local SQLite file. The server enables foreign keys and WAL; migrations are applied by `npm run db:migrate` from `src/db/migrations`. They are ordered and recorded in `schema_migrations`. Development seed data is optional and repeatable with `npm run db:seed`.

Core relations:

- `users` own `sessions`, `courses`, `live_classes`, `bootcamps`, `enrollments`, `certificates`, `wishlists`, `reviews` and `notifications`.
- `courses` contain ordered `course_sections` and `lessons`. `enrollments` and `lesson_progress` link a learner to a course and its lessons. A completed enrollment produces one certificate.
- `media_assets` and `course_resources` record private storage references. They do not store public video bytes.
- `live_classes` have `live_participants` and `live_messages`. `bootcamp_sessions` may link to a live class; `bootcamp_registrations` and `event_registrations` record learners.
- `orders`, `order_items` and `payments` reserve the paid flow, without recording success before provider verification. `analytics_events` records available server events.

The schema has unique constraints on user email, course and bootcamp/event slugs, one enrollment per learner/course, one lesson progress per learner/lesson, one certificate per learner/course, one wishlist row per learner/course, one live participant per learner/class, and one event/bootcamp registration per learner/item. Foreign keys protect references. Check constraints limit roles, statuses, prices and positions.

Migrations:

1. `001_initial.sql`: core schema and indexes.
2. `002_live_participant_uniqueness.sql`: participant uniqueness.
3. `003_starter_course_content.sql`: meaningful free starter reading lessons.
4. `004_event_pricing.sql`: paid event price.
5. `005_bootcamp_schedule_consistency.sql`: align the AI cohort name with its two scheduled sessions.
6. `006_seed_live_date_correction.sql`: correct older development fixture dates parsed without a year.
7. `007_bootcamp_session_details.sql`: persist session description, duration and assignment title.
8. `008_fixture_bootcamp_session_details.sql`: repair older seeded cohort durations.
9. `009_live_reminders.sql`: persist per-user live class reminder preferences.

Back up the SQLite file before migrations in a shared environment. SQLite is appropriate for this local/single-instance phase. A multi-instance deployment requires a managed database migration and shared media infrastructure.
