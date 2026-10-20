-- Extend existing order and payment records without changing historical quotes.
ALTER TABLE orders ADD COLUMN checkout_state TEXT NOT NULL DEFAULT 'none'
  CHECK(checkout_state IN ('none','creating','ready'));
ALTER TABLE orders ADD COLUMN checkout_started_at TEXT;
ALTER TABLE orders ADD COLUMN paid_at TEXT;

ALTER TABLE payments ADD COLUMN gateway_order_id TEXT;
ALTER TABLE payments ADD COLUMN currency TEXT CHECK(currency IS NULL OR length(currency)=3);
ALTER TABLE payments ADD COLUMN updated_at TEXT;
ALTER TABLE payments ADD COLUMN failure_code TEXT;
CREATE INDEX payments_order_status_idx ON payments(order_id,status);

CREATE TABLE payment_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  gateway_order_id TEXT,
  provider_payment_id TEXT,
  received_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
