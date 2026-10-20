CREATE TABLE video_watch_evidence (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  duration_seconds REAL NOT NULL CHECK(duration_seconds > 0),
  segments_json TEXT NOT NULL DEFAULT '[]',
  last_position_seconds REAL NOT NULL DEFAULT 0,
  last_reported_at_ms INTEGER NOT NULL,
  last_playing INTEGER NOT NULL DEFAULT 0 CHECK(last_playing IN (0,1)),
  reached_end INTEGER NOT NULL DEFAULT 0 CHECK(reached_end IN (0,1)),
  PRIMARY KEY (user_id,lesson_id)
);
CREATE INDEX video_watch_evidence_course_idx ON video_watch_evidence(user_id,course_id);
