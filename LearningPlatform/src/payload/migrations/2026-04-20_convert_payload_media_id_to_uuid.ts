import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

/**
 * Align `payload.media.id` with postgresAdapter `idType: 'uuid'`.
 *
 * `2026-01-24_initial_schema` created `media.id` as varchar (uuid strings). Payload +
 * Drizzle push then emit `ALTER COLUMN id SET DATA TYPE uuid` without USING, which
 * PostgreSQL rejects. We convert explicitly with USING.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  const convertMediaReferenceColumnToUuid = async (table: string, column: string): Promise<void> => {
    const columnTypeResult = await db.execute(sql`
      SELECT udt_name
      FROM information_schema.columns
      WHERE table_schema = 'payload'
        AND table_name = ${table}
        AND column_name = ${column}
    `)
    const typeRows = columnTypeResult.rows as Array<{ udt_name: string }>
    if (!typeRows.length) {
      return
    }
    if (typeRows[0].udt_name === 'uuid') {
      return
    }

    console.log(`[INFO] Converting payload.${table}.${column} to uuid...`)
    await db.execute(
      sql.raw(`
        ALTER TABLE "payload"."${table}"
          ALTER COLUMN "${column}" TYPE uuid
          USING (
            CASE
              WHEN "${column}" IS NULL OR btrim("${column}") = '' THEN NULL
              ELSE "${column}"::uuid
            END
          );
      `),
    )
  }

  const result = await db.execute(sql`
    SELECT udt_name
    FROM information_schema.columns
    WHERE table_schema = 'payload'
      AND table_name = 'media'
      AND column_name = 'id'
  `)
  const rows = result.rows as Array<{ udt_name: string }>
  if (!rows.length) {
    console.log('[INFO] payload.media missing — skip media id uuid migration.')
    return
  }
  if (rows[0].udt_name === 'uuid') {
    console.log('[INFO] payload.media.id is already uuid — nothing to do.')
    return
  }

  console.log('[INFO] Converting payload.media.id to uuid...')

  await db.execute(sql`
    ALTER TABLE "payload"."media" ALTER COLUMN "id" DROP DEFAULT;
  `)

  await db.execute(sql`
    ALTER TABLE "payload"."media"
      ALTER COLUMN "id" TYPE uuid USING ("id"::uuid);
  `)

  await db.execute(sql`
    ALTER TABLE "payload"."media"
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
  `)

  // Keep media-reference columns aligned with media.id (uuid) to avoid uuid=varchar errors.
  await convertMediaReferenceColumnToUuid('tasks', 'question_media_id')
  await convertMediaReferenceColumnToUuid('tasks', 'solution_media_id')
  await convertMediaReferenceColumnToUuid('payload_locked_documents_rels', 'media_id')
  await convertMediaReferenceColumnToUuid('courses', 'cover_image_id')

  console.log('[SUCCESS] payload.media.id converted to uuid.')
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  void db
  console.log('[INFO] Skipping down — uuid → varchar for media.id not supported here.')
}
