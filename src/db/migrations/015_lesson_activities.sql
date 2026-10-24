ALTER TABLE lessons ADD COLUMN activity_json TEXT;

CREATE TABLE lesson_activity_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  response_json TEXT NOT NULL,
  score_percent INTEGER,
  passed INTEGER NOT NULL DEFAULT 0 CHECK(passed IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX lesson_activity_submissions_user_lesson_idx
  ON lesson_activity_submissions(user_id,lesson_id,created_at DESC);
