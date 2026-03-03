import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

/**
 * Creates the `payload.lessons_blocks_table` table required by the TableBlock
 * added in feat/table_block.
 *
 * Payload generates a separate child table for each block type registered in a
 * `blocks` field.  Without this table every query against the lessons collection
 * fails with: relation "payload.lessons_blocks_table" does not exist
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  console.log('[INFO] Running migration: add lessons_blocks_table...')

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload"."lessons_blocks_table" (
      "id"          varchar PRIMARY KEY  NOT NULL DEFAULT gen_random_uuid()::varchar,
      "_order"      integer,
      "_path"       varchar,
      "_parent_id"  varchar              NOT NULL,
      "caption"     varchar,
      "has_headers" boolean              DEFAULT true,
      "headers"     jsonb,
      "rows"        jsonb,
      "block_name"  varchar
    );

    CREATE INDEX IF NOT EXISTS "lessons_blocks_table_parent_idx"
      ON "payload"."lessons_blocks_table" ("_parent_id");

    CREATE INDEX IF NOT EXISTS "lessons_blocks_table_order_idx"
      ON "payload"."lessons_blocks_table" ("_order");
  `)

  console.log('[SUCCESS] lessons_blocks_table created (or already existed).')
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  console.log('[INFO] Rolling back: dropping lessons_blocks_table...')

  await db.execute(sql`
    DROP TABLE IF EXISTS "payload"."lessons_blocks_table";
  `)

  console.log('[SUCCESS] lessons_blocks_table dropped.')
}
