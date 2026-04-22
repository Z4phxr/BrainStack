# Security uplift (Payload 3.72.0 -> 3.83.0, Next 16)

**Release date:** 2026-04-22  
**Primary scope:** Upgrade framework and CMS dependency stack to eliminate critical/high advisories and keep the app build/test stable.

---

## Summary

- Upgraded Payload packages from `3.72.0` to `3.83.0`.
- Pulled in patched transitive packages (`@payloadcms/drizzle`, `@payloadcms/graphql`) through the aligned version set.
- Upgraded `next` / `eslint-config-next` to `16.2.4` to stay on a security-supported line compatible with `@payloadcms/next@3.83.0`.
- Upgraded Prisma toolchain to `7.8.0`.
- Applied dependency overrides for `dompurify` and `@hono/node-server` to pull patched transitive versions where safe.
- Verified compatibility with production build, type-check, and CI tests.

---

## Changed

- `payload` -> `3.83.0`
- `@payloadcms/db-postgres` -> `3.83.0`
- `@payloadcms/next` -> `3.83.0`
- `@payloadcms/richtext-lexical` -> `3.83.0`
- `next` -> `16.2.4`
- `eslint-config-next` -> `16.2.4`
- `prisma` -> `7.8.0`
- `@prisma/client` -> `7.8.0`
- `@prisma/adapter-pg` -> `7.8.0`
- Added `overrides`:
  - `dompurify` -> `^3.3.4`
  - `@hono/node-server` -> `^1.19.13`
  - `@esbuild-kit/core-utils > esbuild` -> `0.25.12`

