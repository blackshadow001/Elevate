import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, randomBytes } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const root = resolve(import.meta.dirname, '../..');
const dbName = `payment-test-${randomBytes(6).toString('hex')}.sqlite`;
const dbPath = resolve(root, 'data', dbName);
const password = `Test-${randomBytes(20).toString('hex')}!`;
const keySecret = `test-${randomBytes(16).toString('hex')}`;
const webhookSecret = `webhook-${randomBytes(16).toString('hex')}`;
const env = { ...process.env, DATABASE_URL: `file:./data/${dbName}`, DEV_SEED_PASSWORD: password,
  RAZORPAY_KEY_ID: 'rzp_test_isolated', RAZORPAY_KEY_SECRET: keySecret, RAZORPAY_WEBHOOK_SECRET: webhookSecret,
  PERSONAL_PLAN_ENABLED: '1', EMAIL_PROVIDER: 'resend', RESEND_API_KEY: 'test-only',
  EMAIL_FROM: 'Elevate <billing@example.invalid>', SITE_URL: 'https://elevate.example.invalid',
  GOOGLE_CREDENTIALS_FILE: '', GOOGLE_CLIENT_ID: '', GOOGLE_CLIENT_SECRET: '' };

function run(script) {
  const result = spawnSync(process.execPath, [script], { cwd: root, env, encoding: 'utf8' });
  assert.equal(result.status, 0, `${script} failed: ${result.stderr}`);
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

test('Razorpay payment contracts, ownership and idempotency', { timeout: 90000 }, async (t) => {
  assert.ok(existsSync(resolve(root, '.next', 'BUILD_ID')), 'Run npm run build first.');
  run('scripts/db.mjs'); run('scripts/seed.mjs');
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const preload = resolve(root, 'tests/payment/razorpay-mock.cjs');
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port), '-H', '127.0.0.1'],
    { cwd: root, env: { ...env, NODE_ENV: 'production', NODE_OPTIONS: `--require=${preload}` }, stdio: ['ignore', 'pipe', 'pipe'] });
  let db;
  let serverOutput = '';
  server.stdout.on('data', chunk => { serverOutput += chunk.toString(); });
  server.stderr.on('data', chunk => { serverOutput += chunk.toString(); });
  t.after(async () => {
    if (server.exitCode === null) { server.kill(); await new Promise(done => server.once('exit', done)); }
    db?.close();
    for (const suffix of ['', '-wal', '-shm']) rmSync(`${dbPath}${suffix}`, { force: true });
  });
  let ready = false;
  for (let i = 0; i < 100; i++) {
    if (server.exitCode !== null) throw new Error(`Server exited: ${serverOutput.slice(-1000)}`);
    try { if ((await fetch(`${base}/api/courses?pageSize=1`)).ok) { ready = true; break; } } catch { /* starting */ }
    await new Promise(wait => setTimeout(wait, 200));
  }
  assert.ok(ready, `Server failed: ${serverOutput.slice(-1000)}`);

  async function call(path, { method = 'GET', cookie, body, headers = {} } = {}) {
    const response = await fetch(`${base}${path}`, { method, redirect: 'manual',
      headers: { ...(cookie ? { Cookie: cookie } : {}), ...(method !== 'GET' ? { Origin: base } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: body ? JSON.stringify(body) : undefined });
    const content = await response.text();
    let parsed; try { parsed = JSON.parse(content); } catch { parsed = {}; }
    return { status: response.status, body: parsed };
  }
  async function login(email) {
    const response = await fetch(`${base}${email === 'admin@example.com' ? '/api/admin/auth/login' : '/api/auth/login'}`, { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }) });
    assert.equal(response.status, 200);
    return response.headers.get('set-cookie').split(';')[0];
  }
  const learner = await login('samira@example.invalid');
  const other = await login('alex@example.com');
  const admin = await login('admin@example.com');
  db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys=ON');
  let paymentOrder;

  await t.test('authoritative quote, protected checkout and no enrollment before capture', async () => {
    assert.equal((await call('/api/orders', { method: 'POST', body: { courseId: 'course-1' } })).status, 401);
    assert.equal((await call('/api/orders', { method: 'POST', cookie: learner, body: { courseId: 'missing-course' } })).status, 404);
    const quote = await call('/api/orders', { method: 'POST', cookie: learner, body: { courseId: 'course-1', totalMinor: 1, currency: 'USD', status: 'paid' } });
    assert.equal(quote.status, 201, JSON.stringify(quote.body));
    assert.equal(quote.body.data.totalMinor, 149900);
    const orderId = quote.body.data.id;
    assert.equal((await call(`/api/orders/${orderId}`, { cookie: other })).status, 404);
    assert.equal((await call(`/api/orders/${orderId}/checkout`, { method: 'POST', cookie: other })).status, 404);
    assert.equal((await call(`/api/orders/${orderId}/checkout`, { method: 'POST' })).status, 401);
    const checkout = await call(`/api/orders/${orderId}/checkout`, { method: 'POST', cookie: learner });
    assert.equal(checkout.status, 200, `${JSON.stringify(checkout.body)}\n${serverOutput.slice(-1200)}`);
    assert.equal(checkout.body.data.totalMinor, 149900);
    assert.equal(checkout.body.data.currency, 'INR');
    assert.equal(checkout.body.data.keyId, 'rzp_test_isolated');
    assert.ok(checkout.body.data.gatewayOrderId.startsWith('order_'));
    assert.equal((await call(`/api/orders/${orderId}/checkout`, { method: 'POST', cookie: learner })).body.data.gatewayOrderId,
      checkout.body.data.gatewayOrderId);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM enrollments WHERE user_id=? AND course_id=?').get('usr_seed_learner_2', 'course-1').n, 0);
    t.diagnostic(`mock order ${orderId} created with server price`);
    paymentOrder = { orderId, gatewayOrderId: checkout.body.data.gatewayOrderId };
  });

  await t.test('bad signature and mismatched gateway payment never grant access', async () => {
    const { orderId, gatewayOrderId } = paymentOrder;
    const paymentId = `pay_${gatewayOrderId.slice(6)}`;
    assert.equal((await call(`/api/orders/${orderId}/verify`, { method: 'POST', cookie: learner,
      body: { paymentId, gatewayOrderId, signature: '0'.repeat(64) } })).status, 403);
    assert.equal((await call(`/api/orders/${orderId}/verify`, { method: 'POST', cookie: learner,
      body: { paymentId, gatewayOrderId: 'order_other', signature: '0'.repeat(64) } })).status, 409);
    for (const suffix of ['_wrong_amount', '_wrong_currency']) {
      const wrongId = `${paymentId}${suffix}`;
      const signature = createHmac('sha256', keySecret).update(`${gatewayOrderId}|${wrongId}`).digest('hex');
      assert.equal((await call(`/api/orders/${orderId}/verify`, { method: 'POST', cookie: learner,
        body: { paymentId: wrongId, gatewayOrderId, signature } })).status, 409);
    }
    assert.equal((await call(`/api/orders/${orderId}`, { cookie: learner })).body.data.status, 'pending');
  });

  await t.test('captured callback and duplicate webhook grant exactly one enrollment', async () => {
    const { orderId, gatewayOrderId } = paymentOrder;
    const paymentId = `pay_${gatewayOrderId.slice(6)}`;
    const signature = createHmac('sha256', keySecret).update(`${gatewayOrderId}|${paymentId}`).digest('hex');
    const callback = await call(`/api/orders/${orderId}/verify`, { method: 'POST', cookie: learner,
      body: { paymentId, gatewayOrderId, signature } });
    assert.equal(callback.status, 200, JSON.stringify(callback.body));
    assert.equal(callback.body.data.status, 'paid');
    assert.equal((await call(`/api/orders/${orderId}/verify`, { method: 'POST', cookie: learner,
      body: { paymentId, gatewayOrderId, signature } })).status, 200);
    const event = { event: 'payment.captured', payload: { payment: { entity: { id: paymentId, order_id: gatewayOrderId,
      amount: 149900, currency: 'INR', status: 'captured' } } } };
    const raw = JSON.stringify(event);
    const webhookSignature = createHmac('sha256', webhookSecret).update(raw).digest('hex');
    assert.equal((await fetch(`${base}/api/payments/razorpay/webhook`, { method: 'POST',
      headers: { 'x-razorpay-signature': '0'.repeat(64), 'x-razorpay-event-id': 'evt_invalid' }, body: raw })).status, 401);
    const webhook = () => fetch(`${base}/api/payments/razorpay/webhook`, { method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': webhookSignature, 'x-razorpay-event-id': 'evt_payment_capture_1' }, body: raw });
    assert.equal((await webhook()).status, 200);
    assert.equal((await webhook()).status, 200);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM enrollments WHERE user_id=? AND course_id=?').get('usr_seed_learner_2', 'course-1').n, 1);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM payments WHERE order_id=?').get(orderId).n, 1);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM payment_webhook_events WHERE event_id=?').get('evt_payment_capture_1').n, 1);
    assert.equal((await call('/api/admin/orders', { cookie: admin })).body.data.summary.paidCount >= 1, true);
    assert.equal((await call('/api/me/enrollments', { cookie: learner })).body.data.some(row => row.courseId === 'course-1'), true);
  });

  await t.test('failed webhook stays unpaid, reconciliation can recover lost callback', async () => {
    const quote = await call('/api/orders', { method: 'POST', cookie: other, body: { courseId: 'course-2' } });
    assert.equal(quote.status, 201);
    const orderId = quote.body.data.id;
    const checkout = await call(`/api/orders/${orderId}/checkout`, { method: 'POST', cookie: other });
    assert.equal(checkout.status, 200);
    const gatewayOrderId = checkout.body.data.gatewayOrderId;
    const failed = { event: 'payment.failed', payload: { payment: { entity: { id: 'pay_failed_qa', order_id: gatewayOrderId,
      amount: quote.body.data.totalMinor, currency: 'INR', status: 'failed' } } } };
    const raw = JSON.stringify(failed);
    const signature = createHmac('sha256', webhookSecret).update(raw).digest('hex');
    assert.equal((await fetch(`${base}/api/payments/razorpay/webhook`, { method: 'POST', headers: {
      'x-razorpay-signature': signature, 'x-razorpay-event-id': 'evt_failure_1' }, body: raw })).status, 200);
    assert.equal((await call(`/api/orders/${orderId}`, { cookie: other })).body.data.status, 'pending');
    assert.equal(db.prepare('SELECT COUNT(*) n FROM enrollments WHERE user_id=? AND course_id=?').get('usr_001', 'course-2').n, 0);
    const reconciled = await call(`/api/orders/${orderId}/reconcile`, { method: 'POST', cookie: other });
    assert.equal(reconciled.status, 200, JSON.stringify(reconciled.body));
    assert.equal(reconciled.body.data.status, 'paid');
    assert.equal(db.prepare('SELECT COUNT(*) n FROM payments WHERE order_id=? AND status=?').get(orderId, 'succeeded').n, 1);
  });

  await t.test('webhook arriving before callback settles once and resists later replay', async () => {
    const quote = await call('/api/orders', { method: 'POST', cookie: other, body: { courseId: 'course-3' } });
    assert.equal(quote.status, 201, JSON.stringify(quote.body));
    const orderId = quote.body.data.id;
    const checkout = await call(`/api/orders/${orderId}/checkout`, { method: 'POST', cookie: other });
    assert.equal(checkout.status, 200);
    const gatewayOrderId = checkout.body.data.gatewayOrderId;
    const paymentId = `pay_${gatewayOrderId.slice(6)}`;
    const event = { event: 'payment.captured', payload: { payment: { entity: { id: paymentId,
      order_id: gatewayOrderId, amount: quote.body.data.totalMinor, currency: 'INR', status: 'captured' } } } };
    const raw = JSON.stringify(event);
    const webhookSignature = createHmac('sha256', webhookSecret).update(raw).digest('hex');
    assert.equal((await fetch(`${base}/api/payments/razorpay/webhook`, { method: 'POST',
      headers: { 'x-razorpay-signature': webhookSignature, 'x-razorpay-event-id': 'evt_webhook_first' }, body: raw })).status, 200);
    const signature = createHmac('sha256', keySecret).update(`${gatewayOrderId}|${paymentId}`).digest('hex');
    assert.equal((await call(`/api/orders/${orderId}/verify`, { method: 'POST', cookie: other,
      body: { paymentId, gatewayOrderId, signature } })).body.data.status, 'paid');
    assert.equal(db.prepare('SELECT COUNT(*) n FROM payments WHERE order_id=?').get(orderId).n, 1);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM enrollments WHERE user_id=? AND course_id=?').get('usr_001', 'course-3').n, 1);
  });

  await t.test('Personal Plan grants only selected courses after verified payment and expires access', async () => {
    const config = await call('/api/admin/personal-plan', { method: 'PUT', cookie: admin,
      body: { monthlyPriceMinor: 49900, annualPriceMinor: 499900, courseIds: ['course-2'] } });
    assert.equal(config.status, 200, JSON.stringify(config.body));
    const started = await call('/api/personal-plan/subscriptions', { method: 'POST', cookie: learner,
      body: { term: 'monthly' } });
    assert.equal(started.status, 200, JSON.stringify(started.body));
    const subscription = started.body.data;
    assert.ok(subscription.gatewaySubscriptionId.startsWith('sub_'));
    assert.equal((await call('/api/me/enrollments', { cookie: learner })).body.data.some(row => row.courseId === 'course-2'), false);
    const paymentId = 'pay_mock_plan_1';
    assert.equal((await call('/api/personal-plan/subscriptions/verify', { method: 'POST', cookie: learner,
      body: { subscriptionId: subscription.id, paymentId, signature: '0'.repeat(64) } })).status, 403);
    assert.equal((await call('/api/personal-plan/subscriptions/verify', { method: 'POST', cookie: other,
      body: { subscriptionId: subscription.id, paymentId, signature: '0'.repeat(64) } })).status, 404);
    const signature = createHmac('sha256', keySecret).update(`${paymentId}|${subscription.gatewaySubscriptionId}`).digest('hex');
    const verified = await call('/api/personal-plan/subscriptions/verify', { method: 'POST', cookie: learner,
      body: { subscriptionId: subscription.id, paymentId, signature } });
    assert.equal(verified.status, 200, JSON.stringify(verified.body));
    assert.equal(verified.body.data.status, 'active');
    assert.equal((await call('/api/me/enrollments', { cookie: learner })).body.data.some(row => row.courseId === 'course-2'), true);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM personal_plan_grants WHERE user_id=?').get('usr_seed_learner_2').n, 1);
    const event = { event: 'subscription.charged', payload: { subscription: { entity: { id: subscription.gatewaySubscriptionId } } } };
    const raw = JSON.stringify(event);
    const webhookSignature = createHmac('sha256', webhookSecret).update(raw).digest('hex');
    const webhook = () => fetch(`${base}/api/payments/razorpay/webhook`, { method: 'POST',
      headers: { 'x-razorpay-signature': webhookSignature, 'x-razorpay-event-id': 'evt_plan_paid_1' }, body: raw });
    assert.equal((await webhook()).status, 200);
    assert.equal((await webhook()).status, 200);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM personal_plan_webhook_events WHERE event_id=?').get('evt_plan_paid_1').n, 1);
    const cancelled = await call('/api/personal-plan/subscriptions/cancel', { method: 'POST', cookie: learner });
    assert.equal(cancelled.status, 200, JSON.stringify(cancelled.body));
    assert.equal(cancelled.body.data.cancelAtCycleEnd, true);
    assert.equal((await call('/api/me/enrollments', { cookie: learner })).body.data.some(row => row.courseId === 'course-2'), true);
    assert.equal((await call('/api/personal-plan/subscriptions', { method: 'POST', cookie: learner,
      body: { term: 'annual' } })).status, 409);
    db.prepare('UPDATE personal_plan_subscriptions SET current_end=? WHERE id=?')
      .run(Math.floor(Date.now() / 1000) - 1, subscription.id);
    assert.equal((await call('/api/me/enrollments', { cookie: learner })).body.data.some(row => row.courseId === 'course-2'), false);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM personal_plan_grants WHERE user_id=?').get('usr_seed_learner_2').n, 0);
    const pending = await call('/api/personal-plan/subscriptions', { method: 'POST', cookie: other,
      body: { term: 'annual' } });
    assert.equal(pending.status, 200, JSON.stringify(pending.body));
    const pendingCancelled = await call('/api/personal-plan/subscriptions/cancel', { method: 'POST', cookie: other });
    assert.equal(pendingCancelled.status, 200, JSON.stringify(pendingCancelled.body));
    assert.equal(pendingCancelled.body.data.cancelAtCycleEnd, false);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM personal_plan_grants WHERE user_id=?').get('usr_001').n, 0);
  });
});
