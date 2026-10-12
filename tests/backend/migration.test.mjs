import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

test('admin review migration preserves legacy users and published course prices', () => {
  const root = resolve(import.meta.dirname, '../..');
  const path = resolve(root, 'data', `admin-migration-${randomBytes(6).toString('hex')}.sqlite`);
  const db = new DatabaseSync(path);
  try {
    db.exec('PRAGMA foreign_keys=ON; CREATE TABLE schema_migrations(name TEXT PRIMARY KEY);');
    for (let i = 1; i <= 9; i++) {
      const name = `00${i}_${[
        'initial', 'live_participant_uniqueness', 'starter_course_content', 'event_pricing',
        'bootcamp_schedule_consistency', 'seed_live_date_correction', 'bootcamp_session_details',
        'fixture_bootcamp_session_details', 'live_reminders',
      ][i - 1]}.sql`;
      db.exec(readFileSync(resolve(root, 'src/db/migrations', name), 'utf8'));
      db.prepare('INSERT INTO schema_migrations(name) VALUES (?)').run(name);
    }
    db.prepare("INSERT INTO users(id,name,email,password_hash,role) VALUES (?,?,?,?,?)")
      .run('legacy-admin', 'Legacy Admin', 'legacy-admin@example.invalid', 'test-hash', 'admin');
    db.prepare("INSERT INTO users(id,name,email,password_hash,role) VALUES (?,?,?,?,?)")
      .run('legacy-tutor', 'Legacy Tutor', 'legacy-tutor@example.invalid', 'test-hash', 'instructor');
    db.prepare("INSERT INTO courses(id,title,slug,instructor_id,price_minor,status) VALUES (?,?,?,?,?,?)")
      .run('legacy-course', 'Legacy Course', 'legacy-course', 'legacy-tutor', 149900, 'published');
    db.exec(readFileSync(resolve(root, 'src/db/migrations/010_admin_course_review.sql'), 'utf8'));
    assert.equal(db.prepare("SELECT is_super_admin FROM users WHERE id='legacy-admin'").get().is_super_admin, 1);
    assert.equal(db.prepare("SELECT review_status,price_minor FROM courses WHERE id='legacy-course'").get().review_status, 'approved');
    assert.deepEqual({ ...db.prepare("SELECT base_price_minor,approved_margin_bps,pricing_status FROM course_pricing WHERE course_id='legacy-course'").get() },
      { base_price_minor: 149900, approved_margin_bps: 0, pricing_status: 'approved' });
    assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), []);
  } finally {
    db.close();
    for (const suffix of ['', '-wal', '-shm']) rmSync(`${path}${suffix}`, { force: true });
  }
});

test('operator bootstrap creates one super admin without public registration', () => {
  const root = resolve(import.meta.dirname, '../..');
  const name = `admin-bootstrap-${randomBytes(6).toString('hex')}.sqlite`;
  const path = resolve(root, 'data', name);
  const db = new DatabaseSync(path);
  try {
    db.exec('PRAGMA foreign_keys=ON; CREATE TABLE schema_migrations(name TEXT PRIMARY KEY);');
    const files = [
      '001_initial.sql', '002_live_participant_uniqueness.sql', '003_starter_course_content.sql',
      '004_event_pricing.sql', '005_bootcamp_schedule_consistency.sql', '006_seed_live_date_correction.sql',
      '007_bootcamp_session_details.sql', '008_fixture_bootcamp_session_details.sql',
      '009_live_reminders.sql', '010_admin_course_review.sql',
    ];
    for (const file of files) {
      db.exec(readFileSync(resolve(root, 'src/db/migrations', file), 'utf8'));
      db.prepare('INSERT INTO schema_migrations(name) VALUES (?)').run(file);
    }
    const env = { ...process.env, DATABASE_URL: `file:./data/${name}`,
      ADMIN_BOOTSTRAP_NAME: 'Initial Admin', ADMIN_BOOTSTRAP_EMAIL: 'initial-admin@example.invalid',
      ADMIN_BOOTSTRAP_PASSWORD: `QA-${randomBytes(24).toString('hex')}!` };
    const first = spawnSync(process.execPath, ['scripts/bootstrap-admin.mjs'], { cwd: root, env, encoding: 'utf8' });
    assert.equal(first.status, 0, first.stderr);
    assert.equal(db.prepare("SELECT role,is_super_admin FROM users WHERE email='initial-admin@example.invalid'").get().is_super_admin, 1);
    const second = spawnSync(process.execPath, ['scripts/bootstrap-admin.mjs'], { cwd: root, env, encoding: 'utf8' });
    assert.notEqual(second.status, 0);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM users').get().n, 1);
  } finally {
    db.close();
    for (const suffix of ['', '-wal', '-shm']) rmSync(`${path}${suffix}`, { force: true });
  }
});

test('Google identity migration preserves accounts and enforces unique links', () => {
  const root = resolve(import.meta.dirname, '../..');
  const path = resolve(root, 'data', `google-migration-${randomBytes(6).toString('hex')}.sqlite`);
  const db = new DatabaseSync(path);
  try {
    db.exec('PRAGMA foreign_keys=ON;');
    db.exec(readFileSync(resolve(root, 'src/db/migrations/001_initial.sql'), 'utf8'));
    db.prepare('INSERT INTO users(id,name,email,password_hash,role) VALUES (?,?,?,?,?)')
      .run('learner-a', 'Learner A', 'a@example.invalid', 'existing-hash', 'learner');
    db.prepare('INSERT INTO users(id,name,email,password_hash,role) VALUES (?,?,?,?,?)')
      .run('tutor-b', 'Tutor B', 'b@example.invalid', 'existing-hash', 'instructor');
    db.exec(readFileSync(resolve(root, 'src/db/migrations/012_google_identities.sql'), 'utf8'));
    db.prepare("INSERT INTO auth_identities(provider,subject,user_id,email_at_link) VALUES('google',?,?,?)")
      .run('google-sub-a', 'learner-a', 'a@example.invalid');
    assert.throws(() => db.prepare("INSERT INTO auth_identities(provider,subject,user_id,email_at_link) VALUES('google',?,?,?)")
      .run('google-sub-a', 'tutor-b', 'b@example.invalid'), /UNIQUE/);
    assert.throws(() => db.prepare("INSERT INTO auth_identities(provider,subject,user_id,email_at_link) VALUES('google',?,?,?)")
      .run('google-sub-other', 'learner-a', 'a@example.invalid'), /UNIQUE/);
    assert.equal(db.prepare("SELECT role FROM users WHERE id='tutor-b'").get().role, 'instructor');
    assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), []);
  } finally {
    db.close();
    for (const suffix of ['', '-wal', '-shm']) rmSync(`${path}${suffix}`, { force: true });
  }
});
