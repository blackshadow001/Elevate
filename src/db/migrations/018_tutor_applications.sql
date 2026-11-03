CREATE TABLE tutor_applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  experience TEXT NOT NULL,
  course_plan TEXT NOT NULL,
  portfolio_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  admin_note TEXT,
  reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  submitted_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  reviewed_at TEXT
);
CREATE INDEX tutor_applications_status_idx ON tutor_applications(status,submitted_at);
