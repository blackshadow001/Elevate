import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { sendDueReminders } from '../../scripts/send-plan-renewal-reminders.mjs';

test('Personal Plan renewal email is queued within three days, sent once per cycle, and skipped after cancellation', async () => {
  const db = new DatabaseSync(':memory:');
  const previousUrl = process.env.SITE_URL;
  process.env.SITE_URL = 'https://elevate.example.invalid';
  try {
    db.exec(`CREATE TABLE users(id TEXT PRIMARY KEY,email TEXT,name TEXT,status TEXT);
      CREATE TABLE personal_plan_subscriptions(id TEXT PRIMARY KEY,user_id TEXT,term TEXT,price_minor INTEGER,
        next_charge_at INTEGER,status TEXT,paid_count INTEGER,cancel_at_cycle_end INTEGER);
      CREATE TABLE personal_plan_reminders(subscription_id TEXT,cycle_end INTEGER,status TEXT DEFAULT 'pending',
        provider_message_id TEXT,last_attempt_at TEXT,PRIMARY KEY(subscription_id,cycle_end));`);
    const now = 1_800_000_000;
    db.prepare("INSERT INTO users VALUES ('learner','learner@example.invalid','Test Learner','active')").run();
    db.prepare("INSERT INTO personal_plan_subscriptions VALUES ('sub1','learner','monthly',49900,?,'active',1,0)")
      .run(now + 4 * 86400);
    const sent = [];
    const send = async (message) => { sent.push(message); return { id: `mail_${sent.length}` }; };
    assert.deepEqual(await sendDueReminders({ db, now, send }), { due: 0, sent: 0 });
    db.prepare('UPDATE personal_plan_subscriptions SET next_charge_at=?').run(now + 3 * 86400);
    assert.deepEqual(await sendDueReminders({ db, now, send }), { due: 1, sent: 1 });
    assert.match(sent[0].text, /₹499/);
    assert.match(sent[0].text, /personal-plan\/account/);
    assert.deepEqual(await sendDueReminders({ db, now, send }), { due: 1, sent: 0 });
    db.prepare('UPDATE personal_plan_subscriptions SET next_charge_at=?').run(now + 30 * 86400);
    db.prepare('UPDATE personal_plan_subscriptions SET next_charge_at=?').run(now + 2 * 86400);
    db.prepare('UPDATE personal_plan_subscriptions SET cancel_at_cycle_end=1').run();
    assert.deepEqual(await sendDueReminders({ db, now, send }), { due: 0, sent: 0 });
    assert.equal(sent.length, 1);
  } finally {
    db.close();
    if (previousUrl === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = previousUrl;
  }
});
