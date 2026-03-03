/**
 * Creates the lessons_blocks_table in the payload schema.
 * Usage: npx tsx scripts/fix-create-blocks-table.ts
 */
import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

async function main() {
  const connectionString = process.env.PAYLOAD_DATABASE_URL || process.env.DATABASE_URL
  if (!connectionString) {
    console.error('[ERROR] No DATABASE_URL or PAYLOAD_DATABASE_URL set')
    process.exit(1)
  }

  const pool = new Pool({ connectionString })
  const client = await pool.connect()
  try {
    console.log('[INFO] Creating lessons_blocks_table...')

    await client.query(`
      CREATE TABLE IF NOT EXISTS payload.lessons_blocks_table (
        id          varchar PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::varchar,
        _order      integer,
        _path       varchar,
        _parent_id  varchar NOT NULL,
        caption     varchar,
        has_headers boolean DEFAULT true,
        headers     jsonb,
        rows        jsonb,
        block_name  varchar
      )
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS lessons_blocks_table_parent_idx
        ON payload.lessons_blocks_table (_parent_id)
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS lessons_blocks_table_order_idx
        ON payload.lessons_blocks_table (_order)
    `)

    const verify = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'payload' AND table_name = 'lessons_blocks_table'
    `)

    if (verify.rows.length > 0) {
      console.log('[SUCCESS] lessons_blocks_table exists and is ready.')
    } else {
      console.error('[ERROR] Table was not created.')
      process.exit(1)
    }
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error('[FATAL]', err)
  process.exit(1)
})
