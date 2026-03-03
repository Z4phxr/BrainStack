import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

/**
 * Migration: drop all legacy/deprecated columns that are no longer part of
 * any Payload collection definition. These were leftovers from old schemas
 * and caused Payload's schema:push to prompt on every server start.
 *
 * Columns dropped:
 *   tasks          : lesson_id, explanation, difficulty
 *   modules        : description, order_index
 *   lessons        : order_index, thumbnail_url, duration_minutes
 *   courses        : subject
 *   tasks_choices  : created_at
 *   tasks_tags     : tag  (stray column from a previous migration attempt)
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  console.log('[INFO] Dropping deprecated columns...')

  await db.execute(sql`
    -- tasks
    ALTER TABLE "payload"."tasks"
      DROP COLUMN IF EXISTS "lesson_id",
      DROP COLUMN IF EXISTS "explanation",
      DROP COLUMN IF EXISTS "difficulty";

    -- modules
    ALTER TABLE "payload"."modules"
      DROP COLUMN IF EXISTS "description",
      DROP COLUMN IF EXISTS "order_index";

    -- lessons
    ALTER TABLE "payload"."lessons"
      DROP COLUMN IF EXISTS "order_index",
      DROP COLUMN IF EXISTS "thumbnail_url",
      DROP COLUMN IF EXISTS "duration_minutes";

    -- courses
    ALTER TABLE "payload"."courses"
      DROP COLUMN IF EXISTS "subject";

    -- tasks_choices
    ALTER TABLE "payload"."tasks_choices"
      DROP COLUMN IF EXISTS "created_at";

    -- tasks_tags (stray legacy column)
    ALTER TABLE "payload"."tasks_tags"
      DROP COLUMN IF EXISTS "tag";
  `)

  console.log('[SUCCESS] Deprecated columns dropped.')
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // No restoration — these columns are intentionally removed.
  console.log('[INFO] down() is a no-op for this migration.')
}
