import { DatabaseSync } from 'node:sqlite';
import { pathToFileURL } from 'node:url';

const THREE_DAYS = 3 * 24 * 60 * 60;

export async function sendDueReminders({ db, now = Math.floor(Date.now() / 1000), send }) {
  const due = db.prepare(`SELECT s.id,s.term,s.price_minor,s.next_charge_at,u.email,u.name
    FROM personal_plan_subscriptions s JOIN users u ON u.id=s.user_id
    WHERE s.status='active' AND s.paid_count>0 AND s.cancel_at_cycle_end=0
    AND s.next_charge_at>? AND s.next_charge_at<=? AND u.status='active'
    ORDER BY s.next_charge_at LIMIT 100`).all(now, now + THREE_DAYS);
  let sent = 0;
  for (const row of due) {
    const id = String(row.id);
    const cycle = Number(row.next_charge_at);
    db.prepare(`INSERT OR IGNORE INTO personal_plan_reminders(subscription_id,cycle_end)
      VALUES (?,?)`).run(id, cycle);
    const reminder = db.prepare(`SELECT status FROM personal_plan_reminders
      WHERE subscription_id=? AND cycle_end=?`).get(id, cycle);
    if (reminder?.status === 'sent') continue;
    const date = new Date(cycle * 1000).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric',
    });
    const amount = `₹${(Number(row.price_minor) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    const firstName = String(row.name).trim().split(/\s+/)[0] || 'Learner';
    const accountUrl = `${process.env.SITE_URL}/personal-plan/account`;
    const text = `Hi ${firstName},\n\nYour Elevate Personal Plan is scheduled to renew on ${date} for ${amount} (${row.term}). Review your plan or cancel renewal before that date: ${accountUrl}\n\nIf you have already cancelled, you can ignore this reminder.\n\nElevate`;
    db.prepare(`UPDATE personal_plan_reminders SET last_attempt_at=?
      WHERE subscription_id=? AND cycle_end=?`).run(new Date().toISOString(), id, cycle);
    const result = await send({ to: String(row.email), subject: 'Your Elevate Personal Plan renewal is in 3 days',
      text, idempotencyKey: `personal-plan-renewal/${id}/${cycle}` });
    db.prepare(`UPDATE personal_plan_reminders SET status='sent',provider_message_id=?
      WHERE subscription_id=? AND cycle_end=?`).run(result.id, id, cycle);
    sent++;
  }
  return { due: due.length, sent };
}

async function sendWithResend(message) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json',
      'Idempotency-Key': message.idempotencyKey },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [message.to], subject: message.subject, text: message.text }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Email provider returned HTTP ${response.status}`);
  const body = await response.json();
  if (typeof body.id !== 'string' || !body.id) throw new Error('Email provider did not confirm delivery acceptance');
  return { id: body.id };
}

async function main() {
  if (process.env.PERSONAL_PLAN_ENABLED !== '1' || process.env.EMAIL_PROVIDER !== 'resend' ||
    !process.env.RESEND_API_KEY || !process.env.EMAIL_FROM ||
    !process.env.SITE_URL?.startsWith('https://')) return;
  const url = process.env.DATABASE_URL;
  if (!url?.startsWith('file:')) throw new Error('DATABASE_URL must point to the migrated SQLite database.');
  const db = new DatabaseSync(url.slice(5));
  try {
    db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
    const result = await sendDueReminders({ db, send: sendWithResend });
    if (result.sent) console.log(`Sent ${result.sent} Personal Plan renewal reminders.`);
  } finally { db.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => { console.error('Personal Plan renewal reminders failed:', error instanceof Error ? error.message : 'unknown error'); process.exitCode = 1; });
}
