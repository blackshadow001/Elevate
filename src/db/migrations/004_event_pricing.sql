ALTER TABLE events ADD COLUMN price_minor INTEGER NOT NULL DEFAULT 0 CHECK(price_minor >= 0);
UPDATE events SET price_minor=49900 WHERE id='event-5';
