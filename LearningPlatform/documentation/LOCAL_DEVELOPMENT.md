# Local Development

## Prerequisites

- Node.js 20.x
- Docker and Docker Compose (for local PostgreSQL)
- An S3-compatible storage bucket (AWS S3, Cloudflare R2, Railway Object Storage, or similar)

## Full Setup

```bash
# 1. Clone the repository
git clone <your-brainstack-repo-url>
cd <your-brainstack-app-directory>

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env - fill in DATABASE_URL, AUTH_SECRET, PAYLOAD_SECRET, and S3 credentials

# 4. Start the local PostgreSQL instance
docker compose up -d postgres

# 5. Apply database migrations
npm run db:migrate:deploy

# 6. (Optional) Seed an admin account and sample content
npm run cms:seed

# 7. Start the development server
npm run dev
```

## Quick Local Start

```bash
npm install
cp .env.example .env
# Fill required env values
npm run dev
```

If you run with Docker, use:

```bash
docker compose --env-file .env up --build
```

## Local URLs

| URL | Purpose |
|-----|---------|
| `http://localhost:3000` | Student-facing application |
| `http://localhost:3000/admin` | Payload CMS admin panel |
