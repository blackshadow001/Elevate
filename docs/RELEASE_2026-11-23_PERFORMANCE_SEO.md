# Elevate optimization release — 23 November 2026

## Release

- Source commit: `9d67420` on `codex/performance-seo-audit`, pushed to GitHub before deployment.
- Production release directory: `/srv/elevate-data/releases/9d67420`.
- Active application link: `/opt/elevate` → that release. Previous working release `7fdba15` remains built and available.
- Scope: homepage and course-listing SEO metadata, homepage Organization/WebSite JSON-LD, and an initial performance/SEO audit. No database migrations or course-content changes were included.

## Backup and cutover

- The application was stopped for a consistent final backup. The SQLite backup is `/opt/elevate-backups/pre-9d67420-20261123/elevate.sqlite`; Python SQLite backup validation returned `integrity_check=ok`, no foreign-key errors, 7 courses and 10 users.
- Media was copied to `/opt/elevate-backups/pre-9d67420-20261123/media/`. An `rsync -a --checksum --dry-run --itemize-changes` comparison after restart found no source files requiring copy.
- This backup is on the same EC2 instance but a separate root volume. It is **not** an off-instance disaster-recovery backup or a restore drill. Arrange and test off-instance backup before relying on it for major infrastructure changes.
- The new release was unpacked from a Git archive whose SHA-256 matched on the server, installed with `npm ci`, and built successfully before the link switch. The service was stopped, backed up, pointed to the new release, and restarted.

## Post-release checks

- `elevate` and `caddy` services active; local and public HTTPS `/api/health` returned `{"status":"ok"}`.
- Homepage served title `Elevate Courses | Online Learning in AI, Technology and Business`, canonical `https://elevate.courses`, and Organization/WebSite JSON-LD.
- `/courses` and one published course returned their expected titles and canonical URLs. `/sitemap.xml` returned 16 URLs. `https://www.elevate.courses/` returned a 301 to `https://elevate.courses/`.
- Inactive old `/opt` application copies had only generated `.next` and `node_modules` removed, reducing root usage from 96% to 41% before the release. After the release and backup, root is 51% used with about 12 GiB free.
- Eleven inactive data-volume releases had only generated `.next` and `node_modules` removed. The live build, immediate rollback, latest earlier build, and two builds pointed to by `/opt` symlinks were preserved. Data volume fell from 93% to 60% used, with about 15 GiB free. The SQLite database, media, source trees and backups were not removed.

## Rollback

If a regression appears, stop `elevate`, atomically point `/opt/elevate` back to `/srv/elevate-data/releases/7fdba15`, and start `elevate`. Confirm `/api/health`, public pages, and key learner/tutor/admin workflows. The old release build remains intact. No schema migration was part of this release, so the code rollback does not require database restoration. Restore the verified SQLite/media backup only if data itself was damaged, after stopping the service and checking a recovery copy.

## Remaining gates

- Next.js 16.4.1 triggered a known security-vulnerability warning during the local build. The production build succeeded, but this release did not upgrade Next.js; a patched version and regression checks are required.
- Repository-wide lint has pre-existing failures; focused lint for the changed pages passed.
- Authenticated learner, tutor, admin and payment workflows were not exercised after this release. This release does not establish concurrent-user capacity. Continue the audit, query optimization, backup restore drill, staging and progressive load tests in the project plan.
