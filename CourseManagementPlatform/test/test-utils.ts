// Re-export the main Prisma client for tests
// Ensures env vars are loaded in setup.ts before importing this file
export { prisma } from '@/lib/prisma'
