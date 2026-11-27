ALTER TABLE guided_steps ADD COLUMN chapter_title TEXT NOT NULL DEFAULT 'Getting started';

UPDATE guided_steps SET chapter_title = CASE
  WHEN position <= 3 THEN 'Chapter 1 · HTML foundations'
  ELSE 'Chapter 2 · CSS and your first page'
END WHERE path_id = 'web-foundations-v1';

UPDATE guided_paths SET status = 'archived', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE id = 'web-foundations-v1' AND status = 'published';
