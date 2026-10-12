CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(name) BETWEEN 2 AND 160),
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'learner' CHECK(role IN ('learner','instructor','admin')),
  avatar TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','disabled')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  revoked_at TEXT
);
CREATE INDEX sessions_user_idx ON sessions(user_id);
CREATE INDEX sessions_expires_idx ON sessions(expires_at);

CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL CHECK(length(title) BETWEEN 3 AND 200),
  slug TEXT NOT NULL COLLATE NOCASE UNIQUE,
  subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  level TEXT NOT NULL DEFAULT 'Beginner' CHECK(level IN ('Beginner','Intermediate','Advanced')),
  language TEXT NOT NULL DEFAULT 'English',
  thumbnail TEXT,
  instructor_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  price_minor INTEGER NOT NULL DEFAULT 0 CHECK(price_minor >= 0),
  currency TEXT NOT NULL DEFAULT 'INR' CHECK(length(currency)=3),
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
  rating REAL NOT NULL DEFAULT 0 CHECK(rating BETWEEN 0 AND 5),
  duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK(duration_seconds >= 0),
  lesson_count INTEGER NOT NULL DEFAULT 0 CHECK(lesson_count >= 0),
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  published_at TEXT
);
CREATE INDEX courses_catalog_idx ON courses(status,category,level,price_minor,rating);
CREATE INDEX courses_instructor_idx ON courses(instructor_id,status);
CREATE INDEX courses_title_idx ON courses(title);

CREATE TABLE course_sections (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 200),
  position INTEGER NOT NULL CHECK(position >= 0),
  UNIQUE(course_id,position)
);
CREATE INDEX sections_course_idx ON course_sections(course_id);

CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  section_id TEXT NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 200),
  description TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL CHECK(position >= 0),
  type TEXT NOT NULL DEFAULT 'video' CHECK(type IN ('video','reading','quiz','project')),
  video_storage_key TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK(duration_seconds >= 0),
  is_preview INTEGER NOT NULL DEFAULT 0 CHECK(is_preview IN (0,1)),
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
  UNIQUE(section_id,position)
);
CREATE INDEX lessons_section_idx ON lessons(section_id);

CREATE TABLE enrollments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','completed','cancelled')),
  enrolled_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  completed_at TEXT,
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK(progress_percent BETWEEN 0 AND 100),
  UNIQUE(user_id,course_id)
);
CREATE INDEX enrollments_course_idx ON enrollments(course_id,status);

CREATE TABLE lesson_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0,1)),
  watched_seconds INTEGER NOT NULL DEFAULT 0 CHECK(watched_seconds >= 0),
  completed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(user_id,lesson_id)
);
CREATE INDEX progress_user_course_idx ON lesson_progress(user_id,course_id);

CREATE TABLE wishlists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(user_id,course_id)
);

CREATE TABLE certificates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  certificate_number TEXT NOT NULL UNIQUE,
  verification_id TEXT NOT NULL UNIQUE,
  issued_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  verification_status TEXT NOT NULL DEFAULT 'valid' CHECK(verification_status IN ('valid','revoked')),
  metadata_json TEXT NOT NULL DEFAULT '{}',
  UNIQUE(user_id,course_id)
);
CREATE INDEX certificates_user_idx ON certificates(user_id);

CREATE TABLE media_assets (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  storage_key TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL CHECK(size_bytes >= 0),
  duration_seconds INTEGER CHECK(duration_seconds >= 0),
  visibility TEXT NOT NULL DEFAULT 'private' CHECK(visibility IN ('private','public')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE course_resources (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  storage_key TEXT REFERENCES media_assets(storage_key) ON DELETE RESTRICT,
  external_url TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK(storage_key IS NOT NULL OR external_url IS NOT NULL)
);

CREATE TABLE live_classes (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
  instructor_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  scheduled_at TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK(duration_minutes BETWEEN 1 AND 1440),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','live','ended','cancelled')),
  provider TEXT,
  provider_room_id TEXT,
  meeting_reference TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX live_schedule_idx ON live_classes(status,scheduled_at);
CREATE INDEX live_instructor_idx ON live_classes(instructor_id);

CREATE TABLE live_participants (
  id TEXT PRIMARY KEY,
  live_class_id TEXT NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('instructor','participant')),
  joined_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  left_at TEXT
);
CREATE INDEX participants_active_idx ON live_participants(live_class_id,left_at);

CREATE TABLE live_messages (
  id TEXT PRIMARY KEY,
  live_class_id TEXT NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK(length(body) BETWEEN 1 AND 2000),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  deleted_at TEXT
);
CREATE INDEX messages_class_idx ON live_messages(live_class_id,created_at);

CREATE TABLE bootcamps (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL COLLATE NOCASE UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  instructor_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK(end_date >= start_date)
);
CREATE INDEX bootcamps_instructor_idx ON bootcamps(instructor_id,status);

CREATE TABLE bootcamp_sessions (
  id TEXT PRIMARY KEY,
  bootcamp_id TEXT NOT NULL REFERENCES bootcamps(id) ON DELETE CASCADE,
  live_class_id TEXT REFERENCES live_classes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  session_date TEXT NOT NULL,
  position INTEGER NOT NULL CHECK(position >= 0),
  UNIQUE(bootcamp_id,position)
);

CREATE TABLE bootcamp_registrations (
  id TEXT PRIMARY KEY,
  bootcamp_id TEXT NOT NULL REFERENCES bootcamps(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(bootcamp_id,user_id)
);

CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL COLLATE NOCASE UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  instructor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','cancelled','ended')),
  live_class_id TEXT REFERENCES live_classes(id) ON DELETE SET NULL
);
CREATE INDEX events_schedule_idx ON events(status,scheduled_at);

CREATE TABLE event_registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(event_id,user_id)
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('success','info','warning','error')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX notifications_inbox_idx ON notifications(user_id,read_at,created_at);

CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(user_id,course_id)
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','cancelled','refunded')),
  total_minor INTEGER NOT NULL CHECK(total_minor >= 0),
  currency TEXT NOT NULL CHECK(length(currency)=3),
  provider_reference TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX orders_user_idx ON orders(user_id,status);

CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  price_minor INTEGER NOT NULL CHECK(price_minor >= 0),
  UNIQUE(order_id,course_id)
);

CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  provider TEXT NOT NULL,
  provider_payment_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK(status IN ('pending','succeeded','failed','refunded')),
  amount_minor INTEGER NOT NULL CHECK(amount_minor >= 0),
  verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE analytics_events (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX analytics_course_idx ON analytics_events(course_id,type,created_at);
