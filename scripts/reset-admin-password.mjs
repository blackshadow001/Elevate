import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { resolve } from 'node:path';

const url = process.env.DATABASE_URL;
const email = process.env.ADMIN_RESET_EMAIL?.trim().toLowerCase();
if (!url?.startsWith('file:') || !url.slice(5) || !email) {
  throw new Error('Set DATABASE_URL and ADMIN_RESET_EMAIL explicitly before resetting an admin password.');
}

const db = new DatabaseSync(resolve(process.cwd(), url.slice(5)));
db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
try {
  db.exec('BEGIN IMMEDIATE');
  let temporaryPassword;
  try {
    const admin = db.prepare("SELECT id FROM users WHERE email=? AND role='admin' AND is_super_admin=1 AND status='active'").get(email);
    if (!admin) throw new Error('Active super admin account not found; no password was changed.');
    temporaryPassword = randomBytes(24).toString('base64url');
    const salt = randomBytes(16).toString('hex');
    const hash = `scrypt:${salt}:${scryptSync(temporaryPassword, salt, 64).toString('hex')}`;
    const now = new Date().toISOString();
    db.prepare('UPDATE users SET password_hash=?,updated_at=? WHERE id=?').run(hash, now, admin.id);
    db.prepare('UPDATE sessions SET revoked_at=? WHERE user_id=? AND revoked_at IS NULL').run(now, admin.id);
    const stored = db.prepare('SELECT password_hash FROM users WHERE id=?').get(admin.id).password_hash;
    const actual = scryptSync(temporaryPassword, salt, 64);
    if (!timingSafeEqual(actual, Buffer.from(stored.split(':')[2], 'hex'))) throw new Error('Password verification failed.');
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); throw error; }
  console.log(`Super admin password reset for ${email}. Existing sessions revoked.`);
  console.log(`Temporary password: ${temporaryPassword}`);
} finally { db.close(); }
