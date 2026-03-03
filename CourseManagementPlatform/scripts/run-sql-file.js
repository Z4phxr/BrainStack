require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

async function main() {
  const fileArg = process.argv[2]
  if (!fileArg) {
    console.error('Usage: node scripts/run-sql-file.js <sql-file-path>')
    process.exit(1)
  }

  const sqlPath = path.isAbsolute(fileArg) ? fileArg : path.join(process.cwd(), fileArg)
  if (!fs.existsSync(sqlPath)) {
    console.error('SQL file not found:', sqlPath)
    process.exit(1)
  }

  const sql = fs.readFileSync(sqlPath, 'utf8')
  const connectionString = process.env.PAYLOAD_DATABASE_URL || process.env.DATABASE_URL
  if (!connectionString) {
    console.error('No DATABASE_URL or PAYLOAD_DATABASE_URL set in environment')
    process.exit(1)
  }

  const pool = new Pool({ connectionString })
  try {
    console.log('[INFO] Running SQL file:', sqlPath)
    await pool.query(sql)
    console.log('[SUCCESS] SQL executed successfully')
  } catch (err) {
    console.error('[ERROR] Failed to execute SQL:', err)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
