import { test, expect } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const dbName = `browser-test-${randomBytes(6).toString('hex')}.sqlite`;
const dbPath = resolve(root, 'data', dbName);
const password = `Qa-${randomBytes(20).toString('hex')}!`;
const env = { ...process.env, DATABASE_URL: `file:./data/${dbName}`, DEV_SEED_PASSWORD: password,
  GOOGLE_CREDENTIALS_FILE: '', GOOGLE_CLIENT_ID: '', GOOGLE_CLIENT_SECRET: '' };
let server;
let base;
let serverOutput = '';

test.use({ browserName: 'chromium', launchOptions: {
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
} });
test.describe.configure({ mode: 'serial' });

function run(script) {
  const result = spawnSync(process.execPath, [script], { cwd: root, env, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${script} failed: ${result.stderr}`);
}

async function freePort() {
  return new Promise((resolvePort, reject) => {
    const socket = createServer();
    socket.once('error', reject);
    socket.listen(0, '127.0.0.1', () => {
      const address = socket.address();
      socket.close(() => resolvePort(address.port));
    });
  });
}

test.beforeAll(async () => {
  if (!existsSync(resolve(root, '.next', 'BUILD_ID'))) throw new Error('Run npm run build before browser tests.');
  run('scripts/db.mjs');
  run('scripts/seed.mjs');
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '-H', '127.0.0.1'],
    { cwd: root, env: { ...env, NODE_ENV: 'production' }, stdio: ['ignore', 'pipe', 'pipe'] });
  server.stdout.on('data', chunk => { serverOutput += chunk.toString(); });
  server.stderr.on('data', chunk => { serverOutput += chunk.toString(); });
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(`Test server exited: ${serverOutput.slice(-1000)}`);
    try { if ((await fetch(`${base}/api/courses?pageSize=1`)).ok) return; }
    catch { /* Server is starting. */ }
    await new Promise(resolveWait => setTimeout(resolveWait, 200));
  }
  throw new Error(`Test server did not start: ${serverOutput.slice(-1000)}`);
});

test.afterAll(async () => {
  if (server && server.exitCode === null) {
    server.kill();
    await new Promise(resolveExit => server.once('exit', resolveExit));
  }
  for (const suffix of ['', '-wal', '-shm']) rmSync(`${dbPath}${suffix}`, { force: true });
});

test('public browsing and learner enrollment persist after reload', async ({ page }) => {
  await page.goto(`${base}/courses`);
  await expect(page.getByText('Web Foundations: Free Starter').first()).toBeVisible();
  await page.goto(`${base}/login`);
  await page.getByLabel('Email', { exact: true }).fill('samira@example.invalid');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard(?:\?|$)/);
  await page.goto(`${base}/courses/web-foundations-free-starter`);
  await page.getByRole('button', { name: 'Enroll for Free' }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: /Enroll for Free/ }).click();
  await expect(page).toHaveURL(/\/learn\/web-foundations-free-starter\/lesson-free-1$/);
  await page.getByRole('button', { name: 'Mark Complete' }).click();
  await expect(page.getByText('Progress:').locator('..')).toContainText('50%');
  await page.getByRole('button', { name: 'Next Lesson' }).click();
  await expect(page).toHaveURL(/\/learn\/web-foundations-free-starter\/lesson-free-2$/);
  await page.getByRole('button', { name: 'Mark Complete' }).click();
  await expect(page.getByText('Course Completed!')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Course Completed!')).toBeVisible();
  await expect(page.getByRole('link', { name: 'View Your Certificate' })).toBeVisible();
});

test('learner is denied admin portal; admin signs in separately', async ({ browser }) => {
  const learner = await browser.newContext();
  const learnerPage = await learner.newPage();
  await learnerPage.goto(`${base}/login`);
  await learnerPage.getByLabel('Email', { exact: true }).fill('alex@example.com');
  await learnerPage.getByLabel('Password', { exact: true }).fill(password);
  await learnerPage.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(learnerPage).toHaveURL(/\/dashboard(?:\?|$)/);
  await learnerPage.goto(`${base}/control-center`);
  await expect(learnerPage.getByRole('heading', { name: '404' })).toBeVisible();
  await learner.close();

  const admin = await browser.newContext();
  const adminPage = await admin.newPage();
  await adminPage.goto(`${base}/control-center/login`);
  await adminPage.getByLabel('Admin email').fill('admin@example.com');
  await adminPage.getByLabel('Password', { exact: true }).fill(password);
  await adminPage.getByRole('button', { name: 'Open admin portal' }).click();
  await expect(adminPage).toHaveURL(/\/control-center(?:\?|$)/);
  await admin.close();
});

test('tutor draft persists and local video preview respects speed cap', async ({ page }) => {
  await page.goto(`${base}/login`);
  await page.getByLabel('Email', { exact: true }).fill('john@example.com');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL(/\/instructor(?:\?|$)/);
  await page.goto(`${base}/instructor/courses/create`);
  const title = `Browser QA ${randomBytes(4).toString('hex')}`;
  await page.getByLabel('Course Title').fill(title);
  await page.getByText('Video Preview', { exact: true }).click();
  await page.locator('input[type="file"][accept="video/mp4,video/webm"]').setInputFiles({
    name: 'not-video.txt', mimeType: 'text/plain', buffer: Buffer.from('not a video'),
  });
  await expect(page.getByText('Preview unavailable')).toBeVisible();
  await expect(page.getByText('No local file selected')).toBeVisible();
  await page.locator('input[type="file"][accept="video/mp4,video/webm"]').setInputFiles(resolve(root, 'public/videos/lesson-demo.webm'));
  await expect(page.getByText('Not uploaded')).toBeVisible();
  const video = page.locator('video').first();
  await expect(video).toHaveAttribute('src', /^blob:/);
  await page.getByRole('button', { name: '1x', exact: true }).click();
  await expect(page.getByRole('button', { name: '1.5x', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '2x', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '1.25x', exact: true }).click();
  await expect.poll(() => video.evaluate(element => element.playbackRate)).toBe(1.25);
  await page.getByRole('button', { name: '1.25x', exact: true }).click();
  await page.getByRole('button', { name: '1.5x', exact: true }).click();
  await expect.poll(() => video.evaluate(element => element.playbackRate)).toBe(1.5);
  await page.getByRole('button', { name: '1.5x', exact: true }).click();
  await page.getByRole('button', { name: '1x', exact: true }).click();
  await expect.poll(() => video.evaluate(element => element.playbackRate)).toBe(1);
  const [saveResponse] = await Promise.all([
    page.waitForResponse(response => response.url().includes('/api/instructor/courses/save') && response.request().method() === 'POST'),
    page.getByRole('button', { name: 'Save Draft' }).click(),
  ]);
  expect(saveResponse.ok()).toBe(true);
  await page.goto(`${base}/instructor/courses`);
  await expect(page.getByText(title)).toBeVisible();
  await page.reload();
  await expect(page.getByText(title)).toBeVisible();
  await page.getByPlaceholder('Search your courses...').fill(title);
  await page.getByRole('button', { name: 'Submit for Approval' }).click();
  await expect(page.getByText('Submit this course for approval?')).toBeVisible();
  const [submitResponse] = await Promise.all([
    page.waitForResponse(response => response.url().includes('/api/instructor/courses/') && response.request().method() === 'PATCH'),
    page.getByRole('button', { name: 'Confirm' }).click(),
  ]);
  expect(submitResponse.status()).toBe(422);
  expect((await submitResponse.json()).error.code).toBe('COURSE_MEDIA_INCOMPLETE');
  await expect(page.getByText(title)).toBeVisible();
});

test('mobile menu opens, navigates, closes and pages fit viewport', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(base);
  const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(await fits()).toBe(true);
  await page.getByRole('button', { name: 'Toggle menu' }).click();
  await expect(page.getByRole('link', { name: 'Browse All Courses' })).toBeVisible();
  await page.getByRole('link', { name: 'Browse All Courses' }).click();
  await expect(page).toHaveURL(/\/courses(?:\?|$)/);
  await expect(page.getByRole('button', { name: 'Toggle menu' })).toHaveAttribute('aria-expanded', 'false');
  expect(await fits()).toBe(true);
  await context.close();
});

test('reading course is rejected, revised, approved and explicitly published', async ({ browser }) => {
  const slug = `browser-review-${randomBytes(5).toString('hex')}`;
  const title = `Review QA ${slug}`;
  const tutor = await browser.newContext();
  const tutorPage = await tutor.newPage();
  await tutorPage.goto(`${base}/login`);
  await tutorPage.getByLabel('Email', { exact: true }).fill('john@example.com');
  await tutorPage.getByLabel('Password', { exact: true }).fill(password);
  await tutorPage.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(tutorPage).toHaveURL(/\/instructor(?:\?|$)/);
  const created = await tutorPage.request.post(`${base}/api/instructor/courses/save`, { data: {
    id: `local-${randomBytes(5).toString('hex')}`, slug, title,
    subtitle: 'An isolated reading course for the review workflow.',
    description: 'A complete reading lesson used to verify review and public visibility.',
    category: 'Development', level: 'Beginner', language: 'English', price: 0,
    image: '/courses/course-1.jpg', whatYouWillLearn: ['Read a short lesson'], requirements: [],
    sections: [{ title: 'Introduction', lessons: [{ title: 'Reading', type: 'reading', duration: '1 min', content: 'A complete sample lesson.' }] }],
    status: 'Pending Approval',
  } });
  expect(created.status()).toBe(200);
  const courseId = (await created.json()).data.id;
  expect((await tutorPage.request.get(`${base}/api/courses/${slug}`)).status()).toBe(404);
  expect((await tutorPage.request.post(`${base}/api/admin/courses/${courseId}/review`, { data: { action: 'approve' } })).status()).toBe(403);

  const admin = await browser.newContext();
  const adminPage = await admin.newPage();
  await adminPage.goto(`${base}/control-center/login`);
  await adminPage.getByLabel('Admin email').fill('admin@example.com');
  await adminPage.getByLabel('Password', { exact: true }).fill(password);
  await adminPage.getByRole('button', { name: 'Open admin portal' }).click();
  await expect(adminPage).toHaveURL(/\/control-center(?:\?|$)/);
  await adminPage.goto(`${base}/control-center/courses/approvals`);
  await expect(adminPage.getByText(title).first()).toBeVisible();
  await adminPage.getByPlaceholder('Specify requirements, syllabus improvements, or margin comments for the tutor…').fill('Clarify the reading objective.');
  await adminPage.getByRole('button', { name: 'Reject Course' }).click();
  await expect(adminPage.getByText('Course rejected.')).toBeVisible();
  await tutorPage.goto(`${base}/instructor/courses`);
  await tutorPage.getByPlaceholder('Search your courses...').fill(title);
  await expect(tutorPage.getByText('Admin feedback: Clarify the reading objective.')).toBeVisible();
  const resubmitted = await tutorPage.request.patch(`${base}/api/instructor/courses/${courseId}`, { data: { status: 'pending_approval' } });
  expect(resubmitted.status()).toBe(200);
  await adminPage.reload();
  await expect(adminPage.getByText(title).first()).toBeVisible();
  await adminPage.getByRole('button', { name: 'Approve Course' }).click();
  await expect(adminPage.getByText('Course approved.')).toBeVisible();
  expect((await adminPage.request.get(`${base}/api/courses/${slug}`)).status()).toBe(404);
  const policy = await adminPage.request.put(`${base}/api/admin/courses/${courseId}/pricing`, { data: {
    basePriceMinor: 0, minMarginBps: 0, maxMarginBps: 0,
  } });
  expect(policy.status()).toBe(200);
  const priceApproval = await adminPage.request.post(`${base}/api/admin/courses/${courseId}/pricing`, { data: { action: 'approve', marginBps: 0 } });
  expect(priceApproval.status()).toBe(200);
  const published = await adminPage.request.post(`${base}/api/admin/courses/${courseId}/review`, { data: { action: 'publish' } });
  expect(published.status()).toBe(200);
  const publicCourse = await adminPage.request.get(`${base}/api/courses/${slug}`);
  expect(publicCourse.status()).toBe(200);
  const visitor = await browser.newContext();
  const visitorPage = await visitor.newPage();
  await visitorPage.goto(`${base}/courses/${slug}`);
  await expect(visitorPage.getByRole('heading', { name: title }).first()).toBeVisible();
  await visitor.close();
  await tutor.close();
  await admin.close();
});

test('stored classroom chat survives reload and learner leave revokes access', async ({ browser }) => {
  const tutor = await browser.newContext();
  const tutorPage = await tutor.newPage();
  await tutorPage.goto(`${base}/login`);
  await tutorPage.getByLabel('Email', { exact: true }).fill('john@example.com');
  await tutorPage.getByLabel('Password', { exact: true }).fill(password);
  await tutorPage.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(tutorPage).toHaveURL(/\/instructor(?:\?|$)/);
  const created = await tutorPage.request.post(`${base}/api/instructor/live-classes`, { data: {
    title: `Browser live QA ${randomBytes(4).toString('hex')}`,
    description: 'An isolated stored-chat classroom test.',
    scheduledAt: new Date(Date.now() + 86_400_000).toISOString(), durationMinutes: 60,
  } });
  expect(created.status()).toBe(201);
  const classId = (await created.json()).data.id;
  expect((await tutorPage.request.patch(`${base}/api/instructor/live-classes/${classId}`, { data: { status: 'live' } })).status()).toBe(200);

  const learner = await browser.newContext();
  const learnerPage = await learner.newPage();
  await learnerPage.goto(`${base}/login`);
  await learnerPage.getByLabel('Email', { exact: true }).fill('alex@example.com');
  await learnerPage.getByLabel('Password', { exact: true }).fill(password);
  await learnerPage.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(learnerPage).toHaveURL(/\/dashboard(?:\?|$)/);
  await learnerPage.goto(`${base}/live/classes/${classId}`);
  await expect(learnerPage.getByText('Development classroom: chat messages are saved; video streaming, Q&A, and polls are previews.')).toBeVisible();
  const message = `Stored QA message ${randomBytes(3).toString('hex')}`;
  await learnerPage.getByPlaceholder('Send a message to class...').fill(message);
  await learnerPage.getByTitle('Send Message').click();
  await expect(learnerPage.getByText(message)).toBeVisible();
  await learnerPage.reload();
  await expect(learnerPage.getByText(message)).toBeVisible();
  await learnerPage.getByRole('button', { name: 'Leave Class' }).click();
  await learnerPage.getByRole('button', { name: 'Leave Now' }).click();
  await expect(learnerPage).toHaveURL(/\/live(?:\?|$)/);
  expect((await learnerPage.request.get(`${base}/api/live/classes/${classId}/messages`)).status()).toBe(403);
  await learner.close();
  await tutor.close();
});

test('marketplace search, category filter, empty state and sorting change cards', async ({ page }) => {
  await page.goto(`${base}/courses`);
  const search = page.getByRole('textbox', { name: 'Search courses, skills, or instructors' });
  await search.fill('not-a-real-course-qa');
  await expect(page.getByRole('heading', { name: 'No courses found' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search query' }).click();
  await expect(page.getByRole('heading', { name: 'No courses found' })).toHaveCount(0);
  const cards = page.locator('[role="link"][aria-label^="View "]');
  const initialCount = await cards.count();
  expect(initialCount).toBeGreaterThan(1);
  await page.getByRole('checkbox', { name: 'Development' }).check();
  expect(await cards.count()).toBeLessThan(initialCount);
  await page.getByRole('button', { name: 'Clear all' }).click();
  await page.getByRole('combobox', { name: 'Sort courses' }).selectOption('price-low');
  const lowFirst = await cards.first().getAttribute('aria-label');
  await page.getByRole('combobox', { name: 'Sort courses' }).selectOption('price-high');
  const highFirst = await cards.first().getAttribute('aria-label');
  expect(lowFirst).not.toBe(highFirst);
});

test('learner logout invalidates access without uncaught page errors', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(`${base}/courses`);
  await page.goto(`${base}/courses/web-foundations-free-starter`);
  await page.goto(`${base}/login`);
  await page.getByLabel('Email', { exact: true }).fill('alex@example.com');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard(?:\?|$)/);
  await page.goto(`${base}/certificates`);
  await page.getByRole('button', { name: /account menu/i }).click();
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  const me = await page.request.get(`${base}/api/auth/me`);
  expect(me.status()).toBe(401);
  await page.goto(`${base}/dashboard`);
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  expect(pageErrors).toEqual([]);
});
