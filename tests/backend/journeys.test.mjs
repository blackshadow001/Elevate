import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const root = resolve(import.meta.dirname, '../..');
const dbName = `backend-test-${randomBytes(6).toString('hex')}.sqlite`;
const databaseUrl = `file:./data/${dbName}`;
const password = `Test-${randomBytes(20).toString('hex')}!`;
const env = { ...process.env, DATABASE_URL: databaseUrl, DEV_SEED_PASSWORD: password,
  RAZORPAY_KEY_ID: '', RAZORPAY_KEY_SECRET: '', RAZORPAY_WEBHOOK_SECRET: '' };
const dbPath = resolve(root, 'data', dbName);
const mediaPath = resolve(root, 'data', `${dbName}.media`);
env.MEDIA_STORAGE_DIR = mediaPath;

function runScript(script) {
  const result = spawnSync(process.execPath, [script], { cwd: root, env, encoding: 'utf8' });
  assert.equal(result.status, 0, `${script} failed:\n${result.stdout}\n${result.stderr}`);
}

async function freePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => resolvePort(address.port));
    });
  });
}

test('backend journeys and authority checks', { timeout: 90000 }, async (t) => {
  assert.ok(existsSync(resolve(root, '.next', 'BUILD_ID')), 'Run npm run build before npm run test:backend.');
  runScript('scripts/db.mjs');
  runScript('scripts/seed.mjs');
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  let server = spawn(process.execPath, ['scripts/start-server.mjs'],
    { cwd: root, env: { ...env, NODE_ENV: 'production', GOOGLE_CREDENTIALS_FILE: '',
      PORT: String(port),
      GOOGLE_CLIENT_ID: 'test-google-client.apps.googleusercontent.com', GOOGLE_CLIENT_SECRET: 'test-secret',
      GOOGLE_REDIRECT_URI: `${base}/api/auth/google/callback` }, stdio: ['ignore', 'pipe', 'pipe'] });
  let serverOutput = '';
  server.stdout.on('data', (chunk) => { serverOutput += chunk.toString(); });
  server.stderr.on('data', (chunk) => { serverOutput += chunk.toString(); });
  t.after(async () => {
    if (server.exitCode === null) {
      server.kill();
      await new Promise((resolveExit) => server.once('exit', resolveExit));
    }
    for (const suffix of ['', '-wal', '-shm']) rmSync(`${dbPath}${suffix}`, { force: true });
    assert.ok(mediaPath.startsWith(resolve(root, 'data') + '\\'));
    rmSync(mediaPath, { recursive: true, force: true });
  });
  let ready = false;
  let lastProbe = '';
  for (let attempt = 0; attempt < 80; attempt++) {
    if (server.exitCode !== null) throw new Error(`Next server exited: ${serverOutput}`);
    try { const response = await fetch(`${base}/api/courses?pageSize=1`); if (response.ok) { ready = true; break; } lastProbe = `${response.status} ${await response.text()}`; }
    catch (error) { lastProbe = String(error); }
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }
  assert.ok(ready, `Next server did not start: ${serverOutput}\nLast API probe: ${lastProbe}`);

  async function call(path, { method = 'GET', cookie, body, origin = base } = {}) {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(method !== 'GET' ? { Origin: origin } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      redirect: 'manual',
    });
    const responseText = await response.text();
    let parsed;
    try { parsed = JSON.parse(responseText); }
    catch { parsed = { nonJson: responseText.slice(0, 300) }; }
    return { response, body: parsed };
  }
  async function login(email) {
    const result = await call('/api/auth/login', { method: 'POST', body: { email, password } });
    assert.equal(result.response.status, 200, JSON.stringify(result.body));
    return result.response.headers.get('set-cookie').split(';')[0];
  }

  await t.test('health endpoint checks the migrated database', async () => {
    const health = await call('/api/health');
    assert.equal(health.response.status, 200);
    assert.deepEqual(health.body, { status: 'ok' });
    assert.equal(health.response.headers.get('cache-control'), 'no-store');
  });

  await t.test('public catalogue and search', async () => {
    const list = await call('/api/courses?search=foundations');
    assert.equal(list.response.status, 200);
    assert.ok(list.body.data.items.some((course) => course.slug === 'web-foundations-free-starter'));
    const literal = await call('/api/courses?search=%25');
    assert.equal(literal.response.status, 200);
    assert.equal(literal.body.data.total, 0);
  });

  await t.test('authentication and CSRF', async () => {
    const invalid = await call('/api/auth/login', { method: 'POST', body: { email: 'samira@example.invalid', password: 'incorrect-password' } });
    assert.equal(invalid.response.status, 401);
    const crossSite = await call('/api/auth/login', { method: 'POST', origin: 'https://elsewhere.invalid', body: { email: 'samira@example.invalid', password } });
    assert.equal(crossSite.response.status, 403);
    const malformed = await call('/api/auth/login', { method: 'POST', origin: ':::', body: { email: 'samira@example.invalid', password } });
    assert.equal(malformed.response.status, 403);
    const me = await call('/api/auth/me');
    assert.equal(me.response.status, 401);
    const rateEmail = `rate-${randomBytes(6).toString('hex')}@example.invalid`;
    for (let i = 0; i < 8; i++) assert.equal((await call('/api/auth/login', { method: 'POST', body: { email: rateEmail, password: 'bad-password' } })).response.status, 401);
    assert.equal((await call('/api/auth/login', { method: 'POST', body: { email: rateEmail, password: 'bad-password' } })).response.status, 429);
    assert.equal((await call('/api/auth/register', { method: 'POST', body: { name: 'No', email: 'bad', password: 'short' } })).response.status, 422);
    const shortEmail = `short-password-${randomBytes(5).toString('hex')}@example.invalid`;
    assert.equal((await call('/api/auth/register', { method: 'POST', body: { name: 'Test User', email: shortEmail, password: 'Seven77' } })).response.status, 422);
    const eightEmail = `eight-password-${randomBytes(5).toString('hex')}@example.invalid`;
    const eightCharacterSignup = await call('/api/auth/register', { method: 'POST', body: { name: 'Test User', email: eightEmail, password: 'Eight888' } });
    assert.equal(eightCharacterSignup.response.status, 201, JSON.stringify(eightCharacterSignup.body));
    assert.equal((await call('/api/auth/login', { method: 'POST', body: { email: eightEmail, password: 'Eight888' } })).response.status, 200);
  });

  await t.test('Google OAuth state, callback and link guards', async () => {
    const start = await call('/api/auth/google/start');
    assert.equal(start.response.status, 303);
    const authorization = new URL(start.response.headers.get('location'));
    assert.equal(authorization.origin, 'https://accounts.google.com');
    assert.equal(authorization.searchParams.get('redirect_uri'), `${base}/api/auth/google/callback`);
    assert.equal(authorization.searchParams.get('code_challenge_method'), 'S256');
    assert.equal(authorization.searchParams.get('scope'), 'openid email profile');
    const flowCookie = start.response.headers.get('set-cookie');
    assert.match(flowCookie, /HttpOnly/i);
    assert.match(flowCookie, /SameSite=lax/i);
    assert.ok(authorization.searchParams.get('state'));
    const invalid = await call('/api/auth/google/callback?state=wrong&code=invalid', { cookie: flowCookie.split(';')[0] });
    assert.equal(invalid.response.status, 303);
    assert.match(invalid.response.headers.get('location'), /google_error=state/);
    assert.equal((await call('/api/auth/google/start?intent=link')).response.status, 303);
    assert.match((await call('/api/auth/google/start?intent=link')).response.headers.get('location'), /google_error=link_login/);
  });

  const learner = await login('samira@example.invalid');
  const otherLearner = await login('alex@example.com');
  const otherInstructor = await login('priya-sundaram@instructors.example.invalid');
  assert.equal((await call('/api/auth/me', { cookie: otherLearner })).body.data.role, 'learner');
  assert.equal((await call('/api/auth/me', { cookie: otherInstructor })).body.data.role, 'instructor');
  await t.test('each account can update only its own display name', async () => {
    assert.equal((await call('/api/auth/me', { method: 'PATCH', body: { name: 'Anonymous' } })).response.status, 401);
    assert.equal((await call('/api/auth/me', { method: 'PATCH', cookie: otherLearner, origin: 'https://elsewhere.invalid', body: { name: 'Cross Site' } })).response.status, 403);
    assert.equal((await call('/api/auth/me', { method: 'PATCH', cookie: otherLearner, body: { name: 'Changed', role: 'admin' } })).response.status, 422);
    assert.equal((await call('/api/auth/me', { method: 'PATCH', cookie: otherLearner, body: { name: 'A' } })).response.status, 422);
    const updated = await call('/api/auth/me', { method: 'PATCH', cookie: otherLearner, body: { name: 'Updated Learner' } });
    assert.equal(updated.response.status, 200);
    assert.equal(updated.body.data.name, 'Updated Learner');
    assert.equal(updated.body.data.role, 'learner');
    assert.equal((await call('/api/auth/me', { cookie: otherLearner })).body.data.name, 'Updated Learner');
    assert.notEqual((await call('/api/auth/me', { cookie: learner })).body.data.name, 'Updated Learner');
    assert.equal((await call('/api/auth/me', { method: 'PATCH', cookie: otherInstructor, body: { name: 'Updated Instructor' } })).body.data.name, 'Updated Instructor');
    assert.equal((await call('/profile', { cookie: otherLearner })).response.status, 200);
    assert.equal((await call('/profile', { cookie: otherInstructor })).response.status, 200);
    const signedOutPage = await call('/profile');
    assert.equal(signedOutPage.response.status, 200); // Partial prerendered shell; redirect is streamed.
    assert.doesNotMatch(signedOutPage.body.nonJson, /Updated Learner/);
  });
  await t.test('profile photos and password changes stay within the signed-in account', async () => {
    const email = `profile-${randomBytes(5).toString('hex')}@example.invalid`;
    const registered = await call('/api/auth/register', { method: 'POST', body: { name: 'Profile Tester', email, password } });
    assert.equal(registered.response.status, 201);
    const cookie = registered.response.headers.get('set-cookie').split(';')[0];
    const image = readFileSync(resolve(root, 'public/courses/course-2.jpg'));
    const upload = (session, bytes, mime = 'image/jpeg', origin = base) => fetch(`${base}/api/auth/me/avatar`, {
      method: 'POST', headers: { ...(session ? { Cookie: session } : {}), Origin: origin, 'Content-Type': mime }, body: bytes,
    });
    assert.equal((await upload(null, image)).status, 401);
    assert.equal((await upload(cookie, image, 'image/jpeg', 'https://elsewhere.invalid')).status, 403);
    assert.equal((await upload(cookie, Buffer.from('not an image'))).status, 422);
    assert.equal((await upload(cookie, image, 'image/svg+xml')).status, 415);
    const uploaded = await upload(cookie, image);
    assert.equal(uploaded.status, 201, await uploaded.clone().text());
    const avatar = (await uploaded.json()).data.avatar;
    assert.match(avatar, /^\/api\/avatars\/[0-9a-f-]+\.jpg$/);
    assert.equal((await call('/api/auth/me', { cookie })).body.data.avatar, avatar);
    assert.notEqual((await call('/api/auth/me', { cookie: otherLearner })).body.data.avatar, avatar);
    const publicPhoto = await fetch(`${base}${avatar}`);
    assert.equal(publicPhoto.status, 200);
    assert.equal(publicPhoto.headers.get('x-content-type-options'), 'nosniff');
    assert.deepEqual(Buffer.from(await publicPhoto.arrayBuffer()), image);
    assert.equal((await call('/api/auth/me/avatar', { method: 'DELETE', cookie })).body.data.avatar, null);
    assert.equal((await call(avatar)).response.status, 404);
    assert.equal((await call('/api/auth/me', { cookie })).body.data.avatar, null);

    assert.equal((await call('/api/auth/me/password', { method: 'POST', cookie, body: { currentPassword: 'wrong', newPassword: 'New-Password-123' } })).response.status, 401);
    assert.equal((await call('/api/auth/me/password', { method: 'POST', cookie, body: { currentPassword: password, newPassword: 'short' } })).response.status, 422);
    assert.equal((await call('/api/auth/me/password', { method: 'POST', cookie, origin: 'https://elsewhere.invalid', body: { currentPassword: password, newPassword: 'New-Password-123' } })).response.status, 403);
    const changed = await call('/api/auth/me/password', { method: 'POST', cookie, body: { currentPassword: password, newPassword: 'New-Password-123' } });
    assert.equal(changed.response.status, 200);
    assert.equal((await call('/api/auth/me', { cookie })).response.status, 401);
    assert.equal((await call('/api/auth/login', { method: 'POST', body: { email, password } })).response.status, 401);
    assert.equal((await call('/api/auth/login', { method: 'POST', body: { email, password: 'New-Password-123' } })).response.status, 200);
  });
  let earnedCertificateId = '';
  await t.test('unauthenticated, role, input and identity boundaries', async () => {
    for (const path of ['/api/me/enrollments', '/api/me/wishlist', '/api/me/certificates', '/api/instructor/students', '/api/admin/users']) {
      assert.equal((await call(path)).response.status, 401, path);
    }
    for (const path of ['/api/instructor/students', '/api/instructor/analytics', '/api/instructor/bootcamps', '/api/admin/users']) {
      assert.equal((await call(path, { cookie: learner })).response.status, 403, path);
    }
    assert.equal((await call('/api/admin/users', { cookie: otherInstructor })).response.status, 403);
    const email = `role-test-${randomBytes(5).toString('hex')}@example.invalid`;
    const register = await call('/api/auth/register', { method: 'POST', body: { name: 'Role Test', email, password, role: 'admin', userId: 'usr_003' } });
    assert.equal(register.response.status, 201, JSON.stringify(register.body));
    assert.equal(register.body.data.role, 'learner');
    assert.notEqual(register.body.data.id, 'usr_003');
    const tutorSignup = await call('/api/auth/register', { method: 'POST', body: {
      name: 'Forged Tutor', email: `forged-tutor-${randomBytes(5).toString('hex')}@example.invalid`, password, role: 'instructor', isSuperAdmin: true,
    } });
    assert.equal(tutorSignup.response.status, 201);
    assert.equal(tutorSignup.body.data.role, 'learner');
    assert.equal((await call('/api/instructor/courses', {
      cookie: tutorSignup.response.headers.get('set-cookie').split(';')[0],
    })).response.status, 403);
    const forged = await call('/api/courses/course-free-foundations/enroll', { method: 'POST', cookie: otherLearner, body: { userId: 'usr_seed_learner_2', role: 'admin' } });
    assert.equal(forged.response.status, 200, JSON.stringify(forged.body));
    assert.equal((await call('/api/me/enrollments', { cookie: otherLearner })).body.data.some((e) => e.id === forged.body.data.id), true);
    assert.equal((await call('/api/me/enrollments', { cookie: learner })).body.data.some((e) => e.id === forged.body.data.id), false);
    assert.equal((await call('/api/courses/%20/enroll', { method: 'POST', cookie: learner })).response.status, 422);
    assert.equal((await call('/api/me/wishlist', { method: 'POST', cookie: learner, body: { courseId: '../course-1' } })).response.status, 422);
    assert.equal((await call('/api/courses?sort=not-a-sort')).response.status, 422);
    assert.equal((await call('/api/courses/course-free-foundations/lessons/lesson-free-1/progress', { method: 'PUT', cookie: learner, body: { completed: 'yes' } })).response.status, 422);
  });
  await t.test('role and paid enrollment guard', async () => {
    assert.equal((await call('/api/instructor/courses', { cookie: learner })).response.status, 403);
    const paid = await call('/api/courses/course-1/enroll', { method: 'POST', cookie: learner });
    assert.equal(paid.response.status, 409);
    assert.equal(paid.body.error.code, 'PAYMENT_REQUIRED');
    const quote = await call('/api/orders', { method: 'POST', cookie: learner, body: { courseId: 'course-1' } });
    assert.equal(quote.response.status, 201);
    const unavailable = await call(`/api/orders/${quote.body.data.id}/checkout`, { method: 'POST', cookie: learner });
    assert.equal(unavailable.response.status, 503);
    assert.equal(unavailable.body.error.code, 'PAYMENT_NOT_CONFIGURED');
    assert.equal((await call('/api/payments/configuration')).body.data.checkoutAvailable, false);
  });

  await t.test('idempotent free enrollment, progress and certificate', async () => {
    const first = await call('/api/courses/course-free-foundations/enroll', { method: 'POST', cookie: learner });
    const again = await call('/api/courses/course-free-foundations/enroll', { method: 'POST', cookie: learner });
    assert.equal(first.response.status, 200);
    assert.equal(first.body.data.id, again.body.data.id);
    const one = await call('/api/courses/course-free-foundations/lessons/lesson-free-1/complete', { method: 'POST', cookie: learner });
    const repeat = await call('/api/courses/course-free-foundations/lessons/lesson-free-1/complete', { method: 'POST', cookie: learner });
    assert.equal(one.body.data.progressPercent, 50);
    assert.equal(repeat.body.data.progressPercent, 50);
    const final = await call('/api/courses/course-free-foundations/lessons/lesson-free-2/complete', { method: 'POST', cookie: learner });
    assert.equal(final.body.data.progressPercent, 100);
    const certificates = await call('/api/me/certificates', { cookie: learner });
    assert.equal(certificates.body.data.length, 1);
    earnedCertificateId = certificates.body.data[0].id;
    const number = certificates.body.data[0].certificateNumber;
    assert.equal((await call(`/api/certificates/verify/${number}`)).body.data.valid, true);
    assert.equal((await call('/api/certificates/verify/UNKNOWN')).body.data.valid, false);
  });
  await t.test('concurrent retries, foreign keys and cross-user records', async () => {
    const enrollments = await Promise.all(Array.from({ length: 8 }, () => call('/api/courses/course-free-foundations/enroll', { method: 'POST', cookie: otherLearner })));
    assert.ok(enrollments.every((r) => r.response.status === 200), JSON.stringify(enrollments.map((r) => r.body)));
    assert.equal(new Set(enrollments.map((r) => r.body.data.id)).size, 1);
    const progress = await Promise.all(Array.from({ length: 8 }, () => call('/api/courses/course-free-foundations/lessons/lesson-free-1/complete', { method: 'POST', cookie: otherLearner })));
    assert.ok(progress.every((r) => r.response.status === 200));
    assert.ok(progress.every((r) => r.body.data.progressPercent === 50));
    assert.equal((await call('/api/courses/course-free-foundations/lessons/lesson-free-2/progress', { method: 'PUT', cookie: otherLearner, body: { watchedSeconds: 12 } })).response.status, 200);
    const finishes = await Promise.all(Array.from({ length: 8 }, () => call('/api/courses/course-free-foundations/lessons/lesson-free-2/complete', { method: 'POST', cookie: otherLearner })));
    assert.ok(finishes.every((r) => r.response.status === 200));
    assert.equal(new Set(finishes.map((r) => r.body.data.certificateId)).size, 1);
    assert.equal((await call('/api/me/certificates', { cookie: otherLearner })).body.data.length, 1);
    assert.equal((await call(`/api/certificates/${earnedCertificateId}`, { cookie: otherLearner })).response.status, 403);
    const wishlist = await call('/api/me/wishlist', { method: 'POST', cookie: learner, body: { courseId: 'course-free-foundations', userId: 'usr_001' } });
    assert.equal(wishlist.response.status, 201);
    assert.equal((await call('/api/me/wishlist', { cookie: otherLearner })).body.data.some((c) => c.id === 'course-free-foundations'), false);
    assert.equal((await call('/api/me/wishlist/course-free-foundations', { method: 'DELETE', cookie: otherLearner })).response.status, 200);
    assert.equal((await call('/api/me/wishlist', { cookie: learner })).body.data.some((c) => c.id === 'course-free-foundations'), true);
    assert.equal((await call('/api/courses/course-free-foundations/lessons/les-1/complete', { method: 'POST', cookie: learner })).response.status, 404);
    assert.equal((await call('/api/courses/course-1/lessons/lesson-free-1/complete', { method: 'POST', cookie: learner })).response.status, 403);
    const db = new DatabaseSync(dbPath);
    try {
      db.exec('PRAGMA foreign_keys=ON');
      assert.equal(Number(db.prepare('PRAGMA foreign_keys').get().foreign_keys), 1);
      assert.equal(Number(db.prepare("SELECT COUNT(*) count FROM enrollments WHERE user_id='usr_001' AND course_id='course-free-foundations'").get().count), 1);
      assert.equal(Number(db.prepare("SELECT COUNT(*) count FROM certificates WHERE user_id='usr_001' AND course_id='course-free-foundations'").get().count), 1);
      assert.equal(Number(db.prepare('PRAGMA foreign_key_check').all().length), 0);
      assert.throws(() => db.prepare('INSERT INTO enrollments (id,user_id,course_id) VALUES (?,?,?)')
        .run(randomBytes(8).toString('hex'), 'usr_001', 'missing-course'), /FOREIGN KEY/);
    } finally { db.close(); }
  });

  await t.test('event registration persists and paid events require checkout', async () => {
    const events = await call('/api/events');
    assert.equal(events.response.status, 200);
    assert.ok(events.body.data.some((event) => event.slug === 'ai-engineering-masterclass'));
    const slug = 'ai-engineering-masterclass';
    const first = await call(`/api/events/${slug}/register`, { method: 'POST', cookie: learner });
    const again = await call(`/api/events/${slug}/register`, { method: 'POST', cookie: learner });
    assert.equal(first.response.status, 200, JSON.stringify(first.body));
    assert.equal(first.body.data.id, again.body.data.id);
    assert.equal((await call(`/api/events/${slug}/register`, { cookie: learner })).body.data.registered, true);
    const paid = await call('/api/events/industry-expert-microservices/register', { method: 'POST', cookie: learner });
    assert.equal(paid.response.status, 409, JSON.stringify(paid.body));
    assert.equal(paid.body.error.code, 'PAYMENT_REQUIRED');
    assert.equal((await call(`/api/events/${slug}/register`, { method: 'DELETE', cookie: learner })).body.data.registered, false);
  });

  const instructor = await login('john@example.com');
  await t.test('enrolled course curriculum cannot invalidate progress or certificates', async () => {
    const add = await call('/api/instructor/courses/course-free-foundations/sections/section-free-foundations/lessons', {
      method: 'POST', cookie: instructor, body: { title: 'Late Required Lesson', type: 'reading', durationSeconds: 300, status: 'published' },
    });
    assert.equal(add.response.status, 409, JSON.stringify(add.body));
    const hide = await call('/api/instructor/courses/course-free-foundations/lessons/lesson-free-1', {
      method: 'PATCH', cookie: instructor, body: { status: 'draft' },
    });
    assert.equal(hide.response.status, 409, JSON.stringify(hide.body));
    const changeType = await call('/api/instructor/courses/course-free-foundations/lessons/lesson-free-1', {
      method: 'PATCH', cookie: instructor, body: { type: 'video' },
    });
    assert.equal(changeType.response.status, 409, JSON.stringify(changeType.body));
    assert.equal((await call('/api/courses/course-free-foundations/progress', { cookie: otherLearner })).body.data.enrollment.progressPercent, 100);
  });
  await t.test('cross-instructor ownership', async () => {
    assert.equal((await call('/api/instructor/courses/course-1', { cookie: otherInstructor })).response.status, 403);
    assert.equal((await call('/api/instructor/courses/course-1', { method: 'PATCH', cookie: otherInstructor, body: { title: 'Stolen' } })).response.status, 403);
    assert.equal((await call('/api/instructor/live-classes/live-1', { method: 'PATCH', cookie: otherInstructor, body: { title: 'Stolen Class' } })).response.status, 403);
    assert.equal((await call('/api/instructor/students', { cookie: otherInstructor })).body.data.some((entry) => entry.course.id === 'course-free-foundations'), false);
    assert.equal((await call('/api/instructor/analytics', { cookie: otherInstructor })).response.status, 200);
  });
  await t.test('media upload boundary validates metadata and denies unavailable storage', async () => {
    const path = '/api/instructor/courses/course-1/media/upload';
    assert.equal((await call(path, { method: 'POST', body: { mimeType: 'video/mp4', sizeBytes: 1000 } })).response.status, 401);
    assert.equal((await call(path, { method: 'POST', cookie: otherInstructor, body: { mimeType: 'video/mp4', sizeBytes: 1000 } })).response.status, 403);
    const invalid = await call(path, { method: 'POST', cookie: instructor, body: { mimeType: 'text/html', sizeBytes: 1000 } });
    assert.equal(invalid.response.status, 422);
    assert.equal(invalid.body.error.code, 'INVALID_MEDIA_TYPE');
    const overOneGigabyte = await call(path, { method: 'POST', cookie: instructor, body: { mimeType: 'video/mp4', sizeBytes: 1_000_000_001 } });
    assert.equal(overOneGigabyte.response.status, 422);
    const oversized = await call(path, { method: 'POST', cookie: instructor, body: { mimeType: 'video/mp4', sizeBytes: 2_000_000_001 } });
    assert.equal(oversized.response.status, 422);
    const atOneGigabyte = await call(path, { method: 'POST', cookie: instructor, body: { mimeType: 'video/mp4', sizeBytes: 1_000_000_000 } });
    assert.equal(atOneGigabyte.response.status, 503);
    assert.equal(atOneGigabyte.body.error.code, 'PROVIDER_NOT_CONFIGURED');
    const valid = await call(path, { method: 'POST', cookie: instructor, body: { mimeType: 'video/mp4', sizeBytes: 1000 } });
    assert.equal(valid.response.status, 503);
    assert.equal(valid.body.error.code, 'PROVIDER_NOT_CONFIGURED');
  });
  let uploadedMediaAssetId = '';
  await t.test('local video upload is owned, streamed and preserved when a draft is saved again', async () => {
    const draft = {
      id: `local-${randomBytes(8).toString('hex')}`, slug: `local-media-${randomBytes(8).toString('hex')}`,
      title: 'Local media QA course', subtitle: 'Private lesson media', description: 'Private video storage and replay test.',
      category: 'Development', level: 'Beginner', language: 'English', price: 0,
      image: '/courses/course-1.jpg', whatYouWillLearn: ['Play a lesson'], requirements: [],
      sections: [{ id: 'temporary-section', title: 'Module one', lessons: [
        { id: 'temporary-lesson', title: 'Private video', type: 'video', duration: '1 mins' },
      ] }], status: 'Draft',
    };
    const created = await call('/api/instructor/courses/save', { method: 'POST', cookie: instructor, body: draft });
    assert.equal(created.response.status, 200, JSON.stringify(created.body));
    const courseId = created.body.data.id;
    const lessonId = created.body.data.sections[0].lessons[0].id;
    const path = `/api/instructor/courses/${courseId}/lessons/${lessonId}/media`;
    const bytes = readFileSync(resolve(root, 'public/videos/lesson-demo.webm'));
    async function upload(cookie, data, mimeType = 'video/webm', origin = base) {
      const response = await fetch(`${base}${path}`, { method: 'POST', headers: {
        ...(cookie ? { Cookie: cookie } : {}), Origin: origin, 'Content-Type': mimeType,
        'X-Video-Duration-Seconds': '123',
      }, body: data });
      return { response, body: await response.json() };
    }
    assert.equal((await upload(null, bytes)).response.status, 401);
    assert.equal((await upload(otherInstructor, bytes)).response.status, 403);
    assert.equal((await upload(instructor, bytes, 'video/webm', 'https://elsewhere.invalid')).response.status, 403);
    assert.equal((await upload(instructor, Buffer.from('not a video'))).response.status, 422);
    const uploaded = await upload(instructor, bytes);
    assert.equal(uploaded.response.status, 201, JSON.stringify(uploaded.body));
    assert.equal(uploaded.body.data.durationSeconds, 123);
    const assetId = uploaded.body.data.assetId;
    uploadedMediaAssetId = assetId;
    const streamPath = `/api/media/${assetId}/stream`;
    assert.equal((await call(streamPath)).response.status, 401);
    assert.equal((await call(streamPath, { cookie: otherLearner })).response.status, 403);
    const ranged = await fetch(`${base}${streamPath}`, { headers: { Cookie: instructor, Range: 'bytes=0-15' } });
    assert.equal(ranged.status, 206);
    assert.equal(ranged.headers.get('content-range'), `bytes 0-15/${bytes.length}`);
    assert.deepEqual(Buffer.from(await ranged.arrayBuffer()), bytes.subarray(0, 16));
    assert.equal((await call(`/api/media/${assetId}/access`, { cookie: instructor })).body.data.url, streamPath);
    const persistedDraft = {
      ...draft, id: courseId, sections: [{ id: created.body.data.sections[0].id, title: 'Module one', lessons: [
        { id: lessonId, title: 'Private video', type: 'video', duration: '1 mins' },
      ] }],
    };
    const savedAgain = await call('/api/instructor/courses/save', { method: 'POST', cookie: instructor, body: persistedDraft });
    assert.equal(savedAgain.response.status, 200, JSON.stringify(savedAgain.body));
    assert.equal(savedAgain.body.data.sections[0].lessons[0].id, lessonId);
    assert.equal(savedAgain.body.data.sections[0].lessons[0].mediaAssetId, assetId);
    assert.equal(savedAgain.body.data.sections[0].lessons[0].durationSeconds, 123);
    assert.equal(savedAgain.body.data.durationSeconds, 123);
    const submitted = await call('/api/instructor/courses/save', { method: 'POST', cookie: instructor,
      body: { ...persistedDraft, status: 'Pending Approval' } });
    assert.equal(submitted.response.status, 200, JSON.stringify(submitted.body));
    assert.equal(submitted.body.data.reviewStatus, 'pending_approval');
    assert.equal(submitted.body.data.sections[0].lessons[0].mediaAssetId, assetId);
    assert.equal((await call(streamPath, { cookie: otherLearner })).response.status, 403);
    const adminLogin = await call('/api/admin/auth/login', { method: 'POST', body: { email: 'admin@example.com', password } });
    assert.equal(adminLogin.response.status, 200);
    const adminCookie = adminLogin.response.headers.get('set-cookie').split(';')[0];
    assert.equal((await call(`/api/admin/courses/${courseId}/pricing`, { method: 'PUT', cookie: adminCookie,
      body: { basePriceMinor: 0, minMarginBps: 0, maxMarginBps: 0 } })).response.status, 200);
    assert.equal((await call(`/api/admin/courses/${courseId}/pricing`, { method: 'POST', cookie: adminCookie,
      body: { action: 'approve', marginBps: 0 } })).response.status, 200);
    assert.equal((await call(`/api/admin/courses/${courseId}/review`, { method: 'POST', cookie: adminCookie,
      body: { action: 'approve' } })).response.status, 200);
    assert.equal((await call(`/api/admin/courses/${courseId}/review`, { method: 'POST', cookie: adminCookie,
      body: { action: 'publish' } })).response.status, 200);
    assert.equal((await call(`/api/courses/${courseId}`)).body.data.sections[0].lessons[0].mediaAssetId, assetId);
    assert.equal((await call(`/api/courses/${courseId}/enroll`, { method: 'POST', cookie: learner })).response.status, 200);
    const learnerPlayback = await fetch(`${base}${streamPath}`, { headers: { Cookie: learner, Range: 'bytes=0-3' } });
    assert.equal(learnerPlayback.status, 206);
    assert.deepEqual(Buffer.from(await learnerPlayback.arrayBuffer()), bytes.subarray(0, 4));
  });
  await t.test('quiz, assignment and resource lessons persist, publish and enforce submissions', async () => {
    const slug = `activities-${randomBytes(6).toString('hex')}`;
    const draft = {
      id: `local-${randomBytes(6).toString('hex')}`, slug, title: 'Activity course', subtitle: 'Practice the material',
      description: 'A complete course with interactive lessons.', category: 'Development', level: 'Beginner',
      language: 'English', price: 0, image: '/courses/course-1.jpg', whatYouWillLearn: ['Apply the lesson'],
      requirements: [], status: 'Draft', sections: [{ id: 'local-section', title: 'Activities', lessons: [
        { id: 'local-quiz', title: 'Quiz', type: 'quiz', duration: '1 mins', activity: { kind: 'quiz', passingPercent: 100,
          questions: [{ prompt: 'Which answer is correct?', options: ['Correct', 'Incorrect'], correctIndex: 0 }] } },
        { id: 'local-assignment', title: 'Assignment', type: 'project', duration: '1 mins',
          activity: { kind: 'assignment', instructions: 'Explain your answer in a short paragraph.' } },
        { id: 'local-resource', title: 'Resource', type: 'reading', duration: '1 mins',
          activity: { kind: 'resource', label: 'Guide', url: 'https://example.com/guide', description: 'Reference material' } },
      ] }],
    };
    const saved = await call('/api/instructor/courses/save', { method: 'POST', cookie: instructor, body: draft });
    assert.equal(saved.response.status, 200, JSON.stringify(saved.body));
    const courseId = saved.body.data.id;
    const [quizId, assignmentId, resourceId] = saved.body.data.sections[0].lessons.map((lesson) => lesson.id);
    assert.equal(saved.body.data.sections[0].lessons[0].activity.questions[0].correctIndex, 0);
    const submitted = await call('/api/instructor/courses/save', { method: 'POST', cookie: instructor,
      body: { ...draft, id: courseId, sections: [{ ...draft.sections[0], id: saved.body.data.sections[0].id,
        lessons: draft.sections[0].lessons.map((lesson, index) => ({ ...lesson, id: [quizId, assignmentId, resourceId][index] })) }],
        status: 'Pending Approval' } });
    assert.equal(submitted.response.status, 200, JSON.stringify(submitted.body));
    const adminLogin = await call('/api/admin/auth/login', { method: 'POST', body: { email: 'admin@example.com', password } });
    const adminCookie = adminLogin.response.headers.get('set-cookie').split(';')[0];
    assert.equal((await call(`/api/admin/courses/${courseId}/pricing`, { method: 'PUT', cookie: adminCookie,
      body: { basePriceMinor: 0, minMarginBps: 0, maxMarginBps: 0 } })).response.status, 200);
    assert.equal((await call(`/api/admin/courses/${courseId}/pricing`, { method: 'POST', cookie: adminCookie,
      body: { action: 'approve', marginBps: 0 } })).response.status, 200);
    assert.equal((await call(`/api/admin/courses/${courseId}/review`, { method: 'POST', cookie: adminCookie,
      body: { action: 'approve' } })).response.status, 200);
    assert.equal((await call(`/api/admin/courses/${courseId}/review`, { method: 'POST', cookie: adminCookie,
      body: { action: 'publish' } })).response.status, 200);
    const publicCourse = await call(`/api/courses/${courseId}`);
    assert.equal(publicCourse.response.status, 200);
    assert.equal(JSON.stringify(publicCourse.body).includes('correctIndex'), false);
    assert.equal((await call(`/api/courses/${courseId}/enroll`, { method: 'POST', cookie: learner })).response.status, 200);
    assert.equal((await call(`/api/courses/${courseId}/lessons/${quizId}/progress`, { method: 'PUT', cookie: learner,
      body: { completed: true } })).response.status, 409);
    const wrong = await call(`/api/courses/${courseId}/lessons/${quizId}/submit`, { method: 'POST', cookie: learner, body: { response: [1] } });
    assert.equal(wrong.response.status, 200, JSON.stringify(wrong.body));
    assert.equal(wrong.body.data.passed, false);
    const correct = await call(`/api/courses/${courseId}/lessons/${quizId}/submit`, { method: 'POST', cookie: learner, body: { response: [0] } });
    assert.equal(correct.response.status, 200, JSON.stringify(correct.body));
    assert.equal(correct.body.data.passed, true);
    assert.equal((await call(`/api/courses/${courseId}/lessons/${assignmentId}/progress`, { method: 'PUT', cookie: learner,
      body: { completed: true } })).response.status, 409);
    const assignment = await call(`/api/courses/${courseId}/lessons/${assignmentId}/submit`, { method: 'POST', cookie: learner,
      body: { response: 'This is my written assignment response.' } });
    assert.equal(assignment.response.status, 200, JSON.stringify(assignment.body));
    assert.equal(assignment.body.data.passed, true);
    assert.equal((await call(`/api/courses/${courseId}/lessons/${resourceId}/progress`, { method: 'PUT', cookie: learner,
      body: { completed: true } })).response.status, 200);
    assert.equal((await call(`/api/courses/${courseId}/lessons/${quizId}/submit`, { method: 'POST', cookie: otherLearner,
      body: { response: [0] } })).response.status, 403);
  });
  await t.test('draft preview media cannot be accessed by another learner', async () => {
    const slug = `media-draft-${randomBytes(5).toString('hex')}`;
    const course = await call('/api/instructor/courses', { method: 'POST', cookie: instructor, body: { title: 'Draft Media Boundary', slug, description: 'A private draft.', thumbnail: '/courses/course-1.jpg' } });
    assert.equal(course.response.status, 201, JSON.stringify(course.body));
    const courseId = course.body.data.id;
    const section = await call(`/api/instructor/courses/${courseId}/sections`, { method: 'POST', cookie: instructor, body: { title: 'Draft Section' } });
    assert.equal(section.response.status, 201, JSON.stringify(section.body));
    const lesson = await call(`/api/instructor/courses/${courseId}/sections/${section.body.data.id}/lessons`, { method: 'POST', cookie: instructor, body: {
      title: 'Private Preview', type: 'video', durationSeconds: 600, isPreview: true, status: 'published',
    } });
    assert.equal(lesson.response.status, 201, JSON.stringify(lesson.body));
    const assetId = randomBytes(10).toString('hex');
    const storageKey = `test/${assetId}`;
    const db = new DatabaseSync(dbPath);
    try {
      db.prepare('INSERT INTO media_assets (id,owner_id,storage_key,mime_type,size_bytes) VALUES (?,?,?,?,?)')
        .run(assetId, 'usr_002', storageKey, 'video/mp4', 100);
      db.prepare('UPDATE lessons SET video_storage_key=? WHERE id=?').run(storageKey, lesson.body.data.id);
    } finally { db.close(); }
    assert.equal((await call(`/api/media/${assetId}/access`, { cookie: learner })).response.status, 403);
  });
  await t.test('course thumbnails upload privately and persist instead of reverting to the default', async () => {
    const slug = `thumbnail-test-${randomBytes(5).toString('hex')}`;
    const created = await call('/api/instructor/courses', { method: 'POST', cookie: instructor, body: {
      title: 'Thumbnail Persistence Test', slug, description: 'An isolated image upload test.', thumbnail: '/courses/course-1.jpg',
    } });
    assert.equal(created.response.status, 201, JSON.stringify(created.body));
    const courseId = created.body.data.id;
    const uploadPath = `/api/instructor/courses/${courseId}/thumbnail`;
    const image = readFileSync(resolve(root, 'public/courses/course-2.jpg'));
    const postImage = (cookie, bytes, mime = 'image/jpeg', origin = base) => fetch(`${base}${uploadPath}`, {
      method: 'POST', headers: { ...(cookie ? { Cookie: cookie } : {}), Origin: origin, 'Content-Type': mime }, body: bytes,
    });
    assert.equal((await postImage(null, image)).status, 401);
    assert.equal((await postImage(otherInstructor, image)).status, 403);
    assert.equal((await postImage(instructor, image, 'image/jpeg', 'https://elsewhere.invalid')).status, 403);
    assert.equal((await postImage(instructor, Buffer.from('not an image'))).status, 422);
    const uploaded = await postImage(instructor, image);
    assert.equal(uploaded.status, 201, await uploaded.clone().text());
    const firstUrl = (await uploaded.json()).data.url;
    assert.match(firstUrl, /^\/api\/course-thumbnails\/[0-9a-f-]+\.jpg$/);
    assert.equal((await call(`/api/instructor/courses/${courseId}`, { cookie: instructor })).body.data.thumbnail, firstUrl);
    assert.equal((await call(firstUrl)).response.status, 404, 'A draft image is private to its tutor and admins.');
    assert.equal((await call(firstUrl, { cookie: otherInstructor })).response.status, 404);
    const imageResponse = await fetch(`${base}${firstUrl}`, { headers: { Cookie: instructor } });
    assert.equal(imageResponse.status, 200);
    assert.equal(imageResponse.headers.get('content-type'), 'image/jpeg');
    assert.deepEqual(Buffer.from(await imageResponse.arrayBuffer()), image);
    const replaced = await postImage(instructor, readFileSync(resolve(root, 'public/courses/course-3.jpg')));
    assert.equal(replaced.status, 201);
    const secondUrl = (await replaced.json()).data.url;
    assert.notEqual(secondUrl, firstUrl);
    assert.equal((await call(firstUrl, { cookie: instructor })).response.status, 404);
    assert.equal((await call(`/api/instructor/courses/${courseId}`, { cookie: instructor })).body.data.thumbnail, secondUrl);
  });
  await t.test('video completion and forged watched seconds require verified evidence', async () => {
    const db = new DatabaseSync(dbPath);
    try {
      const lesson = db.prepare("SELECT l.id FROM lessons l JOIN course_sections s ON s.id=l.section_id WHERE s.course_id='course-1' AND l.type='video' LIMIT 1").get();
      assert.ok(lesson);
      const lessonId = String(lesson.id);
      db.prepare('INSERT INTO enrollments (id,user_id,course_id) VALUES (?,?,?)')
        .run(randomBytes(10).toString('hex'), 'usr_seed_learner_2', 'course-1');
      const missing = await call(`/api/courses/course-1/lessons/${lessonId}/complete`, { method: 'POST', cookie: learner });
      assert.equal(missing.response.status, 409);
      assert.equal(missing.body.error.code, 'LESSON_MEDIA_UNAVAILABLE');
      db.prepare('UPDATE lessons SET video_storage_key=? WHERE id=?').run('isolated-test-media', lessonId);
      const direct = await call(`/api/courses/course-1/lessons/${lessonId}/complete`, { method: 'POST', cookie: learner });
      assert.equal(direct.response.status, 409);
      assert.equal(direct.body.error.code, 'WATCH_INCOMPLETE');
      const forged = await call(`/api/courses/course-1/lessons/${lessonId}/progress`, {
        method: 'PUT', cookie: learner, body: { completed: true, watchedSeconds: 86400 },
      });
      assert.equal(forged.response.status, 409);
      assert.equal(forged.body.error.code, 'WATCH_EVIDENCE_REQUIRED');
      assert.equal(db.prepare('SELECT COUNT(*) n FROM lesson_progress WHERE user_id=? AND lesson_id=?').get('usr_seed_learner_2', lessonId).n, 0);
      assert.equal(db.prepare('SELECT COUNT(*) n FROM certificates WHERE user_id=? AND course_id=?').get('usr_seed_learner_2', 'course-1').n, 0);

      const instructorId = String(db.prepare("SELECT instructor_id FROM courses WHERE id='course-1'").get().instructor_id);
      db.prepare('INSERT INTO media_assets (id,owner_id,storage_key,mime_type,size_bytes,duration_seconds) VALUES (?,?,?,?,?,?)')
        .run(randomBytes(10).toString('hex'), instructorId, 'isolated-test-media', 'video/webm', 286630, 3);
      const watchPath = `/api/courses/course-1/lessons/${lessonId}/watch`;
      const watch = (positionSeconds, state, playbackRate = 1) => call(watchPath, { method: 'POST', cookie: learner,
        body: { positionSeconds, durationSeconds: 3, playbackRate, state } });
      assert.equal((await watch(0, 'playing', 2)).response.status, 422);
      assert.equal((await call(watchPath, { method: 'POST',
        body: { positionSeconds: 0, durationSeconds: 3, playbackRate: 1, state: 'playing' } })).response.status, 401);
      assert.equal((await call(watchPath, { method: 'POST', cookie: instructor,
        body: { positionSeconds: 0, durationSeconds: 3, playbackRate: 1, state: 'playing' } })).response.status, 403);
      assert.equal((await watch(0, 'playing')).response.status, 200);
      const skipped = await watch(3, 'ended');
      assert.equal(skipped.body.data.canComplete, false);
      assert.equal((await call(`/api/courses/course-1/lessons/${lessonId}/complete`, { method: 'POST', cookie: learner })).response.status, 409);
      await watch(0, 'seek');
      await watch(0, 'playing');
      for (const second of [1, 2, 3]) {
        await new Promise(resolveWait => setTimeout(resolveWait, 1100));
        const update = await watch(second, second === 3 ? 'ended' : 'playing');
        assert.equal(update.response.status, 200, JSON.stringify(update.body));
        if (second === 3) assert.equal(update.body.data.canComplete, true);
      }
      const verified = await call(`/api/courses/course-1/lessons/${lessonId}/complete`, { method: 'POST', cookie: learner });
      assert.equal(verified.response.status, 200, JSON.stringify(verified.body));
      assert.equal(verified.body.data.completed, true);
    } finally { db.close(); }
  });
  await t.test('live class ownership, attendance and stored chat', async () => {
    const created = await call('/api/instructor/live-classes', { method: 'POST', cookie: instructor, body: {
      title: 'Backend Integration Class', description: 'An isolated classroom API test.',
      scheduledAt: '2026-11-12T13:30:00.000Z', durationMinutes: 60,
    } });
    assert.equal(created.response.status, 201, JSON.stringify(created.body));
    const id = created.body.data.id;
    const reminder = await call(`/api/live/classes/${id}/reminder`, { method: 'POST', cookie: learner });
    assert.equal(reminder.body.data.reminderSet, true, JSON.stringify(reminder.body));
    assert.equal((await call(`/api/live/classes/${id}/reminder`, { cookie: learner })).body.data.reminderSet, true);
    assert.equal((await call(`/api/live/classes/${id}/reminder`, { method: 'DELETE', cookie: learner })).body.data.reminderSet, false);
    assert.equal((await call(`/api/live/classes/${id}/join`, { method: 'POST', cookie: learner })).response.status, 409);
    assert.equal((await call(`/api/instructor/live-classes/${id}`, { method: 'PATCH', cookie: learner, body: { status: 'live' } })).response.status, 403);
    const started = await call(`/api/instructor/live-classes/${id}`, { method: 'PATCH', cookie: instructor, body: { status: 'live' } });
    assert.equal(started.body.data.status, 'live');
    const joined = await call(`/api/live/classes/${id}/join`, { method: 'POST', cookie: learner });
    assert.equal(joined.response.status, 200, JSON.stringify(joined.body));
    assert.equal(joined.body.data.access, 'development_only');
    const message = await call(`/api/live/classes/${id}/messages`, { method: 'POST', cookie: learner, body: { message: 'Hello class' } });
    assert.equal(message.response.status, 201, JSON.stringify(message.body));
    const history = await call(`/api/live/classes/${id}/messages`, { cookie: learner });
    assert.equal(history.body.data.items.at(-1).body, 'Hello class');
    await call(`/api/live/classes/${id}/leave`, { method: 'POST', cookie: learner });
    assert.equal((await call(`/api/live/classes/${id}/messages`, { cookie: learner })).response.status, 403);
  });
  await t.test('cancelled live class rescheduling is validated and owned', async () => {
    const created = await call('/api/instructor/live-classes', { method: 'POST', cookie: instructor, body: {
      title: 'Reschedule Boundary Class', description: 'A class for status transition testing.',
      scheduledAt: '2026-11-18T13:30:00.000Z', durationMinutes: 45,
    } });
    assert.equal(created.response.status, 201, JSON.stringify(created.body));
    const id = created.body.data.id;
    assert.equal((await call(`/api/instructor/live-classes/${id}`, { method: 'PATCH', cookie: instructor, body: { status: 'cancelled' } })).body.data.status, 'cancelled');
    assert.equal((await call(`/api/live/classes/${id}`)).response.status, 404);
    assert.equal((await call(`/api/instructor/live-classes/${id}`, { method: 'PATCH', cookie: otherInstructor, body: {
      status: 'scheduled', scheduledAt: '2026-11-19T13:30:00.000Z',
    } })).response.status, 403);
    assert.equal((await call(`/api/instructor/live-classes/${id}`, { method: 'PATCH', cookie: instructor, body: {
      title: 'Edited without rescheduling',
    } })).response.status, 409);
    assert.equal((await call(`/api/instructor/live-classes/${id}`, { method: 'PATCH', cookie: instructor, body: {
      status: 'scheduled', scheduledAt: '2020-01-01T00:00:00.000Z',
    } })).response.status, 422);
    const rescheduled = await call(`/api/instructor/live-classes/${id}`, { method: 'PATCH', cookie: instructor, body: {
      title: 'Rescheduled Class', status: 'scheduled', scheduledAt: '2026-11-19T13:30:00.000Z', durationMinutes: 60,
    } });
    assert.equal(rescheduled.response.status, 200, JSON.stringify(rescheduled.body));
    assert.equal(rescheduled.body.data.status, 'scheduled');
    assert.equal(rescheduled.body.data.title, 'Rescheduled Class');
    assert.equal((await call(`/api/live/classes/${id}`)).body.data.status, 'scheduled');
  });
  await t.test('bootcamp creation, registration and ownership', async () => {
    const seededLiveCohort = await call('/api/bootcamps/7-day-full-stack-bootcamp');
    assert.equal(seededLiveCohort.response.status, 200);
    const linkedLiveSession = seededLiveCohort.body.data.sessions.find((entry) => entry.liveClassId === 'live-1');
    assert.equal(linkedLiveSession?.liveClassStatus, 'live', 'Linked live class state must override an elapsed session date.');
    const slug = `test-bootcamp-${randomBytes(4).toString('hex')}`;
    const created = await call('/api/instructor/bootcamps', { method: 'POST', cookie: instructor, body: {
      title: 'Backend Test Bootcamp', slug, description: 'A short cohort for integration testing.',
      startDate: '2026-11-12T13:30:00.000Z', endDate: '2026-11-13T13:30:00.000Z',
    } });
    assert.equal(created.response.status, 201, JSON.stringify(created.body));
    const id = created.body.data.id;
    assert.equal((await call(`/api/instructor/bootcamps/${id}`, { method: 'PATCH', cookie: otherInstructor, body: { title: 'Stolen' } })).response.status, 403);
    const earlyPublish = await call(`/api/instructor/bootcamps/${id}`, { method: 'PATCH', cookie: instructor, body: { status: 'published' } });
    assert.equal(earlyPublish.response.status, 422);
    assert.equal((await call(`/api/instructor/bootcamps/${id}`, { method: 'PATCH', cookie: learner, body: { title: 'Not mine' } })).response.status, 403);
    const session = await call(`/api/instructor/bootcamps/${id}/sessions`, { method: 'POST', cookie: instructor,
      body: { title: 'Foundations', description: 'Hands-on backend fundamentals.', durationMinutes: 105,
        assignmentTitle: 'Build an API', sessionDate: '2026-11-12T13:30:00.000Z' } });
    assert.equal(session.response.status, 201, JSON.stringify(session.body));
    const publish = await call(`/api/instructor/bootcamps/${id}`, { method: 'PATCH', cookie: instructor, body: { status: 'published' } });
    assert.equal(publish.response.status, 200, JSON.stringify(publish.body));
    const detail = await call(`/api/bootcamps/${slug}`);
    assert.equal(detail.response.status, 200);
    assert.equal(detail.body.data.sessions[0].durationMinutes, 105);
    assert.equal(detail.body.data.sessions[0].assignmentTitle, 'Build an API');
    const registration = await call(`/api/bootcamps/${slug}/register`, { method: 'POST', cookie: learner });
    assert.equal(registration.response.status, 200, JSON.stringify(registration.body));
    const repeated = await Promise.all(Array.from({ length: 4 }, () => call(`/api/bootcamps/${slug}/register`, { method: 'POST', cookie: learner })));
    assert.ok(repeated.every((entry) => entry.response.status === 200));
    assert.ok(repeated.every((entry) => entry.body.data.id === registration.body.data.id));
    assert.equal((await call(`/api/bootcamps/${slug}/register`, { cookie: otherLearner })).body.data.registered, false);
    assert.equal((await call(`/api/bootcamps/${slug}/register`, { cookie: learner })).body.data.registered, true);
    assert.equal((await call(`/api/bootcamps/${slug}/register`, { method: 'DELETE', cookie: learner })).body.data.registered, false);
  });
  await t.test('instructor ownership and publish validation', async () => {
    const owned = await call('/api/instructor/courses/course-2', { cookie: instructor });
    assert.equal(owned.response.status, 403);
    const draft = await call('/api/instructor/courses/save', { method: 'POST', cookie: instructor, body: {
      id: `local-${randomBytes(8).toString('hex')}`, slug: `test-video-${randomBytes(5).toString('hex')}`,
      title: 'Unhosted Video Course', subtitle: 'A course with a missing video',
      description: 'This draft must remain unpublished until media exists.', category: 'Development',
      level: 'Beginner', language: 'English', image: '/courses/course-1.jpg', price: 0,
      whatYouWillLearn: ['Understand the topic'], requirements: [], status: 'Draft',
      sections: [{ title: 'Start', lessons: [{ title: 'Video lesson', type: 'video', duration: '10 mins' }] }],
    } });
    assert.equal(draft.response.status, 200, JSON.stringify(draft.body));
    const publish = await call(`/api/instructor/courses/${draft.body.data.id}`, { method: 'PATCH', cookie: instructor, body: { status: 'published' } });
    assert.equal(publish.response.status, 422, JSON.stringify(publish.body));
    assert.equal(publish.body.error.code, 'COURSE_MEDIA_INCOMPLETE');
    for (const [lessonType, expectedCode] of [['reading', 'COURSE_READING_INCOMPLETE'], ['quiz', 'COURSE_ACTIVITY_INCOMPLETE']]) {
      const incomplete = await call('/api/instructor/courses/save', { method: 'POST', cookie: instructor, body: {
        id: `local-${randomBytes(8).toString('hex')}`, slug: `test-${lessonType}-${randomBytes(5).toString('hex')}`,
        title: `Incomplete ${lessonType} course`, subtitle: 'A course needing lesson content',
        description: 'Publishing must reject missing learner-facing activity.', category: 'Development',
        level: 'Beginner', language: 'English', image: '/courses/course-1.jpg', price: 0,
        whatYouWillLearn: ['Understand the topic'], requirements: [], status: 'Published',
        sections: [{ title: 'Start', lessons: [{ title: 'First lesson', type: lessonType, duration: '10 mins' }] }],
      } });
      assert.equal(incomplete.response.status, 422, JSON.stringify(incomplete.body));
      assert.equal(incomplete.body.error.code, expectedCode);
    }
  });

  let reviewedCourseId = '';
  await t.test('admin course review, price authority and public visibility', async () => {
    assert.equal((await call('/api/admin/courses')).response.status, 401);
    assert.equal((await call('/api/admin/courses', { cookie: learner })).response.status, 403);
    assert.equal((await call('/api/admin/courses', { cookie: instructor })).response.status, 403);
    assert.equal((await call('/api/admin/auth/login', { method: 'POST', body: { email: 'john@example.com', password } })).response.status, 401);
    assert.equal((await call('/api/auth/login', { method: 'POST', body: { email: 'admin@example.com', password } })).response.status, 403);
    const adminResponse = await call('/api/admin/auth/login', { method: 'POST', body: { email: 'admin@example.com', password } });
    assert.equal(adminResponse.response.status, 200, JSON.stringify(adminResponse.body));
    const admin = adminResponse.response.headers.get('set-cookie').split(';')[0];
    const loginPage = await fetch(`${base}/control-center/login`);
    assert.equal(loginPage.status, 200);
    assert.match(await loginPage.text(), /Administrator sign in/);
    const unauthorizedPage = await fetch(`${base}/control-center`, { redirect: 'manual' });
    const unauthorizedHtml = await unauthorizedPage.text();
    assert.ok(unauthorizedPage.status === 307 || unauthorizedHtml.includes('NEXT_REDIRECT'));
    const protectedPages = ['/control-center', '/control-center/courses', '/control-center/courses/approvals', '/control-center/pricing',
      '/control-center/users', '/control-center/orders', '/control-center/categories', '/control-center/settings',
      '/control-center/operations/live', '/control-center/operations/certificates', '/control-center/profiles',
      '/control-center/my-profile'];
    for (const path of protectedPages) {
      const response = await fetch(`${base}${path}`, { headers: { Cookie: admin }, redirect: 'manual' });
      assert.equal(response.status, 200, path);
      assert.equal((await response.text()).includes('NEXT_REDIRECT'), false, path);
    }
    for (const path of ['/admin', '/admin/login', '/admin/courses', '/admin/users']) {
      const response = await fetch(`${base}${path}`, { headers: { Cookie: admin }, redirect: 'manual' });
      assert.equal(response.status, 404, path);
    }
    for (const [cookie, role] of [[learner, 'learner'], [instructor, 'instructor']]) {
      for (const path of protectedPages) {
        const response = await fetch(`${base}${path}`, { headers: { Cookie: cookie }, redirect: 'manual' });
        const html = await response.text();
        assert.ok(response.status === 307 || html.includes('NEXT_REDIRECT'), `${role} opened ${path}: ${response.status}`);
        assert.equal(html.includes('Control Center</span>'), false, `${role} received admin shell at ${path}`);
      }
      const loginResponse = await fetch(`${base}/control-center/login`, { headers: { Cookie: cookie }, redirect: 'manual' });
      const loginHtml = await loginResponse.text();
      assert.equal(loginResponse.status, 200, `${role} could not open admin login`);
      assert.match(loginHtml, /Administrator sign in/);
    }
    for (const path of ['/api/admin/users', '/api/admin/certificates', '/api/admin/live-classes', '/api/admin/orders']) {
      assert.equal((await call(path)).response.status, 401, path);
      assert.equal((await call(path, { cookie: learner })).response.status, 403, path);
      assert.equal((await call(path, { cookie: instructor })).response.status, 403, path);
      assert.equal((await call(path, { cookie: admin })).response.status, 200, path);
    }
    const userDirectory = await call('/api/admin/users?role=learner&pageSize=1', { cookie: admin });
    assert.equal(userDirectory.response.status, 200);
    assert.equal(userDirectory.body.data.items.length, 1);
    assert.ok(userDirectory.body.data.total >= 1);
    const searchedUsers = await call('/api/admin/users?search=samira%40example.invalid&role=learner', { cookie: admin });
    assert.equal(searchedUsers.response.status, 200);
    assert.equal(searchedUsers.body.data.total, 1);
    assert.equal((await call('/api/admin/users?pageSize=101', { cookie: admin })).response.status, 422);
    assert.equal((await call('/api/admin/live-classes?status=bad', { cookie: admin })).response.status, 422);
    assert.equal((await call('/api/admin/certificates?status=bad', { cookie: admin })).response.status, 422);
    const scheduledClasses = await call('/api/admin/live-classes?status=scheduled', { cookie: admin });
    assert.equal(scheduledClasses.response.status, 200);
    assert.ok(scheduledClasses.body.data.items.length >= 1);
    assert.ok(scheduledClasses.body.data.items.every((item) => item.status === 'scheduled'));
    assert.equal((await call('/api/admin/orders?page=0', { cookie: admin })).response.status, 422);
    const certificates = await call('/api/admin/certificates', { cookie: admin });
    assert.ok(certificates.body.data.items.length >= 1);
    const certificateId = certificates.body.data.items[0].id;
    assert.equal((await call(`/api/admin/certificates/${certificateId}`, { method: 'PATCH', cookie: instructor,
      body: { status: 'revoked', reason: 'Unauthorized change' } })).response.status, 403);
    assert.equal((await call(`/api/admin/certificates/${certificateId}`, { method: 'PATCH', cookie: admin,
      body: { status: 'revoked' } })).response.status, 422);
    assert.equal((await call(`/api/admin/certificates/${certificateId}`, { method: 'PATCH', cookie: admin,
      body: { status: 'revoked', reason: 'Audit verification test' } })).response.status, 200);
    assert.equal((await call(`/api/certificates/verify/${certificates.body.data.items[0].certificate_number}`)).body.data.valid, false);
    assert.equal((await call(`/api/admin/certificates/${certificateId}`, { method: 'PATCH', cookie: admin,
      body: { status: 'valid', reason: 'Restore after audit test' } })).response.status, 200);
    assert.equal((await call(`/api/certificates/verify/${certificates.body.data.items[0].certificate_number}`)).body.data.valid, true);
    const certificateAudit = new DatabaseSync(dbPath);
    try { assert.equal(certificateAudit.prepare("SELECT COUNT(*) n FROM admin_audit_logs WHERE entity_type='certificate' AND entity_id=?").get(certificateId).n, 2); }
    finally { certificateAudit.close(); }
    const secondAdminEmail = `second-admin-${randomBytes(5).toString('hex')}@example.invalid`;
    const candidate = await call('/api/auth/register', { method: 'POST', body: {
      name: 'Second Admin QA', email: secondAdminEmail, password, role: 'admin',
    } });
    assert.equal(candidate.response.status, 201);
    assert.equal(candidate.body.data.role, 'learner');
    const promotion = await call(`/api/admin/users/${candidate.body.data.id}`, { method: 'PATCH', cookie: admin, body: { role: 'admin', reason: 'Promote test operator after identity review.' } });
    assert.equal(promotion.response.status, 200, JSON.stringify(promotion.body));
    const promotedDetails = await call(`/api/admin/users/${candidate.body.data.id}`, { cookie: admin });
    assert.equal(promotedDetails.response.status, 200, JSON.stringify(promotedDetails.body));
    assert.equal(promotedDetails.body.data.user.role, 'admin');
    assert.equal((await call(`/api/admin/users/${candidate.body.data.id}`, { method: 'PATCH', cookie: admin, body: { status: 'disabled' } })).response.status, 422);
    const auditDb = new DatabaseSync(dbPath);
    try { assert.equal(auditDb.prepare("SELECT COUNT(*) n FROM admin_audit_logs WHERE entity_type='user' AND entity_id=?").get(candidate.body.data.id).n, 1); }
    finally { auditDb.close(); }
    assert.equal((await call('/api/auth/me', { cookie: candidate.response.headers.get('set-cookie').split(';')[0] })).response.status, 401);
    const nonSuperLogin = await call('/api/admin/auth/login', { method: 'POST', body: { email: secondAdminEmail, password } });
    assert.equal(nonSuperLogin.response.status, 200);
    const nonSuperCookie = nonSuperLogin.response.headers.get('set-cookie').split(';')[0];
    assert.equal((await call(`/api/admin/users/usr_001`, { method: 'PATCH', cookie: nonSuperCookie, body: { role: 'admin' } })).response.status, 403);
    assert.equal((await call('/api/admin/users', { cookie: nonSuperCookie })).response.status, 403);
    const tutorEmail = `created-tutor-${randomBytes(5).toString('hex')}@example.invalid`;
    const tutorBody = { name: 'Created Tutor', email: tutorEmail, currentPassword: password, reason: 'Verified teaching access' };
    assert.equal((await call('/api/admin/users', { method: 'POST', body: tutorBody })).response.status, 401);
    assert.equal((await call('/api/admin/users', { method: 'POST', cookie: learner, body: tutorBody })).response.status, 403);
    assert.equal((await call('/api/admin/users', { method: 'POST', cookie: instructor, body: tutorBody })).response.status, 403);
    assert.equal((await call('/api/admin/users', { method: 'POST', cookie: nonSuperCookie, body: tutorBody })).response.status, 403);
    assert.equal((await call('/api/admin/users', { method: 'POST', cookie: admin, origin: 'https://elsewhere.invalid', body: tutorBody })).response.status, 403);
    assert.equal((await call('/api/admin/users', { method: 'POST', cookie: admin, body: { ...tutorBody, role: 'admin' } })).response.status, 422);
    assert.equal((await call('/api/admin/users', { method: 'POST', cookie: admin, body: { ...tutorBody, currentPassword: 'incorrect' } })).response.status, 401);
    const createdTutor = await call('/api/admin/users', { method: 'POST', cookie: admin, body: tutorBody });
    assert.equal(createdTutor.response.status, 201, JSON.stringify(createdTutor.body));
    assert.equal(createdTutor.body.data.user.role, 'instructor');
    assert.ok(createdTutor.body.data.temporaryPassword.length >= 30);
    assert.equal((await call('/api/admin/users', { method: 'POST', cookie: admin, body: { ...tutorBody, email: tutorEmail.toUpperCase() } })).response.status, 409);
    const createdTutorLogin = await call('/api/auth/login', { method: 'POST', body: {
      email: tutorEmail, password: createdTutor.body.data.temporaryPassword,
    } });
    assert.equal(createdTutorLogin.response.status, 200, JSON.stringify(createdTutorLogin.body));
    assert.equal(createdTutorLogin.body.data.role, 'instructor');
    const createdTutorCookie = createdTutorLogin.response.headers.get('set-cookie').split(';')[0];
    assert.equal((await call('/api/instructor/courses', { cookie: createdTutorCookie })).response.status, 200);
    const tutorRecordDb = new DatabaseSync(dbPath);
    try {
      const stored = tutorRecordDb.prepare('SELECT role,is_super_admin,password_hash FROM users WHERE id=?').get(createdTutor.body.data.user.id);
      assert.equal(stored.role, 'instructor');
      assert.equal(stored.is_super_admin, 0);
      assert.equal(stored.password_hash.includes(createdTutor.body.data.temporaryPassword), false);
      assert.equal(tutorRecordDb.prepare("SELECT COUNT(*) n FROM admin_audit_logs WHERE entity_id=? AND action='tutor_created'").get(createdTutor.body.data.user.id).n, 1);
    } finally { tutorRecordDb.close(); }
    assert.equal((await call('/api/admin/profiles', { cookie: nonSuperCookie })).response.status, 403);
    assert.equal((await call('/api/admin/profiles')).response.status, 401);
    assert.equal((await call('/api/admin/profiles', { cookie: learner })).response.status, 403);
    const adminProfiles = await call('/api/admin/profiles', { cookie: admin });
    assert.equal(adminProfiles.response.status, 200);
    assert.equal(JSON.stringify(adminProfiles.body).includes('password_hash'), false);
    const subAdminPage = await fetch(`${base}/control-center/profiles`, { headers: { Cookie: nonSuperCookie }, redirect: 'manual' });
    assert.ok(subAdminPage.status === 307 || (await subAdminPage.text()).includes('NEXT_REDIRECT'));
    const usersPage = await fetch(`${base}/control-center/users`, { headers: { Cookie: nonSuperCookie }, redirect: 'manual' });
    assert.ok(usersPage.status === 307 || (await usersPage.text()).includes('NEXT_REDIRECT'));
    const subAdminEmail = `support-${randomBytes(5).toString('hex')}@example.invalid`;
    assert.equal((await call('/api/admin/profiles', { method: 'POST', cookie: admin, origin: 'https://elsewhere.invalid', body: {
      name: 'Support Operator', email: subAdminEmail, currentPassword: password, reason: 'Support course reviews',
    } })).response.status, 403);
    const attemptedEscalation = await call('/api/admin/profiles', { method: 'POST', cookie: admin, body: {
      name: 'Support Operator', email: subAdminEmail, currentPassword: password, reason: 'Support course reviews', isSuperAdmin: true,
    } });
    assert.equal(attemptedEscalation.response.status, 422);
    const createdSubAdmin = await call('/api/admin/profiles', { method: 'POST', cookie: admin, body: {
      name: 'Support Operator', email: subAdminEmail, currentPassword: password, reason: 'Support course reviews',
    } });
    assert.equal(createdSubAdmin.response.status, 201, JSON.stringify(createdSubAdmin.body));
    assert.equal((await call('/api/admin/profiles', { method: 'POST', cookie: admin, body: {
      name: 'Duplicate Operator', email: subAdminEmail, currentPassword: password, reason: 'Check duplicate account',
    } })).response.status, 409);
    assert.equal(createdSubAdmin.body.data.profile.isSuperAdmin, false);
    const initialSubPassword = createdSubAdmin.body.data.temporaryPassword;
    assert.ok(initialSubPassword.length >= 30);
    const initialSubLogin = await call('/api/admin/auth/login', { method: 'POST', body: { email: subAdminEmail, password: initialSubPassword } });
    assert.equal(initialSubLogin.response.status, 200);
    const initialSubCookie = initialSubLogin.response.headers.get('set-cookie').split(';')[0];
    assert.equal((await call('/api/admin/profiles', { cookie: initialSubCookie })).response.status, 403);
    assert.equal((await call(`/api/admin/profiles/${createdSubAdmin.body.data.profile.id}/reset-password`, {
      method: 'POST', cookie: initialSubCookie, body: { currentPassword: initialSubPassword, reason: 'Try self reset' },
    })).response.status, 403);
    assert.equal((await call(`/api/admin/profiles/${createdSubAdmin.body.data.profile.id}/reset-password`, {
      method: 'POST', cookie: admin, body: { currentPassword: 'wrong', reason: 'Routine credential rotation' },
    })).response.status, 401);
    assert.equal((await call(`/api/admin/profiles/${adminResponse.body.data.id}/reset-password`, { method: 'POST', cookie: admin,
      body: { currentPassword: password, reason: 'Attempt to reset super account' } })).response.status, 403);
    const subReset = await call(`/api/admin/profiles/${createdSubAdmin.body.data.profile.id}/reset-password`, {
      method: 'POST', cookie: admin, body: { currentPassword: password, reason: 'Routine credential rotation' },
    });
    assert.equal(subReset.response.status, 200, JSON.stringify(subReset.body));
    assert.equal((await call('/api/auth/me', { cookie: initialSubCookie })).response.status, 401);
    assert.equal((await call('/api/admin/auth/login', { method: 'POST', body: { email: subAdminEmail, password: initialSubPassword } })).response.status, 401);
    assert.equal((await call('/api/admin/auth/login', { method: 'POST', body: { email: subAdminEmail, password: subReset.body.data.temporaryPassword } })).response.status, 200);
    const subAudit = new DatabaseSync(dbPath);
    try {
      const row = subAudit.prepare('SELECT password_hash,is_super_admin FROM users WHERE id=?').get(createdSubAdmin.body.data.profile.id);
      assert.equal(row.is_super_admin, 0);
      assert.equal(row.password_hash.includes(subReset.body.data.temporaryPassword), false);
      assert.equal(subAudit.prepare("SELECT COUNT(*) n FROM admin_audit_logs WHERE entity_id=? AND action IN ('sub_admin_created','sub_admin_password_reset')").get(createdSubAdmin.body.data.profile.id).n, 2);
    } finally { subAudit.close(); }
    const slug = `review-course-${randomBytes(5).toString('hex')}`;
    const draft = await call('/api/instructor/courses', { method: 'POST', cookie: instructor, body: {
      title: 'Admin Review Course', slug, description: 'Complete reading course for review.', thumbnail: '/courses/course-1.jpg', price: 2400,
      basePriceMinor: 1, role: 'admin',
    } });
    assert.equal(draft.response.status, 201, JSON.stringify(draft.body));
    reviewedCourseId = draft.body.data.id;
    const draftList = await call('/api/admin/courses?status=draft&search=Admin%20Review%20Course&pageSize=1', { cookie: admin });
    assert.equal(draftList.response.status, 200);
    assert.equal(draftList.body.data.courses[0].id, reviewedCourseId);
    assert.equal(draftList.body.data.courses[0].thumbnail, '/courses/course-1.jpg');
    assert.equal(typeof draftList.body.data.courses[0].category, 'string');
    assert.equal(draft.body.data.price, 0);
    assert.equal(draft.body.data.pricing.proposedFinalMinor, 240000);
    assert.equal((await call(`/api/courses/${reviewedCourseId}`)).response.status, 404);
    assert.equal((await call('/api/orders', { method: 'POST', cookie: learner, body: { courseId: reviewedCourseId, priceMinor: 1 } })).response.status, 404);
    assert.equal((await call(`/api/instructor/courses/${reviewedCourseId}`, { method: 'PATCH', cookie: otherInstructor, body: { title: 'Stolen' } })).response.status, 403);
    assert.equal((await call(`/api/instructor/courses/${reviewedCourseId}`, { method: 'PATCH', cookie: instructor, body: { basePriceMinor: 1 } })).response.status, 403);
    const section = await call(`/api/instructor/courses/${reviewedCourseId}/sections`, { method: 'POST', cookie: instructor, body: { title: 'Start here' } });
    assert.equal(section.response.status, 201, JSON.stringify(section.body));
    const lesson = await call(`/api/instructor/courses/${reviewedCourseId}/sections/${section.body.data.id}/lessons`, { method: 'POST', cookie: instructor,
      body: { title: 'Read this lesson', type: 'reading', description: 'This lesson has useful content.', durationSeconds: 300, status: 'published' } });
    assert.equal(lesson.response.status, 201, JSON.stringify(lesson.body));
    const submit = await call(`/api/instructor/courses/${reviewedCourseId}`, { method: 'PATCH', cookie: instructor, body: { status: 'pending_approval' } });
    assert.equal(submit.response.status, 200, JSON.stringify(submit.body));
    assert.equal(submit.body.data.status, 'pending_approval');
    assert.equal((await call(`/api/courses/${reviewedCourseId}`)).response.status, 404);
    const rejected = await call(`/api/admin/courses/${reviewedCourseId}/review`, { method: 'POST', cookie: admin, body: { action: 'reject', feedback: 'Please improve the description.' } });
    assert.equal(rejected.response.status, 200, JSON.stringify(rejected.body));
    assert.equal((await call(`/api/admin/courses/${reviewedCourseId}/review`, { method: 'POST', cookie: instructor, body: { action: 'approve' } })).response.status, 403);
    const policy = await call(`/api/admin/courses/${reviewedCourseId}/pricing`, { method: 'PUT', cookie: admin,
      body: { basePriceMinor: 200000, minMarginBps: 1000, maxMarginBps: 2500, maxFinalMinor: 250000 } });
    assert.equal(policy.response.status, 200, JSON.stringify(policy.body));
    assert.equal((await call(`/api/admin/courses/${reviewedCourseId}/pricing`, { method: 'PUT', cookie: admin,
      body: { basePriceMinor: 210000, minMarginBps: 1000, maxMarginBps: 2500, maxFinalMinor: 250000 } })).response.status, 422);
    assert.equal((await call(`/api/instructor/courses/${reviewedCourseId}`, { method: 'PATCH', cookie: instructor, body: { marginBps: 900 } })).response.status, 422);
    assert.equal((await call(`/api/instructor/courses/${reviewedCourseId}`, { method: 'PATCH', cookie: instructor, body: { marginBps: 2600 } })).response.status, 422);
    const proposed = await call(`/api/instructor/courses/${reviewedCourseId}`, { method: 'PATCH', cookie: instructor, body: { marginBps: 2000 } });
    assert.equal(proposed.response.status, 200, JSON.stringify(proposed.body));
    assert.equal(proposed.body.data.pricing.proposedFinalMinor, 240000);
    assert.equal((await call(`/api/admin/courses/${reviewedCourseId}/pricing`, { method: 'POST', cookie: instructor, body: { action: 'approve' } })).response.status, 403);
    assert.equal((await call(`/api/instructor/courses/${reviewedCourseId}`, { method: 'PATCH', cookie: instructor, body: { price: 1 } })).response.status, 422);
    assert.equal((await call(`/api/admin/courses/${reviewedCourseId}/pricing`, { method: 'POST', cookie: admin, body: { action: 'approve', marginBps: 2600 } })).response.status, 422);
    const priceApproved = await call(`/api/admin/courses/${reviewedCourseId}/pricing`, { method: 'POST', cookie: admin, body: { action: 'approve' } });
    assert.equal(priceApproved.response.status, 200, JSON.stringify(priceApproved.body));
    assert.equal(priceApproved.body.data.finalPriceMinor, 240000);
    const priceHistoryBeforeRetry = new DatabaseSync(dbPath);
    const approvalCount = priceHistoryBeforeRetry.prepare("SELECT COUNT(*) n FROM course_approval_history WHERE course_id=? AND action='pricing_approved'").get(reviewedCourseId).n;
    priceHistoryBeforeRetry.close();
    assert.equal((await call(`/api/admin/courses/${reviewedCourseId}/pricing`, { method: 'POST', cookie: admin,
      body: { action: 'approve' } })).response.status, 200);
    const priceHistoryAfterRetry = new DatabaseSync(dbPath);
    assert.equal(priceHistoryAfterRetry.prepare("SELECT COUNT(*) n FROM course_approval_history WHERE course_id=? AND action='pricing_approved'").get(reviewedCourseId).n, approvalCount);
    priceHistoryAfterRetry.close();
    assert.equal((await call(`/api/admin/courses/${reviewedCourseId}/review`, { method: 'POST', cookie: admin, body: { action: 'publish' } })).response.status, 409);
    assert.equal((await call(`/api/instructor/courses/${reviewedCourseId}`, { method: 'PATCH', cookie: instructor, body: { status: 'pending_approval' } })).response.status, 200);
    assert.equal((await call(`/api/admin/courses/${reviewedCourseId}/review`, { method: 'POST', cookie: admin, body: { action: 'approve' } })).response.status, 200);
    assert.equal((await call(`/api/courses/${reviewedCourseId}`)).response.status, 404);
    const published = await call(`/api/admin/courses/${reviewedCourseId}/review`, { method: 'POST', cookie: admin, body: { action: 'publish' } });
    assert.equal(published.response.status, 200, JSON.stringify(published.body));
    assert.equal((await call(`/api/courses/${reviewedCourseId}`)).body.data.price, 2400);
    const list = await call('/api/courses?search=Admin%20Review%20Course');
    assert.equal(list.body.data.items.find((item) => item.id === reviewedCourseId).price, 2400);
    const order = await call('/api/orders', { method: 'POST', cookie: learner, body: { courseId: reviewedCourseId, priceMinor: 1 } });
    assert.equal(order.response.status, 201, JSON.stringify(order.body));
    assert.equal(order.body.data.totalMinor, 240000);
    const orderDetail = await call(`/api/admin/orders/${order.body.data.id}`, { cookie: admin });
    assert.equal(orderDetail.response.status, 200, JSON.stringify(orderDetail.body));
    assert.equal(orderDetail.body.data.items[0].price_minor, 240000);
    assert.equal(orderDetail.body.data.payments.length, 0);
    assert.equal((await call(`/api/admin/orders/${order.body.data.id}`, { cookie: learner })).response.status, 403);
    const searchedOrders = await call(`/api/admin/orders?search=${encodeURIComponent(order.body.data.id)}&page=1`, { cookie: admin });
    assert.equal(searchedOrders.response.status, 200);
    assert.equal(searchedOrders.body.data.pagination.total, 1);
    const db = new DatabaseSync(dbPath);
    try { assert.equal(db.prepare('SELECT price_minor FROM order_items WHERE order_id=?').get(order.body.data.id).price_minor, 240000); }
    finally { db.close(); }
    assert.equal((await call(`/api/instructor/courses/${reviewedCourseId}`, { method: 'PATCH', cookie: instructor, body: { description: 'Bypass review' } })).response.status, 409);
    assert.equal((await call(`/api/admin/courses/${reviewedCourseId}/review`, { method: 'POST', cookie: admin, body: { action: 'unpublish' } })).response.status, 200);
    assert.equal((await call(`/api/courses/${reviewedCourseId}`)).response.status, 404);
    assert.equal((await call('/api/orders', { method: 'POST', cookie: learner, body: { courseId: reviewedCourseId } })).response.status, 404);
    const detail = await call(`/api/admin/courses/${reviewedCourseId}`, { cookie: admin });
    assert.ok(detail.body.data.history.some((event) => event.action === 'rejected' && event.feedback.includes('description')));
    assert.ok(detail.body.data.history.some((event) => event.action === 'unpublished'));
    const changedSuperPassword = 'Aa1234!b';
    assert.equal((await call('/api/admin/profiles/me/password', { method: 'POST', cookie: nonSuperCookie,
      body: { currentPassword: password, newPassword: changedSuperPassword } })).response.status, 403);
    assert.equal((await call('/api/admin/profiles/me/password', { method: 'POST', cookie: admin,
      body: { currentPassword: password, newPassword: 'weak' } })).response.status, 422);
    assert.equal((await call('/api/admin/profiles/me/password', { method: 'POST', cookie: admin,
      body: { currentPassword: password, newPassword: 'Aa123!b' } })).response.status, 422);
    assert.equal((await call('/api/admin/profiles/me/password', { method: 'POST', cookie: admin,
      body: { currentPassword: password, newPassword: changedSuperPassword } })).response.status, 200);
    assert.equal((await call('/api/auth/me', { cookie: admin })).response.status, 401);
    assert.equal((await call('/api/admin/auth/login', { method: 'POST', body: { email: 'admin@example.com', password } })).response.status, 401);
    const changedLogin = await call('/api/admin/auth/login', { method: 'POST', body: { email: 'admin@example.com', password: changedSuperPassword } });
    assert.equal(changedLogin.response.status, 200);
    const changedCookie = changedLogin.response.headers.get('set-cookie').split(';')[0];
    assert.equal((await call('/api/auth/logout', { method: 'POST', cookie: changedCookie })).response.status, 200);
    assert.equal((await call('/api/admin/courses', { cookie: admin })).response.status, 401);
  });

  await t.test('session revocation', async () => {
    const first = await login('samira@example.invalid');
    assert.equal((await call('/api/auth/me', { cookie: learner })).response.status, 401);
    assert.equal((await call('/api/auth/me', { cookie: first })).response.status, 200);
    const second = await login('samira@example.invalid');
    assert.equal((await call('/api/auth/me', { cookie: first })).response.status, 401);
    assert.equal((await call('/api/auth/me', { cookie: second })).response.status, 200);
    const token = second.split('=')[1];
    const hash = (await import('node:crypto')).createHash('sha256').update(token).digest('hex');
    const db = new DatabaseSync(dbPath);
    try {
      const user = db.prepare('SELECT id FROM users WHERE email=?').get('samira@example.invalid');
      assert.equal(db.prepare('SELECT COUNT(*) AS total FROM sessions WHERE user_id=? AND revoked_at IS NULL').get(user.id).total, 1);
      db.prepare('UPDATE sessions SET expires_at=? WHERE token_hash=?').run('2000-01-01T00:00:00.000Z', hash);
    }
    finally { db.close(); }
    assert.equal((await call('/api/auth/me', { cookie: second })).response.status, 401);
    const concurrent = await Promise.all(Array.from({ length: 2 }, () => call('/api/auth/login', {
      method: 'POST', body: { email: 'samira@example.invalid', password },
    })));
    assert.ok(concurrent.every(({ response }) => response.status === 200));
    const concurrentCookies = concurrent.map(({ response }) => response.headers.get('set-cookie').split(';')[0]);
    const active = await Promise.all(concurrentCookies.map(async (cookie) => (await call('/api/auth/me', { cookie })).response.status));
    assert.deepEqual(active.sort(), [200, 401]);
    assert.equal((await call('/api/auth/logout', { method: 'POST', cookie: learner })).response.status, 200);
    assert.equal((await call('/api/auth/me', { cookie: learner })).response.status, 401);
  });
  await t.test('records and sessions survive application restart', async () => {
    server.kill();
    await new Promise((resolveExit) => server.once('exit', resolveExit));
    serverOutput = '';
    server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '-H', '127.0.0.1'],
      { cwd: root, env: { ...env, NODE_ENV: 'production' }, stdio: ['ignore', 'pipe', 'pipe'] });
    server.stdout.on('data', (chunk) => { serverOutput += chunk.toString(); });
    server.stderr.on('data', (chunk) => { serverOutput += chunk.toString(); });
    let restarted = false;
    for (let attempt = 0; attempt < 80; attempt++) {
      if (server.exitCode !== null) throw new Error(`Restarted server exited: ${serverOutput}`);
      try { if ((await fetch(`${base}/api/courses?pageSize=1`)).ok) { restarted = true; break; } }
      catch { /* server is starting */ }
      await new Promise((resolveWait) => setTimeout(resolveWait, 250));
    }
    assert.ok(restarted, `Restarted server did not respond: ${serverOutput}`);
    assert.equal((await call('/api/auth/me', { cookie: otherLearner })).response.status, 200);
    const restoredMedia = await fetch(`${base}/api/media/${uploadedMediaAssetId}/stream`, {
      headers: { Cookie: instructor, Range: 'bytes=0-3' },
    });
    assert.equal(restoredMedia.status, 206);
    assert.deepEqual(Buffer.from(await restoredMedia.arrayBuffer()), readFileSync(resolve(root, 'public/videos/lesson-demo.webm')).subarray(0, 4));
    assert.equal((await call('/api/me/certificates', { cookie: otherLearner })).body.data.length, 1);
    assert.equal((await call('/api/me/enrollments', { cookie: otherLearner })).body.data.some((e) => e.courseId === 'course-free-foundations'), true);
    assert.equal((await call('/api/auth/me', { cookie: learner })).response.status, 401);
    const db = new DatabaseSync(dbPath);
    try {
      assert.equal(db.prepare('SELECT review_status FROM courses WHERE id=?').get(reviewedCourseId).review_status, 'unpublished');
      assert.equal(db.prepare('SELECT COUNT(*) n FROM course_approval_history WHERE course_id=?').get(reviewedCourseId).n >= 5, true);
    } finally { db.close(); }
  });
  await t.test('page route smoke', async () => {
    const paths = [
      '/', '/courses', '/courses/full-stack-web-development',
      '/career-paths', '/career-paths/full-stack-developer', '/programs/beginner',
      '/blog', '/blog/modern-react-compiler-nextjs-15',
      '/live', '/live-classes', '/live-classes/live-1', '/live/classes/live-1',
      '/live/bootcamps', '/live/bootcamps/7-day-full-stack-bootcamp',
      '/live/events', '/live/events/ai-engineering-masterclass',
      '/login', '/login/welcome', '/signup', '/dashboard',
      '/learn/web-foundations-free-starter/lesson-free-1',
      '/certificates', `/certificates/${earnedCertificateId}`, '/certificates/verify',
      '/certificates/verify/UNKNOWN',
      '/about', '/careers', '/contact', '/privacy', '/terms', '/faq', '/help', '/community',
      '/instructor', '/instructor/apply', '/instructor/courses', '/instructor/courses/create',
      '/instructor/courses/course-1/edit', '/instructor/live-classes',
      '/instructor/live-classes/create', '/instructor/live-classes/live-1',
      '/instructor/bootcamps', '/instructor/bootcamps/create', '/instructor/students',
      '/instructor/analytics', '/instructor/messages', '/instructor/settings',
    ];
    assert.equal(paths.length, 47);
    for (const path of paths) {
      const response = await fetch(`${base}${path}`, { redirect: 'manual' });
      assert.ok(response.status < 400, `${path} returned ${response.status}`);
    }
  });
});
