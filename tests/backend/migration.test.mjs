import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, rmSync } from 'node:fs';
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

test('guided curriculum seeds six assessed programs and retains introductory progress paths', () => {
  const root = resolve(import.meta.dirname, '../..');
  const path = resolve(root, 'data', `guided-curriculum-${randomBytes(6).toString('hex')}.sqlite`);
  const env = { ...process.env, DATABASE_URL: `file:${path}` };
  try {
    for (let run = 0; run < 2; run++) {
      const result = spawnSync(process.execPath, ['scripts/db.mjs'], { cwd: root, env, encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
    }
    const db = new DatabaseSync(path);
    try {
      const paths = db.prepare(`SELECT p.slug,p.status,COUNT(s.id) steps,COUNT(DISTINCT s.chapter_title) chapters
        FROM guided_paths p LEFT JOIN guided_steps s ON s.path_id=p.id GROUP BY p.id ORDER BY p.slug`).all();
      assert.equal(paths.filter((item) => item.status === 'published').length, 6);
      assert.ok(paths.filter((item) => item.status === 'published').every((item) => item.steps === 42 && item.chapters === 3));
      assert.deepEqual({ ...paths.find((item) => item.slug === 'web-development-foundations') },
        { slug: 'web-development-foundations', status: 'archived', steps: 6, chapters: 2 });
      assert.equal(db.prepare("SELECT COUNT(*) n FROM guided_steps WHERE path_id LIKE 'curriculum-%-v1'").get().n, 96);
      assert.equal(db.prepare("SELECT COUNT(*) n FROM guided_steps WHERE path_id LIKE '%-v2'").get().n, 252);
      assert.equal(db.prepare("SELECT COUNT(*) n FROM guided_paths WHERE status='archived' AND slug LIKE '%-intro-2026'").get().n, 6);
      assert.equal(db.prepare("SELECT COUNT(*) n FROM guided_paths WHERE status='published' AND length(project_title)>0 AND json_array_length(exam_json)=12").get().n, 6);
      assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), []);
    } finally { db.close(); }
  } finally {
    for (const suffix of ['', '-wal', '-shm']) rmSync(`${path}${suffix}`, { force: true });
  }
});

test('upgrading a started introductory path preserves progress and its completion record', () => {
  const root = resolve(import.meta.dirname, '../..');
  const path = resolve(root, 'data', `guided-upgrade-${randomBytes(6).toString('hex')}.sqlite`);
  const db = new DatabaseSync(path);
  try {
    db.exec("PRAGMA foreign_keys=ON; CREATE TABLE schema_migrations(name TEXT PRIMARY KEY);");
    for (const file of readdirSync(resolve(root, 'src/db/migrations')).filter((name) => name.endsWith('.sql') && name < '027_').sort()) {
      db.exec(readFileSync(resolve(root, 'src/db/migrations', file), 'utf8'));
      db.prepare('INSERT INTO schema_migrations(name) VALUES (?)').run(file);
    }
    db.prepare("INSERT INTO users(id,name,email,password_hash,role) VALUES(?,?,?,?,?)")
      .run('started-learner', 'Started Learner', 'started@example.invalid', 'test-hash', 'learner');
    db.prepare("INSERT INTO guided_paths(id,slug,title,summary,status) VALUES(?,?,?,?,?)")
      .run('curriculum-python-v1', 'python-basics', 'Python Basics', 'Introductory path', 'published');
    db.prepare("INSERT INTO guided_steps(id,path_id,position,kind,title,body,chapter_title) VALUES(?,?,?,?,?,?,?)")
      .run('python-v1-first', 'curriculum-python-v1', 1, 'reading', 'Read Python', 'An introductory Python lesson.', 'Chapter 1');
    db.prepare("INSERT INTO guided_step_progress(user_id,step_id,response,passed) VALUES(?,?,?,1)")
      .run('started-learner', 'python-v1-first', 'read');
    db.prepare("INSERT INTO guided_path_completions(id,user_id,path_id) VALUES(?,?,?)")
      .run('legacy-completion', 'started-learner', 'curriculum-python-v1');
  } finally { db.close(); }
  try {
    const result = spawnSync(process.execPath, ['scripts/db.mjs'], {
      cwd: root, env: { ...process.env, DATABASE_URL: `file:${path}` }, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const upgraded = new DatabaseSync(path);
    try {
      assert.deepEqual({ ...upgraded.prepare("SELECT slug,status FROM guided_paths WHERE id='curriculum-python-v1'").get() },
        { slug: 'python-basics-intro-2026', status: 'archived' });
      assert.equal(upgraded.prepare("SELECT passed FROM guided_step_progress WHERE user_id='started-learner' AND step_id='python-v1-first'").get().passed, 1);
      assert.equal(upgraded.prepare("SELECT id FROM guided_path_completions WHERE id='legacy-completion'").get().id, 'legacy-completion');
      assert.equal(upgraded.prepare("SELECT id FROM guided_paths WHERE slug='python-basics'").get().id, 'curriculum-python-v2');
      assert.deepEqual(upgraded.prepare('PRAGMA foreign_key_check').all(), []);
    } finally { upgraded.close(); }
  } finally { for (const suffix of ['', '-wal', '-shm']) rmSync(`${path}${suffix}`, { force: true }); }
});
