/**
 * Exit 0 if payload.courses has at least one row.
 * Exit 1 if empty — start-staging.sh may run cms:seed (admin/bootstrap only; use content import for curriculum).
 */
import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

async function main() {
  const url = process.env.PAYLOAD_DATABASE_URL || process.env.DATABASE_URL
  if (!url) {
    console.error('[ERROR] PAYLOAD_DATABASE_URL or DATABASE_URL is required')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString: url,
    ssl: url.includes('sslmode') ? { rejectUnauthorized: false } : false,
  })

  try {
    const { rows } = await pool.query<{ c: string }>(
      'SELECT COUNT(*)::text AS c FROM payload.courses',
    )
    const count = Number.parseInt(rows[0]?.c ?? '0', 10)
    process.exit(count > 0 ? 0 : 1)
  } catch (e) {
    console.error('[ERROR] Could not read payload.courses (schema missing?)', e)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error('[ERROR]', err)
  process.exit(1)
})
