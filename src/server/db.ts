import "server-only";
import { DatabaseSync } from "node:sqlite";

let cachedDb: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (cachedDb) return cachedDb;
  const url = process.env.DATABASE_URL || (process.env.NODE_ENV === "production" ? "" : "file:./data/learnly.sqlite");
  if (!url.startsWith("file:") || !url.slice(5)) {
    throw new Error("DATABASE_URL must be a SQLite file URL. Run migrations before starting the API.");
  }
  const db = new DatabaseSync(url.slice(5));
  db.exec("PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;");
  if (!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='schema_migrations'").get()) {
    db.close();
    throw new Error("Database is not migrated. Run npm run db:migrate.");
  }
  cachedDb = db;
  return db;
}

export function transaction<T>(operation: (db: DatabaseSync) => T): T {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = operation(db);
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
