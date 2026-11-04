CREATE TABLE personal_plan_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  monthly_price_minor INTEGER CHECK (monthly_price_minor IS NULL OR monthly_price_minor > 0),
  annual_price_minor INTEGER CHECK (annual_price_minor IS NULL OR annual_price_minor > 0),
  updated_by TEXT REFERENCES users(id),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
INSERT INTO personal_plan_settings(id) VALUES (1);
