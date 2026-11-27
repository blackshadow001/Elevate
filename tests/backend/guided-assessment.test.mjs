import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const root = resolve(import.meta.dirname, '../..');

async function freePort() {
  return new Promise((resolvePort) => {
    const socket = createServer();
    socket.listen(0, '127.0.0.1', () => {
      const address = socket.address();
      socket.close(() => resolvePort(address.port));
    });
  });
}

test('assessment certificate requires finished coursework, a passed exam and human-approved project', { timeout: 60000 }, async (t) => {
  const dbPath = resolve(root, 'data', `guided-assessment-${randomBytes(6).toString('hex')}.sqlite`);
  const env = { ...process.env, DATABASE_URL: `file:${dbPath}` };
  const migrated = spawnSync(process.execPath, ['scripts/db.mjs'], { cwd: root, env, encoding: 'utf8' });
  assert.equal(migrated.status, 0, migrated.stderr);
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, ['scripts/start-server.mjs'], {
    cwd: root, env: { ...env, NODE_ENV: 'production', PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let serverOutput = '';
  server.stdout.on('data', (chunk) => { serverOutput += chunk; });
  server.stderr.on('data', (chunk) => { serverOutput += chunk; });
  t.after(async () => {
    if (server.exitCode === null) {
      server.kill();
      await new Promise((resolveExit) => server.once('exit', resolveExit));
    }
    for (const suffix of ['', '-wal', '-shm']) rmSync(`${dbPath}${suffix}`, { force: true });
  });
  let ready = false;
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(`${base}/api/learning-paths`)).ok) { ready = true; break; } } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 200));
  }
  assert.ok(ready, serverOutput);

  async function call(path, { method = 'GET', cookie, body } = {}) {
    const response = await fetch(`${base}${path}`, { method,
      headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body ? { 'Content-Type': 'application/json', Origin: base } : {}) },
      body: body ? JSON.stringify(body) : undefined });
    return { status: response.status, body: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] };
  }
  const list = await call('/api/learning-paths');
  assert.equal(list.body.data.length, 6);
  assert.ok(list.body.data.every((path) => path.stepCount === 42 && path.chapterCount === 3 && path.moduleCount === 6));
  const slug = 'python-basics';
  const path = await call(`/api/learning-paths/${slug}`);
  assert.equal(path.body.data.steps.length, 42);
  assert.equal(path.body.data.steps[2].block_type, 'workshop');
  assert.equal(path.body.data.steps[2].practice.steps.length, 3);
  assert.match(path.body.data.steps[2].practice.code, /Decimal/);
  assert.equal(path.body.data.steps[3].block_type, 'lab');
  assert.ok(path.body.data.steps[3].practice.challenge.length > 40);
  const signup = await call('/api/auth/register', { method: 'POST', body: {
    name: 'Guided Learner', email: 'guided-learner@example.invalid', password: 'Testing12345!' } });
  assert.equal(signup.status, 201);
  const learnerCookie = signup.cookie;
  const learnerId = signup.body.data.id;
  assert.equal((await call(`/api/learning-paths/${slug}/exam`, { cookie: learnerCookie })).status, 409);
  assert.equal((await call(`/api/learning-paths/${slug}/project`, { method: 'POST', cookie: learnerCookie,
    body: { projectUrl: 'https://example.org/project', repositoryUrl: 'https://example.org/repo', notes: 'A'.repeat(100) } })).status, 409);

  const db = new DatabaseSync(dbPath);
  try {
    db.prepare(`INSERT INTO guided_step_progress(user_id,step_id,response,passed)
      SELECT ?,id,'completed in test',1 FROM guided_steps WHERE path_id=?`).run(learnerId, path.body.data.id);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM guided_path_completions WHERE user_id=?').get(learnerId).n, 0);
  } finally { db.close(); }
  const exam = await call(`/api/learning-paths/${slug}/exam`, { cookie: learnerCookie });
  assert.equal(exam.status, 200);
  assert.equal(exam.body.data.total, 12);
  assert.ok(!JSON.stringify(exam.body.data.questions).includes('"answer"'));
  const wrong = await call(`/api/learning-paths/${slug}/exam`, { method: 'POST', cookie: learnerCookie,
    body: { answers: Array(12).fill('incorrect') } });
  assert.equal(wrong.body.data.passed, false);
  const project = await call(`/api/learning-paths/${slug}/project`, { method: 'POST', cookie: learnerCookie,
    body: { projectUrl: 'https://example.org/project', repositoryUrl: 'https://github.com/example/expenses',
      notes: 'The expense tracker handles invalid input, stores CSV records, and has tests for totals and missing files.' } });
  assert.equal(project.status, 200);
  assert.equal(project.body.data.project.status, 'pending');
  assert.equal(project.body.data.certificate, null);
  assert.equal((await call('/api/admin/guided-projects', { cookie: learnerCookie })).status, 403);

  const reviewer = await call('/api/auth/register', { method: 'POST', body: {
    name: 'Guided Reviewer', email: 'guided-reviewer@example.invalid', password: 'Testing12345!' } });
  assert.equal(reviewer.status, 201);
  const adminDb = new DatabaseSync(dbPath);
  try { adminDb.prepare("UPDATE users SET role='admin' WHERE id=?").run(reviewer.body.data.id); }
  finally { adminDb.close(); }
  const queue = await call('/api/admin/guided-projects', { cookie: reviewer.cookie });
  assert.equal(queue.status, 200);
  assert.equal(queue.body.data.length, 1);
  const review = await call(`/api/admin/guided-projects/${queue.body.data[0].id}`, { method: 'PATCH', cookie: reviewer.cookie,
    body: { decision: 'approve', feedback: 'The app and tests meet the project requirements.' } });
  assert.equal(review.status, 200);
  const beforeExam = await call(`/api/learning-paths/${slug}`, { cookie: learnerCookie });
  assert.equal(beforeExam.body.data.assessment.certificate, null);
  const answerDb = new DatabaseSync(dbPath);
  let answers;
  try { answers = JSON.parse(answerDb.prepare('SELECT exam_json FROM guided_paths WHERE slug=?').get(slug).exam_json).map((item) => item.answer); }
  finally { answerDb.close(); }
  const passed = await call(`/api/learning-paths/${slug}/exam`, { method: 'POST', cookie: learnerCookie, body: { answers } });
  assert.equal(passed.status, 200);
  assert.equal(passed.body.data.score, 12);
  assert.equal(passed.body.data.passed, true);
  const certificateId = passed.body.data.assessment.certificate?.id;
  assert.ok(certificateId);
  const verification = await fetch(`${base}/learning-paths/verify/${certificateId}`);
  assert.equal(verification.status, 200);
  assert.match(await verification.text(), /Valid assessed course certificate/);
  assert.equal((await call(`/api/admin/guided-projects/${queue.body.data[0].id}`, { method: 'PATCH', cookie: reviewer.cookie,
    body: { decision: 'approve' } })).status, 409);
});
