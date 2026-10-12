import { DatabaseSync } from 'node:sqlite';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomBytes, scryptSync } from 'node:crypto';
import ts from 'typescript';

if (process.env.NODE_ENV === 'production') throw new Error('Development seed is disabled in production.');
const password = process.env.DEV_SEED_PASSWORD;
if (!password || password.length < 12 || password === 'replace-with-a-unique-local-password') {
  throw new Error('Set a unique DEV_SEED_PASSWORD of at least 12 characters before seeding.');
}
const raw = process.env.DATABASE_URL || 'file:./data/learnly.sqlite';
if (!raw.startsWith('file:')) throw new Error('Phase 1 seed supports SQLite file URLs only.');
const db = new DatabaseSync(resolve(process.cwd(), raw.slice(5)));
db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
if (!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='schema_migrations'").get()) {
  throw new Error('Run npm run db:migrate before seeding.');
}

// The loader is confined to development fixtures. Runtime server code never imports mock modules.
const require = createRequire(import.meta.url);
require.extensions['.ts'] = (module, filename) => {
  const source = readFileSync(filename, 'utf8');
  const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  module._compile(result.outputText, filename);
};
const { mockUsers } = require('../src/data/users.ts');
const { mockInstructors } = require('../src/data/instructors.ts');
const { mockCourses } = require('../src/data/courses.ts');
const { mockLiveClasses } = require('../src/data/liveClasses.ts');
const { mockBootcamps } = require('../src/data/bootcamps.ts');
const { mockEvents } = require('../src/data/events.ts');

