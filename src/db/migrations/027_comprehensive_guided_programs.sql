ALTER TABLE guided_steps ADD COLUMN module_title TEXT NOT NULL DEFAULT 'Core lessons';
ALTER TABLE guided_steps ADD COLUMN block_type TEXT NOT NULL DEFAULT 'lecture';
ALTER TABLE guided_paths ADD COLUMN project_title TEXT NOT NULL DEFAULT '';
ALTER TABLE guided_paths ADD COLUMN project_brief TEXT NOT NULL DEFAULT '';
ALTER TABLE guided_paths ADD COLUMN project_requirements_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE guided_paths ADD COLUMN exam_json TEXT NOT NULL DEFAULT '[]';

UPDATE guided_paths
SET slug = slug || '-intro-2026', status = 'archived', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE id IN ('curriculum-web-v1','curriculum-fullstack-v1','curriculum-python-v1',
             'curriculum-dataviz-v1','curriculum-git-v1','curriculum-rdbms-v1')
  AND slug NOT LIKE '%-intro-2026';

CREATE TABLE guided_project_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  path_id TEXT NOT NULL REFERENCES guided_paths(id) ON DELETE CASCADE,
  project_url TEXT NOT NULL,
  repository_url TEXT NOT NULL,
  notes TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','changes_requested','approved')),
  feedback TEXT NOT NULL DEFAULT '',
  reviewer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  submitted_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  reviewed_at TEXT,
  UNIQUE(user_id,path_id)
);
CREATE INDEX guided_project_review_idx ON guided_project_submissions(status,submitted_at);

CREATE TABLE guided_exam_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  path_id TEXT NOT NULL REFERENCES guided_paths(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  passed INTEGER NOT NULL CHECK(passed IN (0,1)),
  attempted_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX guided_exam_user_idx ON guided_exam_attempts(user_id,path_id,attempted_at DESC);

CREATE TABLE guided_certificates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  path_id TEXT NOT NULL REFERENCES guided_paths(id) ON DELETE CASCADE,
  project_submission_id TEXT NOT NULL REFERENCES guided_project_submissions(id),
  exam_attempt_id TEXT NOT NULL REFERENCES guided_exam_attempts(id),
  issued_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(user_id,path_id)
);
