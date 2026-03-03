import { config } from 'dotenv'
import { beforeAll, afterAll, afterEach } from 'vitest'

// Load environment variables FIRST before any other imports
config()

// Import test-specific Prisma client
import { prisma } from './test-utils'

// Check if we need database at runtime (not at import time)
const needsDatabase = () => 
  process.env.DATABASE_URL && 
  !process.env.DATABASE_URL.startsWith('mock://') &&
  !process.env.SKIP_DB_SETUP

// Setup database connection for tests
beforeAll(async () => {
  if (!needsDatabase()) {
    return; // Skip database setup for mocked tests
  }

  // Ensure database is connected
  await prisma.$connect().catch((error) => {
    console.error('Failed to connect to database:', error)
    throw error
  })
})

// Cleanup after all tests
afterAll(async () => {
  if (!needsDatabase()) {
    return; // Skip database cleanup for mocked tests
  }

  await prisma.$disconnect()
})

// Clean up test data after each test
afterEach(async () => {
  if (!needsDatabase()) {
    return; // Skip database cleanup for mocked tests
  }

  // Delete test data in correct order to respect foreign key constraints
  await prisma.taskProgress.deleteMany({
    where: {
      user: {
        email: {
          contains: 'test-',
        },
      },
    },
  })
  
  await prisma.lessonProgress.deleteMany({
    where: {
      user: {
        email: {
          contains: 'test-',
        },
      },
    },
  })
  
  await prisma.courseProgress.deleteMany({
    where: {
      user: {
        email: {
          contains: 'test-',
        },
      },
    },
  })
  
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: 'test-',
      },
    },
  })
})
