import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  console.log('[INFO] Running migration: add last_updated_by + created_via to courses...')
  try {
    await db.execute(sql`
      ALTER TABLE IF EXISTS "payload"."courses"
      ADD COLUMN IF NOT EXISTS "last_updated_by" varchar;
      ALTER TABLE IF EXISTS "payload"."courses"
      ADD COLUMN IF NOT EXISTS "created_via" varchar;
    `)
    console.log('[SUCCESS] courses.last_updated_by + courses.created_via ensured')
  } catch (error) {
    console.error('[ERROR] Migration add_course_last_updated_by_created_via failed:', error)
    throw error
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  void db
  void payload
  void req
  throw new Error('Cannot rollback add_course_last_updated_by_created_via migration')
}
