-- Auto-generated from Payload collections
-- Run: psql <DATABASE_URL> < this_file.sql

CREATE SCHEMA IF NOT EXISTS payload;

-- Payload internal tables
CREATE TABLE IF NOT EXISTS payload.payload_migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  batch INTEGER,
  updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payload.payload_locked_documents (
  id SERIAL PRIMARY KEY,
  document_id INTEGER,
  global_slug VARCHAR(255),
  updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payload.payload_locked_documents_rels (
  id SERIAL PRIMARY KEY,
  "order" INTEGER,
  parent_id INTEGER,
  path VARCHAR(255),
  courses_id INTEGER,
  modules_id INTEGER,
  lessons_id INTEGER,
  tasks_id INTEGER,
  media_id INTEGER,
  payload_users_id VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS payload.payload_preferences (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255),
  value JSONB,
  updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payload.payload_preferences_rels (
  id SERIAL PRIMARY KEY,
  "order" INTEGER,
  parent_id INTEGER,
  path VARCHAR(255),
  payload_users_id VARCHAR(255)
);

-- Auth tables
CREATE TABLE IF NOT EXISTS payload.payload_users (
  id VARCHAR(255) PRIMARY KEY,
  role VARCHAR(255) DEFAULT 'ADMIN',
  updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  email VARCHAR(255) UNIQUE NOT NULL,
  reset_password_token VARCHAR(255),
  reset_password_expiration TIMESTAMP(3),
  salt VARCHAR(255),
  hash VARCHAR(255),
  login_attempts INTEGER DEFAULT 0,
  lock_until TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS payload_users_email_idx ON payload.payload_users(email);
CREATE INDEX IF NOT EXISTS payload_users_created_at_idx ON payload.payload_users(created_at);

-- Courses table
CREATE TABLE IF NOT EXISTS payload.courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description JSONB,
  level VARCHAR(255) DEFAULT 'E8' NOT NULL,
  subject VARCHAR(255) NOT NULL,
  cover_image_id INTEGER,
  is_published BOOLEAN DEFAULT false,
  updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS courses_slug_idx ON payload.courses(slug);
CREATE INDEX IF NOT EXISTS courses_created_at_idx ON payload.courses(created_at);

-- Modules table
CREATE TABLE IF NOT EXISTS payload.modules (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  course_id INTEGER,
  order_index INTEGER,
  updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS modules_course_id_idx ON payload.modules(course_id);
CREATE INDEX IF NOT EXISTS modules_created_at_idx ON payload.modules(created_at);

-- Lessons table
CREATE TABLE IF NOT EXISTS payload.lessons (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  content JSONB,
  module_id INTEGER,
  order_index INTEGER,
  duration INTEGER,
  updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS lessons_module_id_idx ON payload.lessons(module_id);
CREATE INDEX IF NOT EXISTS lessons_created_at_idx ON payload.lessons(created_at);

-- Tasks table
CREATE TABLE IF NOT EXISTS payload.tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(255),
  content JSONB,
  correct_answer TEXT,
  explanation TEXT,
  order_index INTEGER,
  updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
-- NOTE: lesson_id was a deprecated direct FK; lesson association is now
-- in tasks_rels (hasMany). The column is dropped via 2026-02-24_drop_deprecated_columns.
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON payload.tasks(created_at);

-- Media table
CREATE TABLE IF NOT EXISTS payload.media (
  id SERIAL PRIMARY KEY,
  alt VARCHAR(255),
  updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  url VARCHAR(255),
  thumbnail_url VARCHAR(255),
  filename VARCHAR(255),
  mime_type VARCHAR(255),
  filesize INTEGER,
  width INTEGER,
  height INTEGER,
  focal_x INTEGER,
  focal_y INTEGER
);

CREATE INDEX IF NOT EXISTS media_created_at_idx ON payload.media(created_at);
CREATE INDEX IF NOT EXISTS media_filename_idx ON payload.media(filename);

-- Compatibility: create nested blocks and attachments tables expected by Payload
CREATE TABLE IF NOT EXISTS payload.lessons_blocks_text (
  id SERIAL PRIMARY KEY,
  _order INTEGER,
  _path VARCHAR(255),
  _parent_id INTEGER,
  content JSONB,
  block_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS payload.lessons_blocks_image (
  id SERIAL PRIMARY KEY,
  _order INTEGER,
  _path VARCHAR(255),
  _parent_id INTEGER,
  image_id INTEGER,
  caption VARCHAR(1024),
  align VARCHAR(64),
  width INTEGER,
  block_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS payload.lessons_blocks_math (
  id SERIAL PRIMARY KEY,
  _order INTEGER,
  _path VARCHAR(255),
  _parent_id INTEGER,
  latex TEXT,
  display_mode VARCHAR(32),
  note TEXT,
  block_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS payload.lessons_blocks_callout (
  id SERIAL PRIMARY KEY,
  _order INTEGER,
  _path VARCHAR(255),
  _parent_id INTEGER,
  variant VARCHAR(64),
  title VARCHAR(1024),
  content JSONB,
  block_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS payload.lessons_blocks_video (
  id SERIAL PRIMARY KEY,
  _order INTEGER,
  _path VARCHAR(255),
  _parent_id INTEGER,
  video_url VARCHAR(2048),
  provider VARCHAR(128),
  title VARCHAR(1024),
  caption VARCHAR(1024),
  aspect_ratio VARCHAR(64),
  block_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS payload.lessons_blocks_table (
  id varchar PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::varchar,
  _order INTEGER,
  _path VARCHAR(255),
  _parent_id varchar NOT NULL,
  caption VARCHAR(1024),
  has_headers BOOLEAN DEFAULT true,
  headers JSONB,
  rows JSONB,
  block_name VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS lessons_blocks_table_parent_idx ON payload.lessons_blocks_table (_parent_id);
CREATE INDEX IF NOT EXISTS lessons_blocks_table_order_idx  ON payload.lessons_blocks_table (_order);

CREATE TABLE IF NOT EXISTS payload.lessons_attachments (
  id SERIAL PRIMARY KEY,
  _order INTEGER,
  _parent_id INTEGER,
  file_id INTEGER,
  description VARCHAR(1024)
);

-- Backwards-compatibility: add misspelled thumbnail column if code expects it
ALTER TABLE IF EXISTS payload.media ADD COLUMN IF NOT EXISTS "thumbnail_u_r_l" VARCHAR(255);

-- Ensure top-level "order" columns exist for collections that expect the field name `order`
ALTER TABLE IF EXISTS payload.modules ADD COLUMN IF NOT EXISTS "order" INTEGER;
ALTER TABLE IF EXISTS payload.lessons ADD COLUMN IF NOT EXISTS "order" INTEGER;
ALTER TABLE IF EXISTS payload.tasks ADD COLUMN IF NOT EXISTS "order" INTEGER;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='payload' AND table_name='modules' AND column_name='order_index') THEN
    EXECUTE 'UPDATE payload.modules SET "order" = order_index WHERE "order" IS NULL';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='payload' AND table_name='lessons' AND column_name='order_index') THEN
    EXECUTE 'UPDATE payload.lessons SET "order" = order_index WHERE "order" IS NULL';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='payload' AND table_name='tasks' AND column_name='order_index') THEN
    EXECUTE 'UPDATE payload.tasks SET "order" = order_index WHERE "order" IS NULL';
  END IF;
END$$;

-- Ensure `is_published` exists where collection code expects it
ALTER TABLE IF EXISTS payload.modules ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS payload.lessons ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS payload.tasks ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
