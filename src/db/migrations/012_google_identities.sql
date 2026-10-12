CREATE TABLE auth_identities (
  provider TEXT NOT NULL CHECK(provider IN ('google')),
  subject TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_at_link TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (provider, subject),
  UNIQUE (provider, user_id)
);
CREATE INDEX auth_identities_user_idx ON auth_identities(user_id);
