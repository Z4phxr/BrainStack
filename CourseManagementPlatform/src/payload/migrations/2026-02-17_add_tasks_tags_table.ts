import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

/**
 * Migration: Add tasks_tags table
 * 
 * Problem: The tasks_tags join table was never created, causing errors when querying tasks:
 * "relation "payload.tasks_tags" does not exist"
 * 
 * Solution: Create the tasks_tags table to support the tags array field in Tasks collection
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  console.log('[INFO] Creating tasks_tags table...')
  
  // Create table without foreign key constraint (Payload manages relationships)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "payload"."tasks_tags" (
      "id" varchar PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::varchar,
      "_order" integer NOT NULL DEFAULT 1,
      "_parent_id" varchar NOT NULL,
      "tag" varchar
    );
    
    CREATE INDEX IF NOT EXISTS "tasks_tags_order_idx" ON "payload"."tasks_tags" ("_order");
    CREATE INDEX IF NOT EXISTS "tasks_tags_parent_idx" ON "payload"."tasks_tags" ("_parent_id");
  `)

  console.log('[SUCCESS] Created tasks_tags table')
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  console.log('[INFO] Dropping tasks_tags table...')
  
  await db.execute(sql`
    DROP TABLE IF EXISTS "payload"."tasks_tags" CASCADE;
  `)
  
  console.log('[SUCCESS] Dropped tasks_tags table')
}
