import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  console.log('[INFO] Running non-interactive migration: add last_updated_by to lessons...')
  try {
    await db.execute(sql`
      ALTER TABLE IF EXISTS "payload"."lessons"
      ADD COLUMN IF NOT EXISTS "last_updated_by" text;
      -- If the column exists but is integer, cast it to text to accept emails or ids
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema='payload' AND table_name='lessons' AND column_name='last_updated_by' AND data_type='integer'
        ) THEN
          EXECUTE 'ALTER TABLE "payload"."lessons" ALTER COLUMN "last_updated_by" TYPE text USING "last_updated_by"::text';
        END IF;
      END
      $$;
    `)
    console.log('[SUCCESS] last_updated_by column ensured on payload.lessons')
  } catch (error) {
    console.error('[ERROR] Migration add_last_updated_by_to_lessons failed:', error)
    throw error
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  void db
  void payload
  void req
  throw new Error('Cannot rollback add_last_updated_by_to_lessons migration')
}
