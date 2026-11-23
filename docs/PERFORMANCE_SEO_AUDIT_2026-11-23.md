# Elevate performance and SEO audit — 23 November 2026

## Scope and evidence

This is the initial audit for the optimization plan. Repository findings are from branch `codex/performance-seo-audit` at parent commit `7fdba15`. Live SEO observations came from the Elevate site and the `https://elevate.courses/` Google Search Console property on 23 November 2026. Current EC2 configuration and resource usage are **not verified**: SSH to the last known address timed out, and the available AWS browser session belongs to a different account. No AWS settings or production data were changed during this audit.

## Findings and priorities

| Priority | Finding | Evidence | Next action |
| --- | --- | --- | --- |
| High | Public course listings do repeated SQLite reads per course. | `listCourses` maps each row through `courseDto`, which queries enrollments, reviews, approval history and pricing. `courseService.mapCourse` then reads metadata, counts, instructor totals and profile for every course. | Measure query counts and latency with realistic catalog sizes; batch or join these reads while preserving API shape. |
| High | Video and application traffic share one EC2 host and local data volume. | Deployment guide and Caddy template use one Node process and local SQLite/media. | Measure disk, network and playback load before selecting storage/CDN architecture. Preserve access controls for paid media. |
| High | Production resource baseline is missing for this audit. | SSH unavailable; no current CloudWatch/EC2 access to the owning account. | Obtain current instance type, CPU, RAM, disk, network, Caddy/systemd settings, DB size and backup verification. Do not resize or load-test production until measured. |
| High | Google has crawled the homepage but has not indexed it in the latest Pages report. | Search Console: 1 page in “Crawled – currently not indexed”; last crawl 18 November. | Recheck after the report refreshes; inspect rendered content and indexing reasons. Indexing is controlled by Google. |
| Medium | Homepage and course listing lacked canonical links and homepage structured data. | Local page metadata. | Add canonical metadata and Organization/WebSite JSON-LD, then validate rendered HTML and rich result eligibility. |
| Medium | Public API responses use `Cache-Control: no-store`. | `src/server/api.ts` `json()` helper. | Design public-only caching and invalidation after measuring request rates. Keep user-specific responses uncached. |
| Medium | Current sitemap is valid but small. | Search Console: `/sitemap.xml` Success, 16 URLs discovered, last read 23 November. | Keep published pages only; monitor URL inspection and indexing over time. |
| Medium | Search impressions are low. | Search Console, last 3 months: 21 impressions, 0 clicks, average position 37.4. | Improve original course/category content and track query/page performance monthly. |
| High | Next.js 16.4.1 triggers a known-security-vulnerability warning at build time. | `npm run build` security check stopped the first run; the required retry completed with the warning still present. | Upgrade to a patched release in an isolated change, then run regression and security checks before deploying. |
| Medium | Historical deployment had limited free disk space. | Previous deployment report recorded about 5 GB free of 40 GB on 18 November; this is not a current measurement. | Check live disk before creating a release or backup; clean only verified obsolete release artifacts, preserving rollback and media. |

## Existing safeguards and limits

- Node 24 and Next.js 16.4.1 are declared. `next.config.ts` enables Cache Components and partial prefetching.
- SQLite runs in WAL mode with a 5-second busy timeout. Migrations already include catalog, enrollment and course approval indexes. It remains a single-writer architecture.
- Public catalog listing is paginated to 50 items per request, but the homepage and sitemap fetch every published course via repeated pages.
- `robots.txt` and the dynamic sitemap exclude private routes. Published course pages already have unique metadata and canonical URLs; the homepage did not.
- Caddy's example allows 1 GB uploads and routes the admin host separately, but the actual production Caddyfile is unverified.
- Existing backup instructions require a consistent SQLite snapshot plus media, and an off-host restore test. Current production backup status is unverified.
- Search Console showed no Core Web Vitals data in its overview. No Lighthouse, RUM or server latency baseline has yet been measured.

## Decisions for the next phases

1. Verify EC2 ownership and access, then collect read-only CPU, memory, disk, network, Caddy, systemd, database and backup baselines.
2. Benchmark course list/detail reads, then remove the proven repeated queries with focused regression coverage.
3. Validate the initial SEO metadata and JSON-LD in a production build and on the deployed site. Keep English demo courses labeled accurately; do not advertise unpublished Tamil lessons as available.
4. Profile images, JS bundles and media delivery before choosing CDN or object storage.
5. Create a staging workload and progressive load-test gate. Never infer 20,000 concurrent-user capacity from registered-user count or a small synthetic test.
6. Before a production release, take and verify a database/media backup, retain the previous release, document rollback, deploy, and check health plus learner/tutor/admin workflows.

## Not yet verified

Current EC2 instance size/utilization, actual Caddy/systemd files, production database query plans, slow-query distribution, off-host backup restoration, mobile Core Web Vitals, payment and authenticated user workflows, and maximum sustainable concurrency.

## Local validation

- `npm run build`: passed on retry, including TypeScript and 128 generated static pages. The first run stopped at Next.js's security warning; the retry did not remove the vulnerability.
- `npm run lint`: failed on the existing tree with 9 errors and 221 warnings. One error is in the pre-existing untracked `output/check-restored-home.cjs`; lint cleanup needs a separately scoped pass. `npx eslint src/app/page.tsx src/app/courses/page.tsx` passed.
