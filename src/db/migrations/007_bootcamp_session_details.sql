ALTER TABLE bootcamp_sessions ADD COLUMN description TEXT NOT NULL DEFAULT '';
ALTER TABLE bootcamp_sessions ADD COLUMN duration_minutes INTEGER NOT NULL DEFAULT 90 CHECK(duration_minutes BETWEEN 1 AND 1440);
ALTER TABLE bootcamp_sessions ADD COLUMN assignment_title TEXT;
