import { test, expect } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const dbName = `browser-test-${randomBytes(6).toString('hex')}.sqlite`;
const dbPath = resolve(root, 'data', dbName);
const mediaPath = resolve(root, 'data', `${dbName}.media`);
const password = `Qa-${randomBytes(20).toString('hex')}!`;
const env = { ...process.env, DATABASE_URL: `file:./data/${dbName}`, DEV_SEED_PASSWORD: password,
  MEDIA_STORAGE_DIR: mediaPath,
  GOOGLE_CREDENTIALS_FILE: '', GOOGLE_CLIENT_ID: '', GOOGLE_CLIENT_SECRET: '',
  RAZORPAY_KEY_ID: '', RAZORPAY_KEY_SECRET: '', RAZORPAY_WEBHOOK_SECRET: '' };
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
  if (!mediaPath.startsWith(resolve(root, 'data') + '\\')) throw new Error('Unsafe media test path');
  rmSync(mediaPath, { recursive: true, force: true });
});

test('my learning lists and archived courses use the learner account', async ({ page }) => {
  await page.goto(`${base}/login`);
  await page.getByLabel('Email', { exact: true }).fill('samira@example.invalid');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard(?:\?|$)/);
  const enrolled = await page.request.post(`${base}/api/courses/course-free-foundations/enroll`);
  expect(enrolled.ok()).toBeTruthy();
  await page.reload();
  const library = page.locator('section[aria-label="My learning library"]');
  await expect(library.getByRole('heading', { name: 'My learning' })).toBeVisible();
  await expect(library.getByRole('heading', { name: 'Web Foundations: Free Starter' })).toBeVisible();
  await library.getByRole('button', { name: 'My Lists' }).click();
  await library.getByLabel('New list name').fill('Study plan');
  await library.getByRole('button', { name: 'Create list' }).click();
  await expect(library.getByRole('button', { name: 'Study plan (0)' })).toBeVisible();
  await library.getByRole('button', { name: 'All courses' }).click();
  await library.getByLabel('Add Web Foundations: Free Starter to a list').selectOption({ label: 'Study plan' });
  await library.getByRole('button', { name: 'My Lists' }).click();
  await expect(library.getByRole('button', { name: 'Study plan (1)' })).toBeVisible();
  await expect(library.getByRole('heading', { name: 'Web Foundations: Free Starter' })).toBeVisible();
  await library.getByRole('button', { name: 'All courses' }).click();
  await library.getByRole('button', { name: 'Archive', exact: true }).click();
  await library.getByRole('button', { name: 'Archived', exact: true }).click();
  await expect(library.getByRole('heading', { name: 'Web Foundations: Free Starter' })).toBeVisible();
  await library.getByRole('button', { name: 'Restore' }).click();
  await expect(library.getByText('No archived courses.')).toBeVisible();
});

test('course player shows real course facts and saves a rating and study plan', async ({ page }) => {
  await page.goto(`${base}/login`);
  await page.getByLabel('Email', { exact: true }).fill('samira@example.invalid');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard(?:\?|$)/);
  expect((await page.request.post(`${base}/api/courses/course-free-foundations/enroll`)).ok()).toBeTruthy();
  await page.goto(`${base}/learn/web-foundations-free-starter/lesson-free-1`);
  await expect(page.getByText('Course overview')).toBeVisible();
  await expect(page.getByText('2 lessons · 1 section')).toBeVisible();
  await page.getByRole('button', { name: 'Your course progress' }).click();
  await expect(page.getByText('0 of 2 lessons complete')).toBeVisible();
  await page.getByRole('button', { name: 'Rate this course' }).click();
  const dialog = page.getByRole('dialog', { name: 'Rate this course' });
  await dialog.getByRole('button', { name: '4 stars' }).click();
  await dialog.getByLabel('Review (optional)').fill('Useful introduction.');
  await dialog.getByRole('button', { name: 'Save rating' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText('1 rating')).toBeVisible();
  await page.getByRole('button', { name: 'Reviews (1)' }).click();
  await expect(page.getByText('Learner reviews')).toBeVisible();
  await expect(page.getByText('Useful introduction.')).toBeVisible();
  await page.getByRole('button', { name: 'Overview' }).click();
  const course = await page.request.get(`${base}/api/courses/course-free-foundations`);
  expect((await course.json()).data.rating).toBe(4);
  await page.getByRole('button', { name: 'Plan a study session' }).click();
  await page.getByLabel('Day', { exact: true }).selectOption({ label: 'Tuesday' });
  await page.getByLabel('Time', { exact: true }).fill('20:00');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Add to calendar' }).click();
  const calendar = await downloadPromise;
  expect(calendar.suggestedFilename()).toMatch(/\.ics$/);
  expect(readFileSync(await calendar.path(), 'utf8')).toContain('RRULE:FREQ=WEEKLY;BYDAY=TU');
});

