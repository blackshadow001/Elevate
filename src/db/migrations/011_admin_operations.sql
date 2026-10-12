ALTER TABLE course_approval_history ADD COLUMN change_json TEXT NOT NULL DEFAULT '{}';

CREATE TABLE admin_audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK(entity_type IN ('user','certificate')),
  entity_id TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  change_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX admin_audit_created_idx ON admin_audit_logs(created_at DESC);
CREATE INDEX admin_audit_entity_idx ON admin_audit_logs(entity_type,entity_id,created_at DESC);
CREATE INDEX admin_users_filter_idx ON users(role,status,created_at DESC);
CREATE INDEX admin_courses_filter_idx ON courses(review_status,instructor_id,category,updated_at DESC);
