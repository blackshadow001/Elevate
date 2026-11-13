// One-time, idempotent content import. Run --check first; --apply requires a DB backup.
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, statSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const courses = [
  { title: 'What is RAG?', slug: 'what-is-rag-english-demo', category: 'AI & Generative AI', subcategory: 'AI Fundamentals', price: 39,
    outcomes: ['Describe how retrieval augmented generation works', 'Trace a question through retrieval and answer generation', 'Check source relevance and access permissions'] },
  { title: 'What is an API?', slug: 'what-is-an-api-english-demo', category: 'Technology & Programming', subcategory: 'APIs & Data', price: 29,
    outcomes: ['Identify requests, endpoints, and responses', 'Read a simple course catalog API example', 'Distinguish authentication from authorization'] },
  { title: 'What is SEO?', slug: 'what-is-seo-english-demo', category: 'Digital Marketing', subcategory: 'Search & Advertising', price: 29,
    outcomes: ['Explain search intent and useful page content', 'Identify basic page and technical signals', 'Plan a first SEO improvement checklist'] },
  { title: 'What is MVP?', slug: 'what-is-mvp-english-demo', category: 'Business & Entrepreneurship', subcategory: 'Startup Fundamentals', price: 29,
    outcomes: ['Define a minimum viable product', 'Choose one testable product assumption', 'Use learner feedback to plan the next iteration'] },
];

const mode = process.argv[2];
if (!['--check', '--apply'].includes(mode)) throw new Error('Usage: node scripts/publish-demo-courses.mjs --check|--apply');
const databasePath = resolve(process.env.DEMO_DATABASE_PATH || '');
const mediaPath = resolve(process.env.DEMO_MEDIA_PATH || '');
const assetsPath = resolve(process.env.DEMO_ASSETS_PATH || '');
if (!process.env.DEMO_DATABASE_PATH || !process.env.DEMO_MEDIA_PATH || !process.env.DEMO_ASSETS_PATH)
  throw new Error('Set DEMO_DATABASE_PATH, DEMO_MEDIA_PATH, and DEMO_ASSETS_PATH.');
if (!existsSync(databasePath) || !existsSync(assetsPath)) throw new Error('Database or staged assets missing.');
if (mode === '--apply' && !existsSync(process.env.DEMO_BACKUP_PATH || '')) throw new Error('Set DEMO_BACKUP_PATH to an existing database backup before applying.');
const db = new DatabaseSync(databasePath, { readOnly: mode === '--check' });
db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
const admin = db.prepare("SELECT id,name FROM users WHERE role='admin' AND status='active' ORDER BY is_super_admin DESC LIMIT 1").get();
if (!admin || String(admin.name).toLocaleLowerCase() !== 'elevate') throw new Error('An active Elevate admin account is required as the demo publisher.');
const ffmpeg = process.env.FFMPEG_BIN || 'ffmpeg';
const duration = (file) => {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-i', file], { encoding: 'utf8' });
  const match = /Duration: (\d{2}):(\d{2}):(\d{2}\.\d+)/.exec(result.stderr || '');
  if (!match) throw new Error(`Cannot inspect video duration: ${file}`);
  return Math.round(Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]));
};
const pending = [];
for (const course of courses) {
  const existing = db.prepare('SELECT id,slug,title,status,review_status,price_minor FROM courses WHERE slug=? OR title=?').all(course.slug, course.title);
  if (existing.length) {
    if (existing.length === 1 && existing[0].slug === course.slug && existing[0].status === 'published' && Number(existing[0].price_minor) === course.price * 100) {
      console.log(`Already present: ${course.title}`);
      continue;
    }
    throw new Error(`Conflicting existing course: ${course.title}`);
  }
  const folder = join(assetsPath, course.slug);
  const files = { full: join(folder, 'lesson.mp4'), preview: join(folder, 'preview.mp4'), thumbnail: join(folder, 'thumbnail.png') };
  for (const file of Object.values(files)) if (!existsSync(file) || statSync(file).size < 1000) throw new Error(`Missing or empty asset: ${file}`);
  const fullSeconds = duration(files.full);
  const previewSeconds = duration(files.preview);
  if (fullSeconds < 90 || previewSeconds < 30 || previewSeconds > 60) throw new Error(`Unexpected duration: ${course.title}, ${fullSeconds}/${previewSeconds}`);
  const category = db.prepare('SELECT subcategories_json FROM catalog_categories WHERE name=?').get(course.category);
  if (!category || !JSON.parse(String(category.subcategories_json)).includes(course.subcategory)) throw new Error(`Catalog category mismatch: ${course.title}`);
  pending.push({ ...course, files, fullSeconds, previewSeconds });
  console.log(`Ready: ${course.title} | ${course.category} | English demo | ₹${course.price} | ${fullSeconds}s full + ${previewSeconds}s preview`);
}
if (mode === '--check' || pending.length === 0) { db.close(); process.exit(0); }

