// Check if Payload tables exist in database
import 'dotenv/config'
import { Pool } from 'pg'

const pool = new Pool({ 
  connectionString: process.env.PAYLOAD_DATABASE_URL || process.env.DATABASE_URL 
})

async function checkPayloadTables() {
  try {
    console.log('[INFO] Checking if Payload tables exist...')
    
    // Check if payload schema exists
    const schemaResult = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'payload'
    `)
    
    if (schemaResult.rows.length === 0) {
      console.log('[ERROR] Payload schema does not exist')
      await pool.end()
      process.exit(1)
    }
    
    // Check if courses table exists
    const tableResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'payload' 
      AND table_name = 'courses'
    `)
    
    if (tableResult.rows.length === 0) {
      console.log('[ERROR] Payload tables do not exist')
      await pool.end()
      process.exit(1)
    }
    
    console.log('[SUCCESS] Payload tables exist')
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('[ERROR] Error checking Payload tables:', error)
    await pool.end()
    process.exit(1)
  }
}

checkPayloadTables()
