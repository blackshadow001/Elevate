import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { guidedCurriculum } from '../src/data/guidedCurriculum.mjs';
import { comprehensiveCurriculum } from '../src/data/comprehensiveCurriculum.mjs';
import { instructionPrograms } from '../src/data/instructionPrograms.mjs';
import { beginnerIntroductions } from '../src/data/beginnerIntroductions.mjs';
import { guidedQuizChoices } from '../src/data/guidedQuizChoices.mjs';

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
    (id,path_id,position,kind,title,body,starter_code,answer_json,chapter_title,module_title,block_type,practice_json)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`);
  const addExistingPractice = db.prepare(`UPDATE guided_steps SET practice_json=?
    WHERE id=? AND path_id=? AND practice_json='{}'`);
  const updateOldTitle = db.prepare('UPDATE guided_steps SET title=? WHERE id=? AND path_id=? AND title=?');
  const addBeginnerStep = db.prepare(`INSERT OR IGNORE INTO guided_steps
    (id,path_id,position,kind,title,body,starter_code,answer_json,chapter_title,module_title,block_type,practice_json)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`);
  const retainLegacyProgress = db.prepare(`INSERT OR IGNORE INTO guided_step_progress(user_id,step_id,response,passed)
    SELECT DISTINCT progress.user_id,?,'Completed before beginner chapter was added',1
    FROM guided_step_progress progress JOIN guided_steps original ON original.id=progress.step_id
    WHERE original.path_id=? AND original.position>0 AND progress.passed=1`);
  const oldShortTitle = (description) => description.split(/\.\s/)[0].slice(0, 72).replace(/[.,;:]+$/, '');
  for (const path of comprehensiveCurriculum) {
    const programs = instructionPrograms[path.slug];
    if (!programs || programs.length !== path.modules.length)
      throw new Error(`Missing practice programs for ${path.slug}`);
    const firstSteps = beginnerIntroductions[path.slug];
    if (!firstSteps || firstSteps.length !== 4)
      throw new Error(`Missing beginner introduction for ${path.slug}`);
    const quizSets = guidedQuizChoices[path.slug];
    if (!quizSets || quizSets.length !== path.modules.length)
      throw new Error(`Missing knowledge checks for ${path.slug}`);
    const exam = path.modules.flatMap((module) => module.checks.map(([question, answer]) => ({ question, answer })));
    addProgram.run(path.id, path.slug, path.title, path.summary, path.project.title,
      path.project.brief, JSON.stringify(path.project.requirements), JSON.stringify(exam));
    let position = 0;
    const add = (unit, kind, block, title, body, rules = {}, practice = null, previousTitle = null) => {
      position += 1;
      const stepId = `${path.id}-${String(position).padStart(3, '0')}`;
      const practiceJson = JSON.stringify(practice || {});
      addProgramStep.run(stepId, path.id, position,
        kind, title, body, '', JSON.stringify(rules), unit.chapter, unit.title, block, practiceJson);
      if (practice) addExistingPractice.run(practiceJson, stepId, path.id);
      if (previousTitle) updateOldTitle.run(title, stepId, path.id, previousTitle);
    };
    for (const [moduleIndex, unit] of path.modules.entries()) {
      const practice = programs[moduleIndex];
      add(unit, 'reading', 'lecture', unit.title, unit.theory);
      add(unit, 'reading', 'lecture', `Worked example: ${unit.title}`.slice(0, 110), unit.example);
      add(unit, 'reading', 'workshop', `Practice: ${unit.title}`, `${unit.workshop}\n\nFollow the program below before continuing.`, {}, practice, oldShortTitle(unit.workshop));
      add(unit, 'project', 'lab', `Try it yourself: ${unit.title}`, `${unit.lab}\n\nDescribe what you built or tested in at least 120 characters. This is a practice reflection, not a code test. The final certification project receives human review.`,
        { minChars: 120 }, { tools: practice.tools, challenge: practice.challenge, expect: practice.expect }, oldShortTitle(unit.lab));
      add(unit, 'reading', 'review', `Review: ${unit.title}`.slice(0, 110), unit.review);
      unit.checks.forEach(([question, answer], checkIndex) => {
        const choices = quizSets[moduleIndex].choices[checkIndex];
        if (!choices || choices.length < 2 || new Set(choices).size !== choices.length || !choices.includes(answer))
          throw new Error(`Invalid choices for ${path.slug} module ${moduleIndex + 1} check ${checkIndex + 1}`);
        add(unit, 'fill_blank', 'quiz', question.slice(0, 100), question,
          { expected: answer }, { choices, explanation: quizSets[moduleIndex].explanation });
      });
    }
    for (const [index, intro] of firstSteps.entries()) {
      const stepId = `${path.id}-start-${String(index + 1).padStart(2, '0')}`;
      addBeginnerStep.run(stepId, path.id, index - firstSteps.length, intro.kind,
        intro.title, intro.body, '', JSON.stringify(intro.expected ? { expected: intro.expected } : {}),
        'Start here · First steps', 'Your first small wins', intro.block, JSON.stringify(intro.practice || {}));
      // Learners already working through the original course keep their unlocked place.
      retainLegacyProgress.run(stepId, path.id);
    }
  }
  db.exec('COMMIT');
} catch (error) {
  db.exec('ROLLBACK');
  throw error;
}
console.log(`Database ready: ${dbPath}`);
db.close();
