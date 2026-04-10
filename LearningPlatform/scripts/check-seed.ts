/**
 * Exit 0 if at least one NextAuth/Prisma user exists in public."User".
 * Exit 1 if none — staging should run cms:seed (creates admin + public.User).
 */
import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

async function main() {
  const url = process.env.DATABASE_URL || process.env.PAYLOAD_DATABASE_URL
  if (!url) {
    console.error('[ERROR] DATABASE_URL or PAYLOAD_DATABASE_URL is required')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString: url,
    ssl: url.includes('sslmode') ? { rejectUnauthorized: false } : false,
  })

  try {
    const { rows } = await pool.query<{ c: string }>(
      'SELECT COUNT(*)::text AS c FROM public."User"',
    )
    const count = Number.parseInt(rows[0]?.c ?? '0', 10)
    process.exit(count > 0 ? 0 : 1)
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error('[ERROR]', err)
  process.exit(1)
})
