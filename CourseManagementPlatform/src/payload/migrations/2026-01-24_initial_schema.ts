import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  console.log('[INFO] Running initial schema migration...')
  console.log('[INFO] Creating ALL Payload tables in "payload" schema...')
  
  try {
    // === PAYLOAD INTERNAL TABLES ===
    console.log('[INFO] 1/6 Creating internal tables...')
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload"."payload_migrations" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar,
      "batch" numeric,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS "payload"."payload_locked_documents" (
      "id" serial PRIMARY KEY NOT NULL,
      "global_slug" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS "payload"."payload_locked_documents_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "courses_id" varchar,
      "modules_id" varchar,
      "lessons_id" varchar,
      "tasks_id" varchar,
      "media_id" varchar,
      "payload_users_id" varchar
    );
    
    CREATE TABLE IF NOT EXISTS "payload"."payload_preferences" (
      "id" serial PRIMARY KEY NOT NULL,
      "key" varchar,
      "value" jsonb,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS "payload"."payload_preferences_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "payload_users_id" varchar
    );
  `)
  
    // === PAYLOAD USERS ===
    console.log('[INFO] 2/6 Creating payload_users table...')
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload"."payload_users" (
      "id" varchar PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::varchar,
      "role" varchar DEFAULT 'ADMIN' NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "email" varchar NOT NULL,
      "reset_password_token" varchar,
      "reset_password_expiration" timestamp(3) with time zone,
      "salt" varchar,
      "hash" varchar,
      "login_attempts" numeric DEFAULT 0,
      "lock_until" timestamp(3) with time zone
    );
    
    CREATE UNIQUE INDEX IF NOT EXISTS "payload_users_email_idx" ON "payload"."payload_users" ("email");
  `)
  
    // === COURSES ===
    console.log('[INFO] 3/6 Creating courses table...')
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload"."courses" (
      "id" varchar PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::varchar,
      "title" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "description" jsonb,
      "level" varchar DEFAULT 'BEGINNER' NOT NULL,
      "subject" varchar NOT NULL,
      "cover_image_id" varchar,
      "is_published" boolean DEFAULT false,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    
    CREATE UNIQUE INDEX IF NOT EXISTS "courses_slug_idx" ON "payload"."courses" ("slug");
  `)
  
    // === MODULES ===
    console.log('[INFO] 4/6 Creating modules table...')
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload"."modules" (
      "id" varchar PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::varchar,
      "title" varchar NOT NULL,
      "description" jsonb,
      "order_index" numeric NOT NULL,
      "course_id" varchar NOT NULL,
      "is_published" boolean DEFAULT false,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS "modules_course_idx" ON "payload"."modules" ("course_id");
  `)
  
    // === LESSONS ===
    console.log('[INFO] 5/6 Creating lessons table...')
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload"."lessons" (
      "id" varchar PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::varchar,
      "title" varchar NOT NULL,
      "content" jsonb,
      "order_index" numeric NOT NULL,
      "module_id" varchar NOT NULL,
      "course_id" varchar,
      "thumbnail_url" varchar,
      "duration_minutes" numeric,
      "is_published" boolean DEFAULT false,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS "lessons_module_idx" ON "payload"."lessons" ("module_id");
  `)
  
    // === TASKS ===
    console.log('[INFO] 6/6 Creating tasks and media tables...')
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload"."tasks" (
      "id" varchar PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::varchar,
      "title" varchar NOT NULL,
      "question" jsonb NOT NULL,
      "correct_answer" varchar NOT NULL,
      "explanation" jsonb,
      "difficulty" varchar DEFAULT 'MEDIUM' NOT NULL,
      "points" numeric DEFAULT 1 NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    -- NOTE: lesson_id was a deprecated direct FK column; lesson association is now
    -- stored in tasks_rels (hasMany relationship table). The column was intentionally
    -- omitted here and is dropped from any legacy tables in 2026-02-24_drop_deprecated_columns.
  `)
  
  // === MEDIA ===
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload"."media" (
      "id" varchar PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::varchar,
      "alt" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "url" varchar,
      "thumbnail_u_r_l" varchar,
      "filename" varchar,
      "mime_type" varchar,
      "filesize" numeric,
      "width" numeric,
      "height" numeric,
      "focal_x" numeric,
      "focal_y" numeric
    );
  `)
  
    console.log('[SUCCESS] All Payload tables created successfully in migration!')
  } catch (error) {
    console.error('[ERROR] Migration failed with error:', error)
    throw error
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  void db
  void payload
  void req
  throw new Error('Cannot rollback initial schema migration')
}
