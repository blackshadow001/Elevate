CREATE TABLE discarded_videos (
  storage_key TEXT PRIMARY KEY,
  discarded_at_ms INTEGER NOT NULL
);
CREATE INDEX discarded_videos_age_idx ON discarded_videos(discarded_at_ms);
