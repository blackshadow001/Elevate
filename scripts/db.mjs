import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { guidedCurriculum } from '../src/data/guidedCurriculum.mjs';
import { comprehensiveCurriculum } from '../src/data/comprehensiveCurriculum.mjs';

const deployment = process.env.NODE_ENV === 'production' || Boolean(process.env.RENDER);
const raw = process.env.DATABASE_URL || (deployment ? '' : 'file:./data/learnly.sqlite');
if (!raw.startsWith('file:') || !raw.slice(5))
  throw new Error('Set DATABASE_URL=file:<absolute durable SQLite path> before starting production.');
if (deployment && !isAbsolute(raw.slice(5)))
  throw new Error('Production DATABASE_URL must use an absolute path on persistent storage.');
if (deployment && process.env.MEDIA_STORAGE_DIR && !isAbsolute(process.env.MEDIA_STORAGE_DIR))
  throw new Error('Production MEDIA_STORAGE_DIR must use an absolute path on persistent storage.');
const dbPath = resolve(process.cwd(), raw.slice(5));
mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (strftime(\'%Y-%m-%dT%H:%M:%fZ\',\'now\')));');

for (const name of readdirSync(resolve('src/db/migrations')).filter((file) => file.endsWith('.sql')).sort()) {
  if (db.prepare('SELECT 1 FROM schema_migrations WHERE name=?').get(name)) continue;
  const sql = readFileSync(resolve('src/db/migrations', name), 'utf8');
  db.exec('BEGIN IMMEDIATE');
  try {
    db.exec(sql);
    db.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(name);
    db.exec('COMMIT');
    console.log(`Applied ${name}`);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
// Seed versioned, published guided lessons without overwriting learner progress or tutor work.
db.exec('BEGIN IMMEDIATE');
try {
  const addPath = db.prepare(`INSERT OR IGNORE INTO guided_paths(id,slug,title,summary,status)
    VALUES(?,?,?,?,'archived')`);
  const addStep = db.prepare(`INSERT OR IGNORE INTO guided_steps
    (id,path_id,position,kind,title,body,starter_code,answer_json,chapter_title)
    VALUES(?,?,?,?,?,?,?,?,?)`);
  for (const path of guidedCurriculum) {
    addPath.run(path.id, `${path.slug}-intro-2026`, `${path.title} · Intro archive`, path.summary);
    let position = 0;
    for (const chapter of path.chapters) {
      for (const [title, body, answer] of chapter.steps) {
        position += 1;
        const kind = Array.isArray(answer) ? 'project' : typeof answer === 'string' ? 'fill_blank' : 'reading';
        const rules = Array.isArray(answer) ? { requiredTerms: answer } : typeof answer === 'string' ? { expected: answer } : {};
        addStep.run(`${path.id}-${String(position).padStart(2, '0')}`, path.id, position, kind,
          title, body, '', JSON.stringify(rules), chapter.title);
      }
    }
  }
  const addProgram = db.prepare(`INSERT OR IGNORE INTO guided_paths
    (id,slug,title,summary,status,project_title,project_brief,project_requirements_json,exam_json)
    VALUES(?,?,?,?,'published',?,?,?,?)`);
  const addProgramStep = db.prepare(`INSERT OR IGNORE INTO guided_steps
    (id,path_id,position,kind,title,body,starter_code,answer_json,chapter_title,module_title,block_type)
    VALUES(?,?,?,?,?,?,?,?,?,?,?)`);
  const shortTitle = (description) => description.split(/\.\s/)[0].slice(0, 72).replace(/[.,;:]+$/, '');
  for (const path of comprehensiveCurriculum) {
    const exam = path.modules.flatMap((module) => module.checks.map(([question, answer]) => ({ question, answer })));
    addProgram.run(path.id, path.slug, path.title, path.summary, path.project.title,
      path.project.brief, JSON.stringify(path.project.requirements), JSON.stringify(exam));
    let position = 0;
    const add = (unit, kind, block, title, body, rules = {}) => {
      position += 1;
      addProgramStep.run(`${path.id}-${String(position).padStart(3, '0')}`, path.id, position,
        kind, title, body, '', JSON.stringify(rules), unit.chapter, unit.title, block);
    };
    for (const unit of path.modules) {
      add(unit, 'reading', 'lecture', unit.title, unit.theory);
      add(unit, 'reading', 'lecture', `Worked example: ${unit.title}`.slice(0, 110), unit.example);
      add(unit, 'reading', 'workshop', shortTitle(unit.workshop), `${unit.workshop}\n\nComplete the activity in your editor or analysis notes before continuing.`);
      add(unit, 'project', 'lab', shortTitle(unit.lab), `${unit.lab}\n\nDescribe what you built or tested in at least 120 characters. This is a practice reflection, not a code test. The final certification project receives human review.`,
        { minChars: 120 });
      add(unit, 'reading', 'review', `Review: ${unit.title}`.slice(0, 110), unit.review);
      unit.checks.forEach(([question, answer]) =>
        add(unit, 'fill_blank', 'quiz', question.slice(0, 100), question, { expected: answer }));
    }
  }
  db.exec('COMMIT');
} catch (error) {
  db.exec('ROLLBACK');
  throw error;
}
console.log(`Database ready: ${dbPath}`);
db.close();