function hashPassword(value) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt:${salt}:${scryptSync(value, salt, 64).toString('hex')}`;
}
function slug(value) { return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function seconds(value) {
  const hours = Number(/(\d+)\s*h/.exec(value)?.[1] || 0);
  const minutes = Number(/(\d+)\s*m/.exec(value)?.[1] || 0);
  return hours * 3600 + minutes * 60;
}
function iso(value, time = '12:00 PM') {
  let dateText = value;
  if (value === 'Today' || value === 'Tomorrow') {
    const inIndia = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date());
    const day = new Date(`${inIndia}T00:00:00+05:30`);
    if (value === 'Tomorrow') day.setUTCDate(day.getUTCDate() + 1);
    dateText = day.toISOString().slice(0, 10);
  }
  const parsed = new Date(`${dateText.replace(/^[A-Za-z]+,\s*/, '')} ${time.replace(/\s*IST$/, '')} GMT+0530`);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

db.exec('BEGIN IMMEDIATE');
try {
  const userInsert = db.prepare('INSERT OR IGNORE INTO users (id,name,email,password_hash,role,avatar) VALUES (?,?,?,?,?,?)');
  const userByName = new Map();
  for (const user of mockUsers) {
    userInsert.run(user.id, user.name, user.email, hashPassword(password), user.role, user.avatar || null);
    userByName.set(user.name, user.id);
  }
  userInsert.run('usr_seed_learner_2', 'Samira Rao', 'samira@example.invalid', hashPassword(password), 'learner', null);
  for (const instructor of mockInstructors) {
    const id = userByName.get(instructor.name) || `usr_${instructor.id}`;
    userInsert.run(id, instructor.name, `${slug(instructor.name)}@instructors.example.invalid`, hashPassword(password), 'instructor', instructor.avatar || null);
    userByName.set(instructor.name, id);
  }
  for (const course of mockCourses) {
    const instructorId = userByName.get(course.instructor.name);
    if (!instructorId) throw new Error(`Missing instructor for ${course.slug}`);
    db.prepare(`INSERT OR IGNORE INTO courses
      (id,title,slug,subtitle,description,category,level,language,thumbnail,instructor_id,price_minor,currency,status,rating,duration_seconds,lesson_count,metadata_json,published_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      course.id, course.title, course.slug, course.subtitle, course.description, course.category,
      course.level, course.language, course.image, instructorId, Math.round(course.price * 100),
      'INR', 'published', course.rating, seconds(course.duration), course.sections.reduce((n, s) => n + s.lessons.length, 0),
      JSON.stringify({ whatYouWillLearn: course.whatYouWillLearn, requirements: course.requirements, originalPrice: course.originalPrice, ratingCount: course.ratingCount }),
      new Date().toISOString()
    );
    for (const [sectionPosition, section] of course.sections.entries()) {
      db.prepare('INSERT OR IGNORE INTO course_sections (id,course_id,title,position) VALUES (?,?,?,?)')
        .run(section.id, course.id, section.title, sectionPosition);
      for (const [lessonPosition, lesson] of section.lessons.entries()) {
        db.prepare(`INSERT OR IGNORE INTO lessons
          (id,section_id,title,description,position,type,video_storage_key,duration_seconds,is_preview,status)
          VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
          lesson.id, section.id, lesson.title, lesson.content || '', lessonPosition, lesson.type,
          null, seconds(lesson.duration), lessonPosition === 0 && sectionPosition === 0 ? 1 : 0, 'published'
        );
      }
    }
  }
  // A genuinely free development course exercises enrollment without simulating a payment.
  db.prepare(`INSERT OR IGNORE INTO courses
    (id,title,slug,subtitle,description,category,level,language,thumbnail,instructor_id,price_minor,currency,status,rating,duration_seconds,lesson_count,metadata_json,published_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    'course-free-foundations', 'Web Foundations: Free Starter', 'web-foundations-free-starter',
    'Start building accessible web pages with two focused lessons.',
    'Learn how the web delivers pages, then use semantic HTML to give your content a clear structure that works for people and assistive technology.',
    'Development', 'Beginner', 'English', mockCourses[0].image, userByName.get('John Doe'), 0,
    'INR', 'published', 0, 1200, 2,
    JSON.stringify({ whatYouWillLearn: ['Explain how a browser requests and displays a web page', 'Choose semantic HTML elements for common page sections'], requirements: ['A web browser and a text editor'] }),
    new Date().toISOString()
  );
  db.prepare('INSERT OR IGNORE INTO course_sections (id,course_id,title,position) VALUES (?,?,?,?)')
    .run('section-free-foundations', 'course-free-foundations', 'Getting Started', 0);
  for (const [position, title] of ['What the Web Is', 'Semantic HTML Essentials'].entries()) {
    db.prepare(`INSERT OR IGNORE INTO lessons
      (id,section_id,title,description,position,type,duration_seconds,is_preview,status)
      VALUES (?,?,?,?,?,?,?,?,?)`).run(`lesson-free-${position + 1}`, 'section-free-foundations', title,
      position === 0
        ? 'A browser asks a server for a page using an HTTP request. The server responds with HTML, which the browser turns into the document structure you see on screen. CSS controls its presentation, and JavaScript can update it in response to interaction. Try opening your browser’s developer tools and inspecting the elements of a familiar page.'
        : 'Semantic HTML describes the purpose of content. Use a main element for primary content, nav for navigation, headings in order, and buttons for actions. A clear structure helps keyboard users and screen readers. Practice by outlining a simple article with a header, main section, headings, and footer.',
      position, 'reading', 600, position === 0 ? 1 : 0, 'published');
  }
  for (const live of mockLiveClasses) {
    const instructorId = userByName.get(live.instructorName);
    if (!instructorId) continue;
    db.prepare(`INSERT OR IGNORE INTO live_classes
      (id,course_id,instructor_id,title,description,scheduled_at,duration_minutes,status,provider)
      VALUES (?,?,?,?,?,?,?,?,?)`).run(
      live.id, db.prepare('SELECT 1 FROM courses WHERE id=?').get(live.courseId) ? live.courseId : null,
      instructorId, live.title, live.description, iso(live.scheduledAt, live.startTime), live.duration,
      live.status === 'completed' ? 'ended' : live.status, null
    );
  }
  for (const bootcamp of mockBootcamps) {
    const instructorId = userByName.get(bootcamp.instructorName);
    if (!instructorId || !bootcamp.sessions.length) continue;
    const dates = bootcamp.sessions.map((session) => iso(session.date, session.time));
    db.prepare(`INSERT OR IGNORE INTO bootcamps (id,title,slug,description,instructor_id,status,start_date,end_date)
      VALUES (?,?,?,?,?,?,?,?)`).run(bootcamp.id, bootcamp.title, bootcamp.slug, bootcamp.description,
      instructorId, 'published', dates[0], dates[dates.length - 1]);
    for (const [position, session] of bootcamp.sessions.entries()) {
      const liveId = session.liveClassId && db.prepare('SELECT 1 FROM live_classes WHERE id=?').get(session.liveClassId) ? session.liveClassId : null;
      db.prepare(`INSERT OR IGNORE INTO bootcamp_sessions
        (id,bootcamp_id,live_class_id,title,description,duration_minutes,assignment_title,session_date,position)
        VALUES (?,?,?,?,?,?,?,?,?)`)
        .run(`${bootcamp.id}-session-${position + 1}`, bootcamp.id, liveId, session.title,
          session.description || '', session.duration || 90, session.assignmentTitle || null, dates[position], position);
    }
  }
  for (const event of mockEvents) {
    db.prepare(`INSERT OR IGNORE INTO events
      (id,title,slug,description,instructor_id,event_type,scheduled_at,status,price_minor)
      VALUES (?,?,?,?,?,?,?,?,?)`).run(
      event.id, event.title, event.slug, event.description, userByName.get(event.speaker) || null,
      event.category, iso(event.date, event.time), 'published', Math.round((event.price || 0) * 100)
    );
  }
  const firstCourse = mockCourses[0];
  db.prepare('INSERT OR IGNORE INTO enrollments (id,user_id,course_id) VALUES (?,?,?)').run('seed-enrollment-1', 'usr_001', firstCourse.id);
  for (const lesson of firstCourse.sections[0].lessons.slice(0, 2)) {
    db.prepare('INSERT OR IGNORE INTO lesson_progress (id,user_id,lesson_id,course_id,completed,watched_seconds,completed_at) VALUES (?,?,?,?,?,?,?)')
      .run(`seed-progress-${lesson.id}`, 'usr_001', lesson.id, firstCourse.id, 1, seconds(lesson.duration), new Date().toISOString());
  }
  db.prepare('INSERT OR IGNORE INTO reviews (id,user_id,course_id,rating,comment) VALUES (?,?,?,?,?)')
    .run('seed-review-1', 'usr_001', firstCourse.id, 5, 'Clear explanations and useful hands-on examples.');
  db.prepare('INSERT OR IGNORE INTO notifications (id,user_id,type,title,message) VALUES (?,?,?,?,?)')
    .run('seed-notification-1', 'usr_001', 'info', 'Welcome to Elevate', 'Your learning dashboard is ready.');
  db.prepare("UPDATE users SET is_super_admin=1 WHERE email='admin@example.com' AND role='admin'").run();
  for (const courseId of [...mockCourses.map((course) => course.id), 'course-free-foundations']) {
    db.prepare("UPDATE courses SET review_status='approved' WHERE id=? AND status='published' AND review_status='draft'").run(courseId);
    db.prepare(`INSERT OR IGNORE INTO course_pricing
      (course_id,base_price_minor,currency,proposed_margin_bps,proposed_final_minor,approved_margin_bps,pricing_status)
      SELECT id,price_minor,currency,0,price_minor,0,'approved' FROM courses WHERE id=? AND status='published'`).run(courseId);
  }
  db.exec('COMMIT');
} catch (error) {
  db.exec('ROLLBACK');
  throw error;
}
const counts = Object.fromEntries(['users','courses','course_sections','lessons','live_classes','bootcamps','events'].map(
  (table) => [table, db.prepare(`SELECT COUNT(*) count FROM ${table}`).get().count]
));
console.log('Development seed ready:', counts);
console.log('Development sign-in emails: alex@example.com, john@example.com, admin@example.com, samira@example.invalid. Password comes from DEV_SEED_PASSWORD.');
db.close();
