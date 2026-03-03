import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    -- Convert subjects.id from integer to varchar
    ALTER TABLE payload.subjects ALTER COLUMN id TYPE VARCHAR USING id::VARCHAR;
  `)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    -- Revert subjects.id back to integer
    ALTER TABLE payload.subjects ALTER COLUMN id TYPE INTEGER USING id::INTEGER;
  `)
}
