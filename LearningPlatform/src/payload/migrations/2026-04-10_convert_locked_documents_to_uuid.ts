import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

/**
 * Align Payload internal lock tables with `idType: 'uuid'` (postgresAdapter).
 *
 * Early `2026-01-24_initial_schema` created `payload_locked_documents` and
 * `payload_locked_documents_rels` with SERIAL ids. Newer Payload + Drizzle push
 * expect UUID PKs, which fails with:
 *   ALTER TABLE ... payload_locked_documents ... SET DATA TYPE uuid
 *
 * These tables only store ephemeral edit locks — safe to truncate locally.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  const typeCheck = await db.execute(sql`
    SELECT udt_name
    FROM information_schema.columns
    WHERE table_schema = 'payload'
      AND table_name = 'payload_locked_documents'
      AND column_name = 'id'
  `)
  const rows = typeCheck.rows as Array<{ udt_name: string }>
  if (!rows.length) {
    console.log('[INFO] payload_locked_documents missing — skip locked-documents uuid migration.')
    return
  }
  if (rows[0].udt_name === 'uuid') {
    console.log('[INFO] payload_locked_documents.id is already uuid — nothing to do.')
    return
  }

  console.log('[INFO] Converting payload lock tables from integer ids to uuid...')

  await db.execute(sql`
    DO $$
    DECLARE r record;
    BEGIN
      IF to_regclass('payload.payload_locked_documents_rels') IS NULL THEN
        RAISE NOTICE 'payload_locked_documents_rels missing — only converting parent if present';
      ELSE
        FOR r IN (
          SELECT c.conname
          FROM pg_constraint c
          JOIN pg_class cl ON cl.oid = c.conrelid
          JOIN pg_namespace n ON n.oid = cl.relnamespace
          WHERE n.nspname = 'payload'
            AND cl.relname = 'payload_locked_documents_rels'
            AND c.contype = 'f'
        ) LOOP
          EXECUTE format(
            'ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS %I',
            r.conname
          );
        END LOOP;
        EXECUTE 'TRUNCATE TABLE "payload"."payload_locked_documents_rels" RESTART IDENTITY';
      END IF;
    END
    $$;

    TRUNCATE TABLE "payload"."payload_locked_documents" RESTART IDENTITY;

    ALTER TABLE "payload"."payload_locked_documents"
      DROP CONSTRAINT IF EXISTS payload_locked_documents_pkey;
    ALTER TABLE "payload"."payload_locked_documents" ALTER COLUMN "id" DROP DEFAULT;
    DROP SEQUENCE IF EXISTS "payload"."payload_locked_documents_id_seq" CASCADE;
    ALTER TABLE "payload"."payload_locked_documents"
      ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
    ALTER TABLE "payload"."payload_locked_documents"
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
    ALTER TABLE "payload"."payload_locked_documents" ADD PRIMARY KEY ("id");
  `)

  const relsExists = await db.execute(sql`
    SELECT 1 AS ok
    FROM information_schema.tables
    WHERE table_schema = 'payload' AND table_name = 'payload_locked_documents_rels'
  `)
  const relRows = relsExists.rows as Array<{ ok: number }>
  if (relRows.length > 0) {
    await db.execute(sql`
      ALTER TABLE "payload"."payload_locked_documents_rels"
        DROP CONSTRAINT IF EXISTS payload_locked_documents_rels_pkey;
      ALTER TABLE "payload"."payload_locked_documents_rels" ALTER COLUMN "id" DROP DEFAULT;
      DROP SEQUENCE IF EXISTS "payload"."payload_locked_documents_rels_id_seq" CASCADE;
      ALTER TABLE "payload"."payload_locked_documents_rels"
        ALTER COLUMN "id" TYPE uuid USING gen_random_uuid();
      ALTER TABLE "payload"."payload_locked_documents_rels"
        ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
      ALTER TABLE "payload"."payload_locked_documents_rels"
        ALTER COLUMN "parent_id" TYPE uuid USING gen_random_uuid();
      ALTER TABLE "payload"."payload_locked_documents_rels" ADD PRIMARY KEY ("id");
    `)
  }

  console.log('[SUCCESS] Lock tables now use uuid ids.')
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  void db
  console.log('[INFO] Skipping down migration — uuid → serial for lock tables not supported.')
}
