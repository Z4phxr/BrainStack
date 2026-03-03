import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts', './test/setup-react.ts'],
    include: ['test/**/*.test.{ts,tsx}'],
    hookTimeout: 30000,
    testTimeout: 15000,
    // Skip database-dependent integration tests by default.
    // Set SKIP_PAYLOAD_TESTS=false to run them against a live database.
    env: {
      SKIP_PAYLOAD_TESTS: process.env.SKIP_PAYLOAD_TESTS ?? 'true',
      SKIP_DB_SETUP: process.env.SKIP_DB_SETUP ?? 'true',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '.next/',
        'prisma/',
        '**/*.config.*',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@payload-config': path.resolve(__dirname, './src/payload/payload.config.ts'),
    },
  },
})
