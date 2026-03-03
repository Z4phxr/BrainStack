// Check columns in Payload tasks table
import 'dotenv/config'
import { Pool } from 'pg'

const pool = new Pool({ 
  connectionString: process.env.PAYLOAD_DATABASE_URL || process.env.DATABASE_URL 
})

async function checkTasksColumns() {
  try {
    console.log('[INFO] Checking tasks table columns...')
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'payload' 
      AND table_name = 'tasks'
      ORDER BY ordinal_position
    `)
    
    console.log('\n=== Columns in payload.tasks ===')
    result.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`)
    })
    
    // Check specifically for auto_grade column
    const hasAutoGrade = result.rows.some(row => row.column_name === 'auto_grade')
    console.log(`\n[${hasAutoGrade ? 'SUCCESS' : 'ERROR'}] auto_grade column ${hasAutoGrade ? 'EXISTS' : 'DOES NOT EXIST'}`)
    
    await pool.end()
    process.exit(hasAutoGrade ? 0 : 1)
  } catch (error) {
    console.error('[ERROR] Error checking tasks columns:', error)
    await pool.end()
    process.exit(1)
  }
}

checkTasksColumns()
