CREATE TABLE personal_plan_gateway_plans (
  term TEXT NOT NULL CHECK (term IN ('monthly','annual')),
  price_minor INTEGER NOT NULL CHECK (price_minor >= 100),
  gateway_plan_id TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (term,price_minor)
);

CREATE TABLE personal_plan_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  term TEXT NOT NULL CHECK (term IN ('monthly','annual')),
  price_minor INTEGER NOT NULL CHECK (price_minor >= 100),
  gateway_plan_id TEXT NOT NULL,
  gateway_subscription_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('created','authenticated','active','pending','halted','paused','cancelled','completed','expired')),
  paid_count INTEGER NOT NULL DEFAULT 0 CHECK (paid_count >= 0),
  current_end INTEGER,
  next_charge_at INTEGER,
  cancel_at_cycle_end INTEGER NOT NULL DEFAULT 0 CHECK (cancel_at_cycle_end IN (0,1)),
  last_payment_id TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX personal_plan_subscriptions_user_idx ON personal_plan_subscriptions(user_id,created_at);
CREATE UNIQUE INDEX personal_plan_one_open_subscription_idx ON personal_plan_subscriptions(user_id)
  WHERE status IN ('created','authenticated','active','pending','halted','paused');

CREATE TABLE personal_plan_grants (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  subscription_id TEXT NOT NULL REFERENCES personal_plan_subscriptions(id) ON DELETE CASCADE,
  granted_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (user_id,course_id)
);
CREATE INDEX personal_plan_grants_subscription_idx ON personal_plan_grants(subscription_id);

CREATE TABLE personal_plan_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  gateway_subscription_id TEXT NOT NULL,
  received_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE personal_plan_reminders (
  subscription_id TEXT NOT NULL REFERENCES personal_plan_subscriptions(id) ON DELETE CASCADE,
  cycle_end INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent')),
  provider_message_id TEXT,
  last_attempt_at TEXT,
  PRIMARY KEY (subscription_id,cycle_end)
);
