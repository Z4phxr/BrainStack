import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

/**
 * Migration: ensure payload.subjects.id is uuid type.
 *
 * History:
 *   integer → varchar (2026-02-17_convert_subjects_ids.ts)
 *   varchar → uuid     (applied directly via fix-subjects-uuid.ts script on 2026-02-24)
 *
 * This migration is a NO-OP guard: it checks the column type and only runs the
 * conversion if the column is somehow still varchar (should not happen in practice).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Check current type; skip if already uuid
  const result = await db.execute(sql`
    SELECT udt_name
    FROM information_schema.columns
    WHERE table_schema = 'payload'
      AND table_name = 'subjects'
      AND column_name = 'id'
  `)
  const rows = result.rows as Array<{ udt_name: string }>
  if (!rows.length || rows[0].udt_name === 'uuid') {
    console.log('[INFO] subjects.id is already uuid — nothing to do.')
    return
  }

  console.log('[INFO] Converting payload.subjects.id to uuid...')
  await db.execute(sql`
    ALTER TABLE "payload"."subjects" DROP CONSTRAINT IF EXISTS subjects_pkey;
    ALTER TABLE "payload"."subjects" ALTER COLUMN id DROP DEFAULT;
    ALTER TABLE "payload"."subjects" ALTER COLUMN id TYPE uuid USING id::uuid;
    ALTER TABLE "payload"."subjects" ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);
  `)
  console.log('[SUCCESS] subjects.id converted to uuid.')
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  console.log('[INFO] Skipping down migration — uuid → varchar conversion not needed.')
}

