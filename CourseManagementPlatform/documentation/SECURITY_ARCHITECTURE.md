# Security Architecture

This document describes the security measures implemented in this application.

---

## Authentication

- Passwords are hashed with **bcrypt** (cost factor 10) via `bcryptjs`. Plain-text passwords are never stored or logged.
- All credentials are validated with **Zod** before any database interaction.
- Password requirements: minimum 8 characters, maximum 128 characters, must contain uppercase, lowercase, digit, and special character.
- Email addresses are normalised to lowercase before lookup to prevent case-variation bypass.
- The login flow returns the same response whether the user does not exist or the password is wrong, preventing user enumeration.
- Authentication is provided by **Auth.js v5** (NextAuth) using the `Credentials` provider with JWT session strategy.
- Sessions expire after **8 hours** (`maxAge: 28800`).

---

## Login Rate Limiting

- Login attempts are rate-limited to **5 requests per 5 minutes per IP**.
- Registration is rate-limited to **10 requests per 60 seconds per IP**.
- Counters are stored in **PostgreSQL** (`rate_limits` table) using an atomic `UPSERT`. They survive process restarts and are shared across all application instances behind a load-balancer.
- The rate limiter reads the **rightmost** value from `X-Forwarded-For`, which is appended by the trusted reverse proxy (Railway / Render), not the client-supplied value.
- Rate-limit exceeded responses return HTTP `429` (registration) or a NextAuth error message (login).
- If the database is unavailable, the limiter fails open so that a DB outage does not lock legitimate users out.

---

## Authorization

The application enforces access control at two independent layers:

**Layer 1 — Next.js Middleware (`middleware.ts`)**
- Unauthenticated users are redirected to `/login` for all non-public routes.
- Users without the `ADMIN` role are redirected away from any `/admin/*` path.

**Layer 2 — Route-level guards (`lib/auth-helpers.ts`)**
- Every protected API route calls `requireAuth()` or `requireAdmin()` as its first operation.
- This ensures authorization is enforced even if the middleware matcher is misconfigured.

User-owned records (progress, settings) are always queried with `userId` scoped to the authenticated session — users cannot access each other's data.

---

## Input Validation

- All API request bodies are validated with **Zod** schemas before processing.
- All database queries use **Prisma's parameterized query interface**. Raw SQL uses Prisma's tagged template literals which parameterize values automatically. No string interpolation into SQL was used.
- No `eval()`, `new Function()`, or shell execution from user input exists in the codebase.

---

## File Uploads

- Upload endpoint requires the `ADMIN` role.
- Filenames are sanitized: Unicode-normalized, whitespace replaced with dashes, non-alphanumeric characters (except `.`, `-`, `_`, `()`) stripped — preventing path traversal.
- Files are validated by **both** `Content-Type` header and **magic byte inspection** (JPEG, PNG, GIF, WebP, BMP, TIFF signatures checked against the actual buffer).
- Maximum upload size is enforced at **10 MB** before the buffer is written to disk.
- Files are stored in a **private S3 bucket** and served only via short-lived signed URLs (1-hour expiry). The bucket has no public-read ACL.

---

## HTTP Security Headers

Static headers are set globally via `next.config.ts`:

| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |

The **Content-Security-Policy** is generated per-request in `middleware.ts` with a cryptographically random **nonce** (`crypto.randomBytes(16)`). The nonce is:
- Embedded in the CSP header: `script-src 'self' 'nonce-{nonce}' 'unsafe-eval'`
- Forwarded to server components via the `x-nonce` request header
- Applied to the inline theme-init `<script nonce={nonce}>` in `app/layout.tsx`

This eliminates `unsafe-inline` from `script-src` — injected inline scripts without the matching nonce are blocked by the browser. `unsafe-eval` is retained for Payload CMS. `unsafe-inline` remains in `style-src` for Tailwind CSS inline styles.

---

## Session Security

- JWTs are stored in **HttpOnly, Secure, SameSite** cookies managed by Auth.js.
- Every JWT carries a unique **JTI** (JWT ID) generated with `crypto.randomUUID()` at sign-in.
- Sessions expire after **8 hours** (`maxAge: 28800`).
- **Token revocation**: on sign-out, the session JTI is written to a `revoked_tokens` PostgreSQL table. Every subsequent request checks this table and immediately invalidates sessions whose JTI is listed, regardless of token expiry. Expired entries are cleaned up probabilistically.
- **Role propagation**: the user's role is re-fetched from the database every **5 minutes** inside the JWT callback. Role changes (e.g. demotion from ADMIN) take effect within that window, not at token expiry. If the user record is deleted, the session is invalidated immediately.
- JWT payload contains only: user ID, email, display name, role, JTI, and last-role-refresh timestamp. Password hashes are never included.

---

## Sensitive Data and Secrets

- All secrets (`AUTH_SECRET`, `PAYLOAD_SECRET`, `DATABASE_URL`, S3 credentials) are passed via environment variables.
- `.env` files are excluded from version control via `.gitignore`.
- `.env.example` contains only placeholder values — no real credentials are committed.
- The Dockerfile uses build-time placeholder secrets that are overwritten by the deployment platform at runtime.

---

## Logging and Audit Trail

- All authentication events are recorded to a persistent `activityLog` database table: `USER_REGISTERED`, `USER_LOGIN`, `USER_LOGOUT`, `USER_LOGIN_FAILED`.
- Failed login attempts log the attempted email and user ID (when resolvable) without exposing password information.
- All content CRUD operations (courses, modules, lessons, tasks, flashcards, tags, subjects, media) are also logged with actor identity and resource reference.
- Server-side logs never contain password hashes, session tokens, or secret keys.
- Verbose health-check responses (`?verbose=1`) that expose database identity and environment metadata are restricted to authenticated admins.

---

## XSS Protection

- The frontend is built with **React 19**, which escapes all dynamic string content by default in JSX.
- Rich text is authored and stored in Payload CMS **Lexical JSON** format. Text extraction for API responses uses a plain-text utility, not raw HTML serialization.
- No use of `dangerouslySetInnerHTML` was found in security-sensitive rendering paths.

---

## CSRF Protection

- Auth.js v5 handles CSRF token validation for all authentication form submissions internally.
- Next.js Server Actions validate the `Origin` header on cross-origin requests by default.
- Session cookies are `SameSite`, providing baseline CSRF protection for API route mutations.