ALTER TABLE users ADD COLUMN is_super_admin INTEGER NOT NULL DEFAULT 0 CHECK(is_super_admin IN (0,1));
UPDATE users SET is_super_admin=1 WHERE role='admin';

ALTER TABLE courses ADD COLUMN review_status TEXT NOT NULL DEFAULT 'draft'
  CHECK(review_status IN ('draft','pending_approval','approved','rejected','unpublished'));
UPDATE courses SET review_status='approved' WHERE status='published';

CREATE TABLE course_pricing (
  course_id TEXT PRIMARY KEY REFERENCES courses(id) ON DELETE CASCADE,
  base_price_minor INTEGER CHECK(base_price_minor IS NULL OR base_price_minor >= 0),
  currency TEXT NOT NULL DEFAULT 'INR' CHECK(length(currency)=3),
  min_margin_bps INTEGER NOT NULL DEFAULT 0 CHECK(min_margin_bps BETWEEN 0 AND 10000),
  max_margin_bps INTEGER NOT NULL DEFAULT 0 CHECK(max_margin_bps BETWEEN 0 AND 10000),
  max_final_minor INTEGER CHECK(max_final_minor IS NULL OR max_final_minor >= 0),
  proposed_margin_bps INTEGER CHECK(proposed_margin_bps IS NULL OR proposed_margin_bps BETWEEN 0 AND 10000),
  proposed_final_minor INTEGER CHECK(proposed_final_minor IS NULL OR proposed_final_minor >= 0),
  approved_margin_bps INTEGER CHECK(approved_margin_bps IS NULL OR approved_margin_bps BETWEEN 0 AND 10000),
  pricing_status TEXT NOT NULL DEFAULT 'pending'
    CHECK(pricing_status IN ('pending','approved','rejected','changes_requested')),
  updated_by TEXT REFERENCES users(id),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK(min_margin_bps <= max_margin_bps)
);
INSERT INTO course_pricing(course_id,base_price_minor,currency,proposed_margin_bps,proposed_final_minor,
  approved_margin_bps,pricing_status)
SELECT id, CASE WHEN status='published' THEN price_minor ELSE NULL END, currency,
  CASE WHEN status='published' THEN 0 ELSE NULL END, price_minor,
  CASE WHEN status='published' THEN 0 ELSE NULL END,
  CASE WHEN status='published' THEN 'approved' ELSE 'pending' END FROM courses;

CREATE TABLE course_approval_history (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  actor_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  action TEXT NOT NULL CHECK(action IN ('submitted','approved','rejected','published','unpublished','pricing_updated','pricing_approved','pricing_rejected','pricing_changes_requested','revision')),
  feedback TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX course_approval_history_course_idx ON course_approval_history(course_id,created_at);
