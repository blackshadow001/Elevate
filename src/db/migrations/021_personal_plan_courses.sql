CREATE TABLE personal_plan_courses (
  course_id TEXT PRIMARY KEY REFERENCES courses(id) ON DELETE CASCADE,
  added_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  added_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
