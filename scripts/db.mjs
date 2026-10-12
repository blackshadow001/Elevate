import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const raw = process.env.DATABASE_URL || 'file:./data/learnly.sqlite';
if (!raw.startsWith('file:')) throw new Error('Phase 1 supports SQLite DATABASE_URL=file:<path> only.');
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
console.log(`Database ready: ${dbPath}`);
db.close();
