/**
 * Quick fix: drops the legacy "question" NOT NULL column from payload.tasks
 * which blocks all new task inserts.
 *
 * Usage: npx tsx scripts/fix-drop-question-column.ts
 */
import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

async function main() {
  const connectionString =
    process.env.PAYLOAD_DATABASE_URL ||
    process.env.DATABASE_URL

  if (!connectionString) {
    console.error('[ERROR] No DATABASE_URL or PAYLOAD_DATABASE_URL set')
    process.exit(1)
  }

  const pool = new Pool({ connectionString })

  try {
    const client = await pool.connect()
    try {
      console.log('[INFO] Checking for legacy "question" column on payload.tasks ...')

      const { rows } = await client.query<{ exists: boolean }>(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'payload'
            AND table_name   = 'tasks'
            AND column_name  = 'question'
        ) AS exists
      `)

      const exists = rows[0]?.exists

      if (!exists) {
        console.log('[OK] "question" column does not exist – nothing to do.')
        return
      }

      console.log('[INFO] "question" column found. Copying any un-migrated data to "prompt" ...')

      await client.query(`
        UPDATE "payload"."tasks"
        SET "prompt" = "question"
        WHERE "prompt" IS NULL
          AND "question" IS NOT NULL
      `)

      console.log('[INFO] Dropping legacy "question" column ...')

      await client.query(`ALTER TABLE "payload"."tasks" DROP COLUMN "question"`)

      console.log('[SUCCESS] "question" column dropped. Task creation should work now.')
    } finally {
      client.release()
    }
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error('[FATAL]', err)
  process.exit(1)
})
