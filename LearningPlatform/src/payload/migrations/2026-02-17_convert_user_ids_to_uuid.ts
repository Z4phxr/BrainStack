import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

/**
 * Migration: Convert payload_users IDs from integer to UUID/varchar
 * 
 * This migration:
 * 1. Enables pgcrypto extension for UUID generation
 * 2. Converts payload_users.id from integer to varchar (preserving existing IDs as strings)
 * 3. Updates all foreign key columns (payload_users_id) to varchar
 * 4. Optionally generates new UUIDs for existing records (commented out by default)
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  console.log('[INFO] Starting user ID migration: integer → varchar/UUID...')
  
  try {
    // Step 1: Enable pgcrypto extension for UUID generation
    console.log('[INFO] 1/4 Enabling pgcrypto extension...')
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`)
    
    // Step 2: Convert foreign key columns first (they reference payload_users)
    console.log('[INFO] 2/4 Converting foreign key columns to varchar...')
    
    // Convert payload_locked_documents_rels.payload_users_id
    await db.execute(sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema='payload' 
            AND table_name='payload_locked_documents_rels' 
            AND column_name='payload_users_id' 
            AND data_type IN ('integer', 'numeric', 'bigint')
        ) THEN
          ALTER TABLE "payload"."payload_locked_documents_rels" 
          ALTER COLUMN "payload_users_id" TYPE varchar 
          USING "payload_users_id"::text;
          
          RAISE NOTICE 'Converted payload_locked_documents_rels.payload_users_id to varchar';
        END IF;
      END
      $$;
    `)
    
    // Convert payload_preferences_rels.payload_users_id
    await db.execute(sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema='payload' 
            AND table_name='payload_preferences_rels' 
            AND column_name='payload_users_id' 
            AND data_type IN ('integer', 'numeric', 'bigint')
        ) THEN
          ALTER TABLE "payload"."payload_preferences_rels" 
          ALTER COLUMN "payload_users_id" TYPE varchar 
          USING "payload_users_id"::text;
          
          RAISE NOTICE 'Converted payload_preferences_rels.payload_users_id to varchar';
        END IF;
      END
      $$;
    `)
    
    // Convert payload_users_sessions._parent_id (references payload_users)
    await db.execute(sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema='payload' 
            AND table_name='payload_users_sessions' 
            AND column_name='_parent_id' 
            AND data_type IN ('integer', 'numeric', 'bigint')
        ) THEN
          ALTER TABLE "payload"."payload_users_sessions" 
          ALTER COLUMN "_parent_id" TYPE varchar 
          USING "_parent_id"::text;
          
          RAISE NOTICE 'Converted payload_users_sessions._parent_id to varchar';
        END IF;
      END
      $$;
    `)
    
    // Step 3: Convert payload_users.id (primary key)
    console.log('[INFO] 3/4 Converting payload_users.id to varchar...')
    await db.execute(sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema='payload' 
            AND table_name='payload_users' 
            AND column_name='id' 
            AND data_type IN ('integer', 'numeric', 'bigint')
        ) THEN
          -- Drop primary key constraint temporarily
          ALTER TABLE "payload"."payload_users" DROP CONSTRAINT IF EXISTS "payload_users_pkey";
          
          -- Convert id to varchar (preserves existing integer IDs as strings)
          ALTER TABLE "payload"."payload_users" 
          ALTER COLUMN "id" TYPE varchar 
          USING "id"::text;
          
          -- Re-add primary key
          ALTER TABLE "payload"."payload_users" 
          ADD PRIMARY KEY ("id");
          
          RAISE NOTICE 'Converted payload_users.id to varchar and re-added primary key';
        END IF;
      END
      $$;
    `)
    
    // Step 4: (Optional) Generate new UUIDs for existing records
    // UNCOMMENT BELOW if you want to replace existing integer-string IDs with proper UUIDs
    // WARNING: This will change existing IDs and may break references in other systems
    /*
    console.log('[INFO] 4/4 Generating UUIDs for existing records (OPTIONAL)...')
    await db.execute(sql`
      DO $$
      DECLARE
        rec RECORD;
        new_uuid varchar;
      BEGIN
        -- For each existing user, generate a UUID and update all references
        FOR rec IN SELECT id FROM "payload"."payload_users" LOOP
          new_uuid := gen_random_uuid()::text;
          
          -- Update foreign keys first
          UPDATE "payload"."payload_locked_documents_rels" 
          SET "payload_users_id" = new_uuid 
          WHERE "payload_users_id" = rec.id;
          
          UPDATE "payload"."payload_preferences_rels" 
          SET "payload_users_id" = new_uuid 
          WHERE "payload_users_id" = rec.id;
          
          UPDATE "payload"."payload_users_sessions" 
          SET "_parent_id" = new_uuid 
          WHERE "_parent_id" = rec.id;
          
          -- Update the user ID itself
          UPDATE "payload"."payload_users" 
          SET "id" = new_uuid 
          WHERE "id" = rec.id;
          
          RAISE NOTICE 'Replaced user ID % with UUID %', rec.id, new_uuid;
        END LOOP;
      END
      $$;
    `)
    */
    
    console.log('[SUCCESS] User ID migration completed successfully!')
    console.log('[INFO] payload_users.id and related columns are now varchar type')
    console.log('[INFO] Payload adapter configured with idType: "uuid" will create UUIDs for new users')
    
  } catch (error) {
    console.error('[ERROR] User ID migration failed:', error)
    throw error
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  void db
  void payload
  void req
  console.warn('[WARN] Rollback of user ID migration is not implemented')
  console.warn('[WARN] Manual database restoration from backup required')
  throw new Error('Cannot automatically rollback convert_user_ids_to_uuid migration')
}
