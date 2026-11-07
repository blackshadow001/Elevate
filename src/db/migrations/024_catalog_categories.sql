UPDATE courses
SET category = CASE category
  WHEN 'AI & ML' THEN 'AI & Generative AI'
  WHEN 'Data Science' THEN 'Technology & Programming'
  WHEN 'Development' THEN 'Technology & Programming'
  WHEN 'Cloud & DevOps' THEN 'Technology & Programming'
  WHEN 'Cybersecurity' THEN 'Technology & Programming'
  WHEN 'General' THEN 'Technology & Programming'
  WHEN 'Marketing' THEN 'Digital Marketing'
  WHEN 'Business' THEN 'Business & Entrepreneurship'
  WHEN 'Sales' THEN 'Sales & Communication'
  WHEN 'Finance' THEN 'Finance & Investment Basics'
  WHEN 'Mindfulness' THEN 'Mindfulness & Personal Development'
  WHEN 'Freelancing' THEN 'Freelancing & Online Income'
  WHEN 'Design' THEN 'Design & Content Creation'
  WHEN 'Content Creation' THEN 'Design & Content Creation'
  ELSE category
END
WHERE category IN (
  'AI & ML', 'Data Science', 'Development', 'Cloud & DevOps',
  'Cybersecurity', 'General', 'Marketing', 'Business', 'Sales',
  'Finance', 'Mindfulness', 'Freelancing', 'Design', 'Content Creation'
);

-- A full paid lesson must not remain available as an unrestricted preview.
UPDATE lessons SET is_preview=0 WHERE is_preview=1 AND duration_seconds>60
  AND EXISTS (SELECT 1 FROM course_sections s JOIN courses c ON c.id=s.course_id
    WHERE s.id=lessons.section_id AND c.price_minor>0);

CREATE TABLE catalog_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  subcategories_json TEXT NOT NULL DEFAULT '[]',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO catalog_categories(id,name,subcategories_json,position) VALUES
  ('ai-generative-ai','AI & Generative AI','["AI Fundamentals","Language Models","AI Applications"]',0),
  ('ai-tools-automation','AI Tools & Automation','["AI Assistants","Workflow Automation","Local AI"]',1),
  ('technology-programming','Technology & Programming','["Programming Basics","APIs & Data","Cloud & Developer Tools"]',2),
  ('digital-marketing','Digital Marketing','["Search & Advertising","Content & Growth"]',3),
  ('business-entrepreneurship','Business & Entrepreneurship','["Startup Fundamentals","Business Strategy"]',4),
  ('sales-communication','Sales & Communication','["Sales Fundamentals","Communication Skills"]',5),
  ('finance-investment-basics','Finance & Investment Basics','["Personal Finance","Investing Basics"]',6),
  ('mindfulness-personal-development','Mindfulness & Personal Development','["Mindfulness & Wellbeing","Productivity & Growth"]',7),
  ('freelancing-online-income','Freelancing & Online Income','["Freelancing","Online Business","Creator Economy"]',8),
  ('design-content-creation','Design & Content Creation','["Visual Design","Design Tools","Content Creation"]',9);

CREATE TABLE admin_audit_logs_new (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK(entity_type IN ('user','certificate','category')),
  entity_id TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  change_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
INSERT INTO admin_audit_logs_new(id,actor_id,action,entity_type,entity_id,reason,change_json,created_at)
  SELECT id,actor_id,action,entity_type,entity_id,reason,change_json,created_at FROM admin_audit_logs;
DROP TABLE admin_audit_logs;
ALTER TABLE admin_audit_logs_new RENAME TO admin_audit_logs;
CREATE INDEX admin_audit_created_idx ON admin_audit_logs(created_at DESC);
CREATE INDEX admin_audit_entity_idx ON admin_audit_logs(entity_type,entity_id,created_at DESC);
