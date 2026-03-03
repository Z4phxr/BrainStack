import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  console.log('[INFO] Running migration: fix block field types (width/align -> varchar)')
  try {
    await db.execute(sql`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='payload' AND table_name='lessons_blocks_image' AND column_name='width') THEN
          BEGIN
            IF (SELECT data_type FROM information_schema.columns WHERE table_schema = 'payload' AND table_name = 'lessons_blocks_image' AND column_name = 'width') IN ('numeric','integer','double precision') THEN
              ALTER TABLE "payload"."lessons_blocks_image" ALTER COLUMN width TYPE varchar USING width::varchar;
            END IF;
          EXCEPTION WHEN others THEN
            RAISE NOTICE 'Could not alter lessons_blocks_image.width: %', SQLERRM;
          END;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='payload' AND table_name='lessons_blocks_image' AND column_name='align') THEN
          BEGIN
            IF (SELECT data_type FROM information_schema.columns WHERE table_schema = 'payload' AND table_name = 'lessons_blocks_image' AND column_name = 'align') IN ('numeric','integer','double precision') THEN
              ALTER TABLE "payload"."lessons_blocks_image" ALTER COLUMN align TYPE varchar USING align::varchar;
            END IF;
          EXCEPTION WHEN others THEN
            RAISE NOTICE 'Could not alter lessons_blocks_image.align: %', SQLERRM;
          END;
        END IF;
      END$$;
    `)
    console.log('[SUCCESS] Block field type fixes applied')
  } catch (err) {
    console.error('[ERROR] Migration failed:', err)
    throw err
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  void db
  throw new Error('Cannot rollback block field type migration')
}
