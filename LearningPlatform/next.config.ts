import type { NextConfig } from "next";

/**
 * Next.js 15.5.x configuration for Payload CMS compatibility
 * 
 * IMPORTANT: We use Next.js 15.x (not 16) because:
 * - @payloadcms/next@3.72.0 requires peer dependency next@"^15.4.10"
 * - Ensures stable compatibility with Payload CMS
 * 
 * Webpack configuration handles:
 * - External packages that cause build issues (sharp, drizzle-kit, @esbuild)
 * - Binary files that need to be ignored
 */

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-Frame-Options',          value: 'DENY' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Content-Security-Policy is intentionally NOT set here.
          // It is generated per-request in middleware.ts so that a fresh
          // cryptographic nonce can be embedded in each response.
          // The nonce replaces 'unsafe-inline' in script-src.
        ],
      },
    ]
  },

  // Allow Next.js <Image> to load from Railway S3 storage (signed URL redirects)
  // and any other S3-compatible hosts. Using unoptimized on those images is also
  // recommended, but remotePatterns ensures the optimizer can follow redirects.
  images: {
    remotePatterns: [
      // Railway S3-compatible storage (t3.storageapi.dev)
      { protocol: 'https', hostname: 't3.storageapi.dev' },
      // AWS S3 (any region)
      { protocol: 'https', hostname: '*.amazonaws.com' },
      // Generic S3-compatible (any https)
      { protocol: 'https', hostname: '**' },
    ],
  },

  // Webpack configuration for Payload CMS compatibility
  serverExternalPackages: ['@payloadcms/db-postgres', 'drizzle-kit', 'sharp'],
  
  // Linting is enforced in CI via `npm run lint`. The build-time ESLint pass
  // is disabled because eslint-plugin-next resolves differently inside certain
  // Docker build environments.  Remove this flag once the next-lint package
  // resolution is stabilised across all build environments.
  eslint: {
    ignoreDuringBuilds: false,
  },

  // The production build performs its own tsc pass. `npm run type-check` in CI
  // is the primary gate. Build-time errors are surfaced by the CI build job.
  typescript: {
    ignoreBuildErrors: false,
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      // External modules that cause issues
      config.externals = [...(config.externals || []), {
        'sharp': 'commonjs sharp',
        '@esbuild/win32-x64': 'commonjs @esbuild/win32-x64',
        'drizzle-kit': 'commonjs drizzle-kit',
      }];
    }
    
    // Ignore problematic binary files
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.(node|exe|md)$/,
      use: 'null-loader',
    });

    return config;
  },
};

export default nextConfig;

