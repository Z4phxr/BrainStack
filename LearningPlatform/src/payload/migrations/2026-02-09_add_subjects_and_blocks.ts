import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  console.log('[INFO] Running migration: add subjects, sessions, and lesson block tables...')
  try {
    await db.execute(sql`
    -- Subjects collection table
    CREATE TABLE IF NOT EXISTS "payload"."subjects" (
      "id" varchar PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::varchar,
      "name" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "subjects_slug_idx" ON "payload"."subjects" ("slug");

    -- Ensure courses has subject_id for relationship (no longer needed - using 'subject' column)
    -- Courses.subject field is already varchar in initial migration
    
    -- Sessions for payload users
    CREATE TABLE IF NOT EXISTS "payload"."payload_users_sessions" (
      "id" serial PRIMARY KEY NOT NULL,
      "_order" integer,
      "_parent_id" varchar NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "expires_at" timestamp(3) with time zone
    );

    -- Add subjects_id to locked documents rels so queries referencing subjects won't fail
    ALTER TABLE IF EXISTS "payload"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "subjects_id" varchar;

    -- Lesson blocks and attachments (basic schemas expected by payload queries)
    CREATE TABLE IF NOT EXISTS "payload"."lessons_blocks_text" (
      "id" varchar PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::varchar,
      "_order" integer,
      "_path" varchar,
      "_parent_id" varchar NOT NULL,
      "content" jsonb,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "payload"."lessons_blocks_image" (
      "id" varchar PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::varchar,
      "_order" integer,
      "_path" varchar,
      "_parent_id" varchar NOT NULL,
      "image_id" varchar,
      "caption" varchar,
      "align" varchar,
      "width" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "payload"."lessons_blocks_math" (
      "id" varchar PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::varchar,
      "_order" integer,
      "_path" varchar,
      "_parent_id" varchar NOT NULL,
      "latex" text,
      "display_mode" varchar,
      "note" text,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "payload"."lessons_blocks_callout" (
      "id" varchar PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::varchar,
      "_order" integer,
      "_path" varchar,
      "_parent_id" varchar NOT NULL,
      "variant" varchar,
      "title" varchar,
      "content" jsonb,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "payload"."lessons_blocks_video" (
      "id" varchar PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::varchar,
      "_order" integer,
      "_path" varchar,
      "_parent_id" varchar NOT NULL,
      "video_url" varchar,
      "title" varchar,
      "caption" varchar,
      "aspect_ratio" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "payload"."lessons_attachments" (
      "id" varchar PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::varchar,
      "_order" integer,
      "_parent_id" varchar NOT NULL,
      "file_id" integer,
      "description" varchar
    );

    -- Tasks choices child table used by multiple-choice tasks
    CREATE TABLE IF NOT EXISTS "payload"."tasks_choices" (
      "id" varchar PRIMARY KEY NOT NULL,
      "_order" integer,
      "_parent_id" varchar NOT NULL,
      "text" varchar,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    -- Convert existing integer id/_parent_id columns to text if necessary (idempotent)
    DO $$
    BEGIN
      -- Ensure parent lesson IDs are varchar so comparisons with block _parent_id (varchar) work
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='payload' AND table_name='lessons' AND column_name='id' AND data_type='integer') THEN
        ALTER TABLE "payload"."lessons" ALTER COLUMN id TYPE varchar USING id::varchar;
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='payload' AND table_name='lessons_blocks_text' AND column_name='id' AND data_type='integer') THEN
        ALTER TABLE "payload"."lessons_blocks_text" ALTER COLUMN id TYPE varchar USING id::varchar;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='payload' AND table_name='lessons_blocks_text' AND column_name='_parent_id' AND data_type='integer') THEN
        ALTER TABLE "payload"."lessons_blocks_text" ALTER COLUMN _parent_id TYPE varchar USING _parent_id::varchar;
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='payload' AND table_name='lessons_blocks_image' AND column_name='id' AND data_type='integer') THEN
        ALTER TABLE "payload"."lessons_blocks_image" ALTER COLUMN id TYPE varchar USING id::varchar;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='payload' AND table_name='lessons_blocks_image' AND column_name='_parent_id' AND data_type='integer') THEN
        ALTER TABLE "payload"."lessons_blocks_image" ALTER COLUMN _parent_id TYPE varchar USING _parent_id::varchar;
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='payload' AND table_name='lessons_blocks_math' AND column_name='id' AND data_type='integer') THEN
        ALTER TABLE "payload"."lessons_blocks_math" ALTER COLUMN id TYPE varchar USING id::varchar;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='payload' AND table_name='lessons_blocks_math' AND column_name='_parent_id' AND data_type='integer') THEN
        ALTER TABLE "payload"."lessons_blocks_math" ALTER COLUMN _parent_id TYPE varchar USING _parent_id::varchar;
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='payload' AND table_name='lessons_blocks_callout' AND column_name='id' AND data_type='integer') THEN
        ALTER TABLE "payload"."lessons_blocks_callout" ALTER COLUMN id TYPE varchar USING id::varchar;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='payload' AND table_name='lessons_blocks_callout' AND column_name='_parent_id' AND data_type='integer') THEN
        ALTER TABLE "payload"."lessons_blocks_callout" ALTER COLUMN _parent_id TYPE varchar USING _parent_id::varchar;
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='payload' AND table_name='lessons_blocks_video' AND column_name='id' AND data_type='integer') THEN
        ALTER TABLE "payload"."lessons_blocks_video" ALTER COLUMN id TYPE varchar USING id::varchar;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='payload' AND table_name='lessons_blocks_video' AND column_name='_parent_id' AND data_type='integer') THEN
        ALTER TABLE "payload"."lessons_blocks_video" ALTER COLUMN _parent_id TYPE varchar USING _parent_id::varchar;
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='payload' AND table_name='lessons_attachments' AND column_name='id' AND data_type='integer') THEN
        ALTER TABLE "payload"."lessons_attachments" ALTER COLUMN id TYPE varchar USING id::varchar;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='payload' AND table_name='lessons_attachments' AND column_name='_parent_id' AND data_type='integer') THEN
        ALTER TABLE "payload"."lessons_attachments" ALTER COLUMN _parent_id TYPE varchar USING _parent_id::varchar;
      END IF;
      -- Ensure tasks.id is varchar before converting tasks_choices._parent_id
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='payload' AND table_name='tasks' AND column_name='id' AND data_type='integer') THEN
        ALTER TABLE "payload"."tasks" ALTER COLUMN id TYPE varchar USING id::varchar;
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='payload' AND table_name='tasks_choices' AND column_name='id' AND data_type='integer') THEN
        ALTER TABLE "payload"."tasks_choices" ALTER COLUMN id TYPE varchar USING id::varchar;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='payload' AND table_name='tasks_choices' AND column_name='_parent_id' AND data_type='integer') THEN
        ALTER TABLE "payload"."tasks_choices" ALTER COLUMN _parent_id TYPE varchar USING _parent_id::varchar;
      END IF;
    END
    $$;
    `)

    console.log('[SUCCESS] Subjects and block tables ensured')
  } catch (err) {
    console.error('[ERROR] Migration failed:', err)
    throw err
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  void db
  throw new Error('Cannot rollback subjects/blocks migration')
}
