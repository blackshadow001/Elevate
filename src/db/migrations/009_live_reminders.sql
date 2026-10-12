CREATE TABLE live_reminders (
  id TEXT PRIMARY KEY,
  live_class_id TEXT NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(live_class_id,user_id)
);
CREATE INDEX idx_live_reminders_user ON live_reminders(user_id,created_at);