test('personal plan shows administrator pricing state without starting a charge', async ({ page }) => {
  await page.goto(`${base}/personal-plan`);
  await expect(page.getByRole('heading', { name: 'Make room for your next skill.' })).toBeVisible();
  await expect(page.getByText('Price coming soon')).toHaveCount(2);
  await page.getByRole('link', { name: 'View plan details' }).first().click();
  await expect(page.getByRole('heading', { name: 'Review your plan' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Subscriptions coming soon' })).toBeDisabled();
});

test('wishlist shows only saved courses and removal restores the empty state', async ({ page }) => {
  await page.goto(`${base}/wishlist`);
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel('Email', { exact: true }).fill('samira@example.invalid');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard(?:\?|$)/);
  await page.goto(`${base}/wishlist`);
  await expect(page.getByRole('heading', { name: 'Your wishlist is empty' }).first()).toBeVisible();
  await page.goto(`${base}/courses`);
  const card = page.getByRole('link', { name: 'View Web Foundations: Free Starter' });
  await card.getByRole('button', { name: 'Add to wishlist' }).click();
  await expect(card.getByRole('button', { name: 'Remove from wishlist' })).toBeVisible();
  await page.getByRole('link', { name: 'View wishlist' }).click();
  await expect(page).toHaveURL(/\/wishlist$/);
  await expect(page.locator('article')).toHaveCount(1);
  await expect(page.locator('article')).toContainText('Web Foundations: Free Starter');
  await expect(page.locator('article')).not.toContainText('Full Stack Web Development');
  await page.getByRole('button', { name: 'Remove Web Foundations: Free Starter from wishlist' }).click();
  await expect(page.getByRole('heading', { name: 'Your wishlist is empty' }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your wishlist is empty' }).first()).toBeVisible();
});

test('paid course checkout explains missing configuration without granting access', async ({ page }) => {
  await page.goto(`${base}/login`);
  await page.getByLabel('Email', { exact: true }).fill('samira@example.invalid');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard(?:\?|$)/);
  await page.goto(`${base}/courses/full-stack-web-development`);
  await page.getByRole('button', { name: 'Buy Course' }).first().click();
  const modal = page.getByRole('dialog', { name: 'Course checkout' });
  await expect(modal).toBeVisible();
  await expect(modal.getByText('Payments are not configured yet. No charge can be made.')).toBeVisible();
  await expect(modal.getByRole('button', { name: 'Pay securely with Razorpay' })).toBeDisabled();
  await modal.getByRole('button', { name: 'Close checkout' }).click();
  await expect(modal).toBeHidden();
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

test('learner video hides native menus and rejects seeking past watched content', async ({ page }) => {
  await page.goto(`${base}/login`);
  await page.getByLabel('Email', { exact: true }).fill('alex@example.com');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard(?:\?|$)/);
  await page.goto(`${base}/learn/full-stack-web-development/les-1`);
  const video = page.locator('video').first();
  await expect(video).toBeVisible();
  await expect.poll(() => video.evaluate(element => element.duration)).toBeGreaterThan(2);
  const actualSeconds = Math.round(await video.evaluate(element => element.duration));
  const actualLabel = `${Math.floor(actualSeconds / 60)}:${String(actualSeconds % 60).padStart(2, '0')}`;
  await expect(page.getByText(/Lecture 1 of/)).toContainText(actualLabel);
  await expect(page.locator('aside').getByText(actualLabel, { exact: true })).toBeVisible();
  const restrictions = await video.evaluate(element => {
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    element.dispatchEvent(event);
    return { contextBlocked: event.defaultPrevented, nativeControls: element.controls,
      pipDisabled: element.disablePictureInPicture, remoteDisabled: element.disableRemotePlayback,
      downloadHidden: element.controlsList.contains('nodownload') };
  });
  expect(restrictions).toEqual({ contextBlocked: true, nativeControls: false, pipDisabled: true,
    remoteDisabled: true, downloadHidden: true });
  await expect(page.getByTitle('Picture-in-Picture')).toHaveCount(0);
  await video.evaluate(element => { element.currentTime = element.duration * 0.8; });
  await expect.poll(() => video.evaluate(element => element.currentTime)).toBeLessThan(1);
  const timeline = page.getByRole('slider', { name: 'Video timeline' });
  const bounds = await timeline.boundingBox();
  expect(bounds).toBeTruthy();
  await page.mouse.click(bounds.x + bounds.width * 0.9, bounds.y + bounds.height / 2);
  await expect.poll(() => video.evaluate(element => element.currentTime)).toBeLessThan(1);
  await timeline.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => video.evaluate(element => element.currentTime)).toBeLessThan(1);
  await page.getByRole('button', { name: 'Play video' }).click();
  await expect.poll(() => video.evaluate(element => element.currentTime), { timeout: 10000 }).toBeGreaterThan(1);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await video.evaluate(element => { element.currentTime = 0; });
  await expect.poll(() => video.evaluate(element => element.currentTime)).toBeLessThan(0.5);
  await video.evaluate(element => { element.currentTime = 0.5; });
  await expect.poll(() => video.evaluate(element => element.currentTime)).toBeGreaterThan(0.4);
});

test('learner is routed to separate admin sign-in and can switch to an admin account', async ({ browser }) => {
  const learner = await browser.newContext();
  const learnerPage = await learner.newPage();
  await learnerPage.goto(`${base}/login`);
  await learnerPage.getByLabel('Email', { exact: true }).fill('alex@example.com');
  await learnerPage.getByLabel('Password', { exact: true }).fill(password);
  await learnerPage.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(learnerPage).toHaveURL(/\/dashboard(?:\?|$)/);
  await learnerPage.goto(`${base}/control-center`);
  await expect(learnerPage).toHaveURL(/\/control-center\/login$/);
  await expect(learnerPage.getByRole('heading', { name: 'Administrator sign in' })).toBeVisible();
  await expect(learnerPage.getByText('Signing in here with an administrator account will switch this browser')).toBeVisible();
  await learnerPage.getByLabel('Admin email').fill('samira@example.invalid');
  await learnerPage.getByLabel('Password', { exact: true }).fill(password);
  await learnerPage.getByRole('button', { name: 'Open admin portal' }).click();
  await expect(learnerPage.getByText('Email or password is incorrect.', { exact: true })).toBeVisible();
  await expect(learnerPage).toHaveURL(/\/control-center\/login$/);
  await learnerPage.getByLabel('Admin email').fill('admin@example.com');
  await learnerPage.getByLabel('Password', { exact: true }).fill(password);
  await learnerPage.getByRole('button', { name: 'Open admin portal' }).click();
  await expect(learnerPage).toHaveURL(/\/control-center(?:\?|$)/);
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

test('tutor video uploads privately, persists in draft and preview respects speed cap', async ({ page }) => {
  await page.goto(`${base}/login`);
  await page.getByLabel('Email', { exact: true }).fill('john@example.com');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL(/\/instructor(?:\?|$)/);
  await page.goto(`${base}/instructor/courses/create`);
  const title = `Browser QA ${randomBytes(4).toString('hex')}`;
  await page.getByLabel('Course Title').fill(title);
  await page.getByText('Thumbnail', { exact: true }).first().click();
  const thumbnailInput = page.locator('input[type="file"][accept="image/jpeg,image/png,image/webp"]');
  await thumbnailInput.setInputFiles({ name: 'invalid.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') });
  await expect(page.getByText('Thumbnail not uploaded')).toBeVisible();
  const [thumbnailResponse] = await Promise.all([
    page.waitForResponse(response => response.url().includes('/thumbnail') && response.request().method() === 'POST'),
    thumbnailInput.setInputFiles(resolve(root, 'public/courses/course-2.jpg')),
  ]);
  expect(thumbnailResponse.status()).toBe(201);
  await expect(page.getByRole('img', { name: 'Thumbnail Preview' })).toHaveAttribute('src', /^\/api\/course-thumbnails\//);
  const thumbnailUrl = await page.getByRole('img', { name: 'Thumbnail Preview' }).getAttribute('src');
  expect(thumbnailUrl).toBeTruthy();
  await expect.poll(() => page.getByRole('img', { name: 'Thumbnail Preview' }).evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
  await page.getByText('Video Preview', { exact: true }).click();
  await expect(page.getByText('MP4 or WebM, up to 1 GB per video. Saved privately on this server.')).toBeVisible();
  await page.locator('input[type="file"][accept="video/mp4,video/webm"]').setInputFiles({
    name: 'not-video.txt', mimeType: 'text/plain', buffer: Buffer.from('not a video'),
  });
  await expect(page.getByText('No local file selected')).toBeVisible();
  const [uploadResponse] = await Promise.all([
    page.waitForResponse(response => response.url().includes('/lessons/') && response.url().endsWith('/media') && response.request().method() === 'POST'),
    page.locator('input[type="file"][accept="video/mp4,video/webm"]').setInputFiles(resolve(root, 'public/videos/lesson-demo.webm')),
  ]);
  expect(uploadResponse.status()).toBe(201);
  const courseId = /\/courses\/([^/]+)\/lessons\//.exec(uploadResponse.url())?.[1];
  expect(courseId).toBeTruthy();
  const uploadedCourse = (await (await page.request.get(`${base}/api/instructor/courses/${courseId}`)).json()).data;
  const uploadedDuration = uploadedCourse.sections[0].lessons[0].durationSeconds;
  expect(uploadedDuration).toBeGreaterThan(2);
  await expect(page.getByText('Uploaded', { exact: true })).toBeVisible();
  const video = page.locator('video').first();
  await expect(video).toHaveAttribute('src', /^blob:/);
  await expect.poll(() => video.evaluate(element => element.duration)).toBeGreaterThan(2);
  expect(uploadedDuration).toBe(Math.round(await video.evaluate(element => element.duration)));
  await video.evaluate(element => { element.currentTime = element.duration * 0.8; });
  await expect.poll(() => video.evaluate(element => element.currentTime)).toBeGreaterThan(1);
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
  const savedCourse = (await (await page.request.get(`${base}/api/instructor/courses/${courseId}`)).json()).data;
  expect(savedCourse.sections[0].lessons[0].durationSeconds).toBe(uploadedDuration);
  await page.goto(`${base}/instructor/courses`);
  await expect(page.getByText(title)).toBeVisible();
  await page.reload();
  await expect(page.getByText(title)).toBeVisible();
  await page.getByPlaceholder('Search your courses...').fill(title);
  await expect(page.getByRole('img', { name: title })).toHaveAttribute('src', thumbnailUrl);
  await expect.poll(() => page.getByRole('img', { name: title }).evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
  await page.getByRole('link', { name: /Edit/ }).first().click();
  await page.getByText('Thumbnail', { exact: true }).first().click();
  await expect(page.getByRole('img', { name: 'Thumbnail Preview' })).toHaveAttribute('src', thumbnailUrl);
  await page.getByText('Video Preview', { exact: true }).click();
  await expect(page.getByText('Uploaded', { exact: true })).toBeVisible();
  await expect(page.locator('video').first()).toHaveAttribute('src', /\/api\/media\/.*\/stream/);
  await page.goto(`${base}/instructor/courses`);
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

test('watched hosted video completes and persists, while a direct end jump does not', async ({ browser }) => {
  const tutor = await browser.newContext();
  const tutorPage = await tutor.newPage();
  await tutorPage.goto(`${base}/login`);
  await tutorPage.getByLabel('Email', { exact: true }).fill('john@example.com');
  await tutorPage.getByLabel('Password', { exact: true }).fill(password);
  await tutorPage.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(tutorPage).toHaveURL(/\/instructor(?:\?|$)/);
  const slug = `watch-qa-${randomBytes(5).toString('hex')}`;
  const created = await tutorPage.request.post(`${base}/api/instructor/courses/save`, { data: {
    id: `local-${randomBytes(5).toString('hex')}`, slug, title: 'Watch Evidence QA Video',
    subtitle: 'A short private video for completion testing.',
    description: 'This course checks that real playback is saved before completing a lesson.',
    category: 'Development', level: 'Beginner', language: 'English', price: 0,
    image: '/courses/course-1.jpg', whatYouWillLearn: ['Watch the complete lesson'], requirements: [],
    sections: [{ title: 'Introduction', lessons: [{ title: 'Short hosted video', type: 'video', duration: '1 mins' }] }],
    status: 'Draft',
  } });
  expect(created.status()).toBe(200, await created.text());
  const course = (await created.json()).data;
  const courseId = course.id;
  const lessonId = course.sections[0].lessons[0].id;
  const upload = await tutorPage.request.post(`${base}/api/instructor/courses/${courseId}/lessons/${lessonId}/media`, {
    data: readFileSync(resolve(root, 'public/videos/lesson-demo.webm')),
    headers: { 'Content-Type': 'video/webm', 'X-Video-Duration-Seconds': '12' },
  });
  expect(upload.status()).toBe(201, await upload.text());
  const submitted = await tutorPage.request.patch(`${base}/api/instructor/courses/${courseId}`, { data: { status: 'pending_approval' } });
  expect(submitted.status()).toBe(200, await submitted.text());

  const admin = await browser.newContext();
  const adminPage = await admin.newPage();
  const adminLogin = await adminPage.request.post(`${base}/api/admin/auth/login`, {
    data: { email: 'admin@example.com', password },
  });
  expect(adminLogin.status()).toBe(200);
  const pricing = await adminPage.request.put(`${base}/api/admin/courses/${courseId}/pricing`, {
    data: { basePriceMinor: 0, minMarginBps: 0, maxMarginBps: 0 },
  });
  expect(pricing.status()).toBe(200, await pricing.text());
  const approvePrice = await adminPage.request.post(`${base}/api/admin/courses/${courseId}/pricing`, {
    data: { action: 'approve', marginBps: 0 },
  });
  expect(approvePrice.status()).toBe(200, await approvePrice.text());
  for (const action of ['approve', 'publish']) {
    const review = await adminPage.request.post(`${base}/api/admin/courses/${courseId}/review`, { data: { action } });
    expect(review.status()).toBe(200, await review.text());
  }

  const learner = await browser.newContext();
  const page = await learner.newPage();
  await page.goto(`${base}/login`);
  await page.getByLabel('Email', { exact: true }).fill('samira@example.invalid');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard(?:\?|$)/);
  const enrolled = await page.request.post(`${base}/api/courses/${courseId}/enroll`);
  expect(enrolled.status()).toBe(200, await enrolled.text());
  const completePath = `${base}/api/courses/${courseId}/lessons/${lessonId}/complete`;
  expect((await page.request.post(completePath)).status()).toBe(409);
  await page.goto(`${base}/learn/${slug}/${lessonId}`);
  await page.route('**/api/courses/**/watch', async route => {
    await new Promise(resolveWait => setTimeout(resolveWait, 1200));
    await route.continue();
  });
  const video = page.locator('video').first();
  await expect.poll(() => video.evaluate(element => element.duration)).toBeGreaterThan(2);
  await page.getByRole('button', { name: 'Play video' }).click();
  await expect(page.getByRole('heading', { name: 'Lesson completed' })).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole('button', { name: 'Completed ✓' })).toBeVisible({ timeout: 25000 });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Completed ✓' })).toBeVisible();
  await learner.close();
  await admin.close();
  await tutor.close();
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
  await adminPage.goto(`${base}/control-center/courses/${courseId}`);
  await expect(adminPage.getByText('Set an admin base price and approve the official course price before publishing.').first()).toBeVisible();
  await expect(adminPage.getByRole('button', { name: 'Publish to Catalog' })).toHaveAttribute('aria-disabled', 'true');
  await adminPage.getByRole('link', { name: 'Open this course in Pricing & Margins' }).click();
  await expect(adminPage).toHaveURL(new RegExp(`/control-center/pricing\\?courseId=${courseId}$`));
  await expect(adminPage.getByText(courseId).first()).toBeVisible();
  await adminPage.getByLabel('Platform Base Floor Price (₹)').fill('0');
  await adminPage.getByLabel('Approved Tutor Margin (%)').fill('0');
  await adminPage.getByLabel('Min Tutor Margin Allowance (%)').fill('0');
  await adminPage.getByLabel('Max Tutor Margin Allowance (%)').fill('0');
  await adminPage.getByRole('button', { name: 'Commit Pricing Policy' }).click();
  await adminPage.getByRole('dialog').getByRole('button', { name: 'Update pricing' }).click();
  await expect(adminPage.getByText('Pricing policy saved. Approve a margin separately before publication.')).toBeVisible();
  await adminPage.getByRole('button', { name: 'Approve margin' }).click();
  await adminPage.getByRole('dialog').getByRole('button', { name: 'Approve price' }).click();
  await expect(adminPage.getByText('Official price approved and saved.')).toBeVisible();
  await adminPage.getByRole('link', { name: 'Back to course review' }).click();
  await expect(adminPage.getByRole('button', { name: 'Publish to Catalog' })).toHaveAttribute('aria-disabled', 'false');
  await adminPage.getByRole('button', { name: 'Publish to Catalog' }).click();
  await adminPage.getByRole('dialog').getByRole('button', { name: 'Publish', exact: true }).click();
  await expect(adminPage.getByText('Course publish action saved.')).toBeVisible();
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
