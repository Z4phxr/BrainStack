import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

/**
 * Migration: add `name` and `slug` columns to payload.tasks_tags
 *
 * Rationale: previous migration created a `tag` column; the Tasks collection
 * schema expects `name` and `slug`. This migration adds the two columns and
 * populates `name` from `tag` and `slug` from a normalized value.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  console.log('[INFO] Adding name and slug columns to payload.tasks_tags...')

  await db.execute(sql`
    ALTER TABLE IF EXISTS "payload"."tasks_tags"
      ADD COLUMN IF NOT EXISTS "name" varchar,
      ADD COLUMN IF NOT EXISTS "slug" varchar;
  `)

  // Populate name from legacy "tag" column only if that column still exists.
  // (On fresh installs Payload may have pushed the table without a "tag" column.)
  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'payload'
          AND table_name   = 'tasks_tags'
          AND column_name  = 'tag'
      ) THEN
        UPDATE "payload"."tasks_tags"
          SET "name" = COALESCE("name", "tag")
          WHERE COALESCE("name", '') = '' AND COALESCE("tag", '') <> '';
      END IF;
    END
    $$;
  `)

  // Generate slug from name for any rows that still lack one.
  await db.execute(sql`
    UPDATE "payload"."tasks_tags"
      SET "slug" = LOWER(REGEXP_REPLACE(COALESCE("name", ''), '[^a-zA-Z0-9]+', '-', 'g'))
      WHERE COALESCE("slug", '') = '';
  `)

  console.log('[SUCCESS] Added name and slug to payload.tasks_tags')
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  console.log('[INFO] Dropping name and slug columns from payload.tasks_tags...')

  await db.execute(sql`
    ALTER TABLE IF EXISTS "payload"."tasks_tags"
      DROP COLUMN IF EXISTS "name",
      DROP COLUMN IF EXISTS "slug";
  `)

  console.log('[SUCCESS] Dropped name and slug from payload.tasks_tags')
}
