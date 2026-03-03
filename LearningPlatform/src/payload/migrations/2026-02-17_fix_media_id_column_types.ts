import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

/**
 * Migration: Fix media ID column types in tasks table
 * 
 * Problem: question_media_id and solution_media_id were created as integer columns,
 * but Payload CMS uses string IDs by default. This causes type mismatch errors:
 * "operator does not exist: integer = character varying"
 * 
 * Solution: Convert these columns from integer to varchar to match Payload's expectations
 */

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  // Convert question_media_id from integer to varchar
  await db.execute(sql`
    ALTER TABLE "payload"."tasks" 
    ALTER COLUMN "question_media_id" TYPE varchar USING "question_media_id"::varchar;
  `)

  // Convert solution_media_id from integer to varchar
  await db.execute(sql`
    ALTER TABLE "payload"."tasks" 
    ALTER COLUMN "solution_media_id" TYPE varchar USING "solution_media_id"::varchar;
  `)

  console.log('[SUCCESS] Converted media ID columns from integer to varchar')
}

export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  // Rollback: Convert back to integer
  // Warning: This may fail if there are non-numeric values
  await db.execute(sql`
    ALTER TABLE "payload"."tasks" 
    ALTER COLUMN "question_media_id" TYPE integer USING "question_media_id"::integer;
  `)

  await db.execute(sql`
    ALTER TABLE "payload"."tasks" 
    ALTER COLUMN "solution_media_id" TYPE integer USING "solution_media_id"::integer;
  `)

  console.log('[SUCCESS] Rolled back media ID columns to integer')
}
