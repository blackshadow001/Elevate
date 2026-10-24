import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, scryptSync } from 'node:crypto';
import { resolve } from 'node:path';

const url = process.env.DATABASE_URL;
const name = process.env.ADMIN_BOOTSTRAP_NAME?.trim();
const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
if (!url?.startsWith('file:') || !name || !email || !password ||
  name.length < 2 || name.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
  throw new Error('Set DATABASE_URL, ADMIN_BOOTSTRAP_NAME, ADMIN_BOOTSTRAP_EMAIL and a unique ADMIN_BOOTSTRAP_PASSWORD of at least 8 characters.');
}
const db = new DatabaseSync(resolve(process.cwd(), url.slice(5)));
db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
try {
  if (!db.prepare("SELECT 1 FROM schema_migrations WHERE name='010_admin_course_review.sql'").get())
    throw new Error('Run npm run db:migrate before bootstrapping an admin.');
  db.exec('BEGIN IMMEDIATE');
  try {
    if (db.prepare('SELECT 1 FROM users WHERE is_super_admin=1').get())
      throw new Error('A super admin already exists. Use the authenticated admin user-management API.');
    if (db.prepare('SELECT 1 FROM users WHERE email=?').get(email))
      throw new Error('This email already belongs to an account. Do not overwrite it during bootstrap.');
    const salt = randomBytes(16).toString('hex');
    const hash = `scrypt:${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
    db.prepare('INSERT INTO users(id,name,email,password_hash,role,is_super_admin) VALUES (?,?,?,?,?,1)')
      .run(randomUUID(), name, email, hash, 'admin');
    db.exec('COMMIT');
    console.log(`Initial super admin created: ${email}`);
  } catch (error) { db.exec('ROLLBACK'); throw error; }
} finally { db.close(); }
