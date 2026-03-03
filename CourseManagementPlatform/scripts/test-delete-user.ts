#!/usr/bin/env tsx
/**
 * Test DELETE operations on Payload collections via API
 * Enables SQL query logging to inspect generated queries
 */

import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@/src/payload/payload.config'

async function testDelete() {
  console.log('[TEST] Initializing Payload with SQL logging...')
  
  // Get Payload instance
  const payload = await getPayloadHMR({ config })
  
  try {
    // List all users
    console.log('\n[TEST] 1/3 Fetching all users...')
    const users = await payload.find({
      collection: 'payload-users',
      limit: 10,
    })
    
    console.log(`[TEST] Found ${users.totalDocs} user(s):`)
    users.docs.forEach((doc: any) => {
      console.log(`  - ID: ${doc.id} | Email: ${doc.email} | Role: ${doc.role}`)
    })
    
    if (users.docs.length === 0) {
      console.log('[TEST] No users to delete - creating a test user first...')
      
      const testUser = await payload.create({
        collection: 'payload-users',
        data: {
          email: `test-delete-${Date.now()}@example.com`,
          password: 'test123456',
          role: 'STUDENT',
        },
      })
      
      console.log(`[TEST] Created test user: ${testUser.id} | ${testUser.email}`)
      
      // Now delete it
      console.log(`\n[TEST] 2/3 Attempting to DELETE test user ${testUser.id}...`)
      console.log('[SQL] Watch for DELETE query below:')
      
      const deleted = await payload.delete({
        collection: 'payload-users',
        id: testUser.id,
      })
      
      console.log(`[SUCCESS] Deleted user: ${JSON.stringify(deleted, null, 2)}`)
      
    } else {
      console.log('\n[TEST] 2/3 Skipping actual DELETE (existing user found)')
      console.log('[INFO] To test DELETE, manually call:')
      console.log(`  await payload.delete({ collection: 'payload-users', id: '${users.docs[0].id}' })`)
    }
    
    // Verify final count
    console.log('\n[TEST] 3/3 Final user count...')
    const finalUsers = await payload.find({
      collection: 'payload-users',
      limit: 1,
    })
    console.log(`[TEST] Total users remaining: ${finalUsers.totalDocs}`)
    
  } catch (error) {
    console.error('[ERROR] Test failed:', error)
    if (error instanceof Error) {
      console.error('[ERROR] Message:', error.message)
      console.error('[ERROR] Stack:', error.stack)
    }
    process.exit(1)
  } finally {
    // Close DB connection
    if (payload.db && typeof payload.db.destroy === 'function') {
      await payload.db.destroy()
    }
    process.exit(0)
  }
}

// Run test
testDelete().catch((err) => {
  console.error('[FATAL]', err)
  process.exit(1)
})
