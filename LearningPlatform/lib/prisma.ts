import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { sanitizeDatabaseUrl } from '@/lib/db-utils';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Lazy initialization function
function initPrisma(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  // Skip real initialization in test environment with mock DATABASE_URL
  if (process.env.DATABASE_URL?.startsWith('mock://')) {
    // Return a minimal mock client for tests
    return {} as PrismaClient;
  }

  // Validate required env var at startup
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL environment variable is required. ' +
      'Set it in your .env file or environment.'
    );
  }

  // Create PostgreSQL connection pool with explicit bounds
  const pool = new Pool({
    connectionString: sanitizeDatabaseUrl(process.env.DATABASE_URL),
    connectionTimeoutMillis: 5000,
    max: 10,
    ssl: process.env.DATABASE_URL?.includes('sslmode') ? { rejectUnauthorized: false } : false,
  });
  
  globalForPrisma.pool = pool;
  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

  // Store singleton in all environments — prevents new Pool + PrismaClient
  // from being constructed on every Proxy property access in production.
  globalForPrisma.prisma = client;

  return client;
}

// Export a proxy that lazy-loads the Prisma client
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = initPrisma();
    return (client as any)[prop];
  },
});
