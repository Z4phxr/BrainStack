# Deployment Guide (Railway)

This document covers everything required to deploy the CourseManagementPlatform to
[Railway](https://railway.app). All configuration is environment-variable-driven;
no values are hardcoded in the source.

---

## 1. Requirements

| Requirement | Notes |
|-------------|-------|
| Railway account | Free tier is sufficient for initial deployment |
| Railway PostgreSQL service | Provisioned inside the same Railway project |
| S3-compatible object storage | Railway Object Storage, AWS S3, or any S3-compatible provider |
| Node.js 20.x | Specified in `package.json` `engines` field; enforced by the Dockerfile |

---

## 2. Environment Variables

Set the following variables in the Railway service dashboard under **Variables**.

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Full PostgreSQL connection string for the application schema. Use Railway's reference variable: `${{Postgres.DATABASE_URL}}&schema=public&sslmode=require` |
| `PAYLOAD_DATABASE_URL` | Connection string for Payload CMS. Use the same database with a different schema parameter: `${{Postgres.DATABASE_URL}}&schema=payload&sslmode=require` |
| `AUTH_SECRET` | Random secret for Auth.js JWT signing. Generate with `openssl rand -base64 32`. Must be at least 32 characters. |
| `PAYLOAD_SECRET` | Random secret for Payload CMS session encryption. Generate with `openssl rand -base64 32`. Must be at least 16 characters. |
| `AUTH_TRUST_HOST` | Set to `true` on Railway so Auth.js accepts the dynamic Railway-assigned domain. |
| `NEXTAUTH_URL` | The public URL of your deployed application, e.g. `https://your-app.up.railway.app`. |
| `NODE_ENV` | Set to `production`. |
| `SEED_ADMIN_EMAIL` | Email address for the initial admin account created on first boot. |
| `SEED_ADMIN_PASSWORD` | Password for the initial admin account. Use a strong random value; change it after first login. Generate with `openssl rand -base64 24`. |

### Object Storage (S3-compatible)

All five variables below are required for media uploads to work. Without them the
upload endpoint returns an error; no fallback to local disk storage is used in
production.

| Variable | Description |
|----------|-------------|
| `S3_BUCKET` | Name of the storage bucket, e.g. `my-platform-media` |
| `AWS_REGION` | Region for AWS S3 (e.g. `eu-west-1`) or `auto` for Railway / Cloudflare R2 |
| `AWS_ACCESS_KEY_ID` | Access key ID issued by your storage provider |
| `AWS_SECRET_ACCESS_KEY` | Secret access key issued by your storage provider |
| `S3_ENDPOINT` | Endpoint URL for non-AWS S3-compatible storage (e.g. `https://t3.storageapi.dev` for Railway Object Storage). Omit this variable when using AWS S3 directly. |

### Optional

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP port the server listens on. Railway injects this automatically; the application defaults to `10000` if unset. |
| `VERBOSE_LOGGING` | Set to `true` to emit debug-level log lines. Defaults to `false`. Leave `false` in production to reduce noise. |

---

## 3. Build Command

The `railway.toml` at the project root instructs Railway to use the provided
Dockerfile. The Dockerfile performs a multi-stage build:

1. Installs all Node.js dependencies (`npm ci --ignore-scripts`).
2. Generates the Prisma client (`npx prisma generate`).
3. Produces the Next.js production bundle (`npm run build`).
4. Creates a lean runtime image that contains only the compiled output and
   production dependencies.

Railway reads `railway.toml` automatically. No manual build command entry is
required in the dashboard when deploying from the `CourseManagementPlatform/`
directory. If you are deploying without Docker (buildpack mode), set the build
command to:

```
npm ci && npm run build
```

---

## 4. Start Command

The entrypoint script `docker-entrypoint.sh` is the container start command. It:

1. Validates that all required environment variables are present and exits
   immediately with a clear error message if any are missing.
2. Runs database migrations in the background after a 10-second warm-up delay
   to allow the Railway PostgreSQL service to become reachable.
3. Starts the Next.js production server on the port Railway assigns via `$PORT`.

The Railway health check polls `/api/ping` and waits up to 300 seconds.

If you are deploying without Docker, set the start command to:

```
npm run db:migrate:deploy && npm run start
```

---

## 5. Database Setup

### Connecting the Railway PostgreSQL service

1. Inside your Railway project, click **+ New** and add a **PostgreSQL** database.
2. The database service will expose a `DATABASE_URL` reference variable.
3. In your application service variables, set:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}&schema=public&sslmode=require
   PAYLOAD_DATABASE_URL=${{Postgres.DATABASE_URL}}&schema=payload&sslmode=require
   ```
4. The `sslmode=require` suffix is required for Railway PostgreSQL. The
   `sanitizeDatabaseUrl()` helper in `lib/db-utils.ts` automatically appends
   `uselibpqcompat=true` to avoid certificate verification errors with Railway's
   self-signed certificate.

### Schema separation

The application uses two PostgreSQL schemas on the same database instance:

| Schema | Owner | Purpose |
|--------|-------|---------|
| `public` | Prisma | User accounts, progress tracking, flashcards, tags, activity logs |
| `payload` | Payload CMS | Course catalog, modules, lessons, tasks, media metadata |

Both schemas are created automatically on first boot by their respective
migration runners. You do not need to create them manually.

### Running migrations manually

To run only the Prisma migrations (useful for debugging):

```bash
npx prisma migrate deploy
```

To run only the Payload CMS migrations:

```bash
npm run payload:migrate
```

---

## 6. Media Storage Configuration

Media uploads are routed through `/api/media/upload` and stored in an
S3-compatible bucket. Files are never written to the container's local
filesystem in production.

### Railway Object Storage

1. Inside your Railway project, click **+ New** and add an **Object Storage**
   service.
2. Railway will provide the endpoint, bucket name, access key, and secret key in
   the storage service variables.
3. Add the following to your application service variables:
   ```
   S3_ENDPOINT=https://t3.storageapi.dev
   AWS_REGION=auto
   S3_BUCKET=<bucket-name-from-railway>
   AWS_ACCESS_KEY_ID=<key-from-railway>
   AWS_SECRET_ACCESS_KEY=<secret-from-railway>
   ```

### AWS S3

1. Create a private S3 bucket in your preferred AWS region.
2. Create an IAM user with `s3:PutObject` and `s3:GetObject` permissions scoped
   to that bucket.
3. Set the variables (omit `S3_ENDPOINT` when using AWS directly):
   ```
   AWS_REGION=eu-west-1
   S3_BUCKET=my-platform-media
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   ```

### How media access works

- Uploaded files are stored under a unique key.
- All reads go through `/api/media/serve/[key]`, which generates a signed URL
  valid for 1 hour. The bucket requires no public-read ACL.
- The `next.config.ts` `images.remotePatterns` list allows the Next.js image
  optimizer to follow signed-URL redirects from supported storage hosts.

---

## 7. Post-Deployment Checklist

Work through this list after the first successful deploy.

- [ ] **Health check passes** — Railway shows the service as healthy (green).
      Verify by visiting `https://your-app.up.railway.app/api/ping`; expect
      `{"ok":true,"ts":<timestamp>}`.

- [ ] **Prisma migrations applied** — Check Railway deployment logs for the line
      `[MIGRATE] Prisma migrations done.`

- [ ] **Payload migrations applied** — Check logs for
      `[MIGRATE] Payload migrations done.`

- [ ] **Admin seed ran** — Check logs for `[MIGRATE] CMS seed done.` Sign in
      at `/admin/login` with the credentials from `SEED_ADMIN_EMAIL` /
      `SEED_ADMIN_PASSWORD`. Change the admin password immediately.

- [ ] **Media upload works** — Sign in to the admin panel, navigate to the
      Media section, and upload a test image. Confirm it displays correctly,
      which validates the S3 credentials and bucket configuration.

- [ ] **Rotate seed credentials** — After confirming the admin account works,
      remove or rotate `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` from the
      Railway environment variables. The seed script is idempotent but there is
      no benefit to leaving credentials injected after first boot.

- [ ] **Review `VERBOSE_LOGGING`** — Confirm it is set to `false` in the Railway
      variables. Verbose mode emits detailed database query logs and is intended
      only for debugging.

- [ ] **Set `AUTH_TRUST_HOST=true`** — Required on Railway for Auth.js to accept
      the platform-assigned domain in session cookies. Without this, sign-in
      redirects fail.