mkdirSync(mediaPath, { recursive: true });
const copied = [];
try {
  db.exec('BEGIN IMMEDIATE');
  for (const course of pending) {
    const now = new Date().toISOString();
    const courseId = randomUUID();
    const sectionId = randomUUID();
    const media = {};
    for (const kind of ['full', 'preview']) {
      const assetId = randomUUID();
      const storageKey = `${randomUUID()}.mp4`;
      const destination = join(mediaPath, storageKey);
      copyFileSync(course.files[kind], destination);
      copied.push(destination);
      const seconds = kind === 'full' ? course.fullSeconds : course.previewSeconds;
      db.prepare('INSERT INTO media_assets(id,owner_id,storage_key,mime_type,size_bytes,duration_seconds,visibility) VALUES (?,?,?,?,?,?,?)')
        .run(assetId, admin.id, storageKey, 'video/mp4', statSync(destination).size, seconds, 'private');
      media[kind] = storageKey;
    }
    const thumbnailKey = `${randomUUID()}.png`;
    const thumbnailDestination = join(mediaPath, thumbnailKey);
    copyFileSync(course.files.thumbnail, thumbnailDestination);
    copied.push(thumbnailDestination);
    const metadata = JSON.stringify({ subcategory: course.subcategory, whatYouWillLearn: course.outcomes,
      requirements: ['No previous experience needed'], demo: true });
    const subtitle = `English demo · A focused introduction to ${course.title.replace(/^What is /, '').replace(/\?$/, '')}`;
    const description = `English demo course from Elevate. This original, AI-narrated lesson introduces ${course.title.toLowerCase().replace(/\?$/, '')} with practical examples and a short free preview. The full lesson is available after purchase. This is a concise introductory demo, not a full-length course.`;
    db.prepare(`INSERT INTO courses(id,title,slug,subtitle,description,category,level,language,thumbnail,instructor_id,price_minor,currency,status,rating,duration_seconds,lesson_count,metadata_json,review_status,published_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(courseId, course.title, course.slug, subtitle, description,
      course.category, 'Beginner', 'English', `/api/course-thumbnails/${thumbnailKey}`, admin.id,
      course.price * 100, 'INR', 'draft', 0, course.previewSeconds + course.fullSeconds, 2, metadata, 'draft', null);
    db.prepare('INSERT INTO course_sections(id,course_id,title,position) VALUES (?,?,?,0)')
      .run(sectionId, courseId, 'English demo: core concepts');
    const addLesson = db.prepare(`INSERT INTO lessons(id,section_id,title,description,position,type,video_storage_key,duration_seconds,is_preview,status)
      VALUES (?,?,?,?,?,'video',?,?,?,'published')`);
    addLesson.run(randomUUID(), sectionId, 'Free preview: first concepts', 'A 45-second sample of the English demo lesson.', 0, media.preview, course.previewSeconds, 1);
    addLesson.run(randomUUID(), sectionId, `Full lesson: ${course.title}`, 'The complete English demo lesson with narrated examples and practical takeaways.', 1, media.full, course.fullSeconds, 0);
    db.prepare(`INSERT INTO course_pricing(course_id,base_price_minor,currency,min_margin_bps,max_margin_bps,proposed_margin_bps,proposed_final_minor,approved_margin_bps,pricing_status,updated_by)
      VALUES (?,?,'INR',0,0,0,?,0,'approved',?)`).run(courseId, course.price * 100, course.price * 100, admin.id);
    const history = db.prepare('INSERT INTO course_approval_history(id,course_id,actor_id,action,feedback,change_json) VALUES (?,?,?,?,?,?)');
    history.run(randomUUID(), courseId, admin.id, 'pricing_approved', 'English demo import at listed price', '{}');
    history.run(randomUUID(), courseId, admin.id, 'approved', 'Original English demo lesson reviewed for publication', '{}');
    db.prepare("UPDATE courses SET review_status='approved',status='published',published_at=?,updated_at=? WHERE id=?").run(now, now, courseId);
    history.run(randomUUID(), courseId, admin.id, 'published', 'English demo published', '{}');
    console.log(`Published: ${course.title} (${courseId})`);
  }
  db.exec('COMMIT');
} catch (error) {
  try { db.exec('ROLLBACK'); } catch { /* transaction may already be closed */ }
  for (const file of copied) try { unlinkSync(file); } catch { /* leave cleanup to operator */ }
  throw error;
} finally { db.close(); }
