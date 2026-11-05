CREATE TABLE live_class_recordings (
  live_class_id TEXT PRIMARY KEY REFERENCES live_classes(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL UNIQUE REFERENCES media_assets(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
