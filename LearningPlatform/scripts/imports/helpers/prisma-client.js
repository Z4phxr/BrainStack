const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')

function sanitizeDatabaseUrl(url) {
  let fixed = !url.includes('?') && url.includes('&') ? url.replace('&', '?') : url

  if (fixed.includes('sslmode') && !fixed.includes('uselibpqcompat')) {
    fixed += '&uselibpqcompat=true'
  }

  return fixed
}

function createPrismaClient() {
  const rawDatabaseUrl = process.env.DATABASE_URL || process.env.PAYLOAD_DATABASE_URL

  if (!rawDatabaseUrl) {
    throw new Error('Missing DATABASE_URL/PAYLOAD_DATABASE_URL for import scripts.')
  }

  const connectionString = sanitizeDatabaseUrl(rawDatabaseUrl)
  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 5000,
    max: 5,
    ssl: connectionString.includes('sslmode') ? { rejectUnauthorized: false } : false,
  })

  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  async function disconnect() {
    await prisma.$disconnect()
    await pool.end()
  }

  return { prisma, disconnect }
}

module.exports = { createPrismaClient }
