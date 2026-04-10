# Docker (local)

Run all commands from the BrainStack app folder: **`LearningPlatform/LearningPlatform`** (same folder as `package.json` and `docker-compose.yml`).

## 1. Environment file

Create `.env` in this folder (Compose substitutes `${VAR}` from your shell or from a file you pass explicitly):

```bash
AUTH_SECRET=<openssl rand -base64 32>
PAYLOAD_SECRET=<openssl rand -base64 32>
SEED_ADMIN_PASSWORD=<openssl rand -base64 24>
SEED_ADMIN_EMAIL=you@example.com
```

Optional:

```bash
# After the first successful `docker compose up`, add this to avoid re-running CMS seed every restart:
SKIP_CMS_SEED=1
```

Start Compose with:

```bash
docker compose --env-file .env up --build
```

If you omit `--env-file`, Docker Compose still reads a file named `.env` **in the current directory** automatically for variable substitution — as long as that file exists here.

## 2. What the app container does on startup

The entrypoint (`docker-entrypoint.sh`):

1. Waits until PostgreSQL accepts connections (`scripts/wait-for-db.ts`).
2. Runs **`prisma migrate deploy`** (must succeed — container exits on failure).
3. Runs **Payload migrations** (`npm run payload:migrate`) — failures are logged as warnings only if tables already exist.
4. Applies optional SQL files in `migrations/*.sql` — each file is best-effort (idempotent SQL may still log warnings).
5. Runs **`cms:seed`** unless `SKIP_CMS_SEED=1` — creates Payload + NextAuth admin if missing.
6. Starts **`next start`** on `0.0.0.0` at **`PORT`** (default **3000** in Compose).

Open **http://localhost:3000** (admin: **http://localhost:3000/admin**).

## 3. Content import (courses, modules, tags, flashcards)

Import scripts live in **`scripts/imports/`** (runners under `scripts/imports/runners/`). They use **Payload v3** (`getPayload`) and Prisma. See **`scripts/imports/README.md`** for data layout and idempotency rules.

**From your machine** (Postgres on `localhost:5432`, same credentials as Compose):

```bash
cd LearningPlatform/LearningPlatform
# Ensure .env has DATABASE_URL, PAYLOAD_DATABASE_URL, PAYLOAD_SECRET (or only DATABASE_URL)
npm run content:import:all
```

Pipeline: **`content:import:tags`** → **`content:import:course`** → **`content:import:modules`** → **`content:import:flashcards`**. Imports are idempotent (see README). Flashcards skip unchanged rows when question and tag set match.

**Inside Docker** (after the stack is up and migrations have run):

The image includes **`scripts/`** and **`src/`** (see `Dockerfile`), so import data files baked at **build time** are on disk at `/app/scripts/imports/data/`. Rebuild the image (`docker compose build`) after you change data files, **or** mount the folder:

```yaml
# optional docker-compose override — live-edit import data without rebuild
services:
  app:
    volumes:
      - ./scripts/imports:/app/scripts/imports:ro
```

Run the full pipeline:

```bash
docker compose --env-file .env exec app npm run content:import:all
```

Or a one-off container with the same env:

```bash
docker compose --env-file .env run --rm app npm run content:import:all
```

**Orphans (lessons/tasks after a course was deleted):** older deletions did not cascade. This is fixed in code for new deletes. To clean existing bad rows:

```bash
docker compose --env-file .env exec app npm run payload:cleanup-orphans
```

**First boot auto-import (optional):** set `CONTENT_IMPORT=1` in `.env` once. The entrypoint runs `npm run content:import:all` before starting Next.js, then remove it so later restarts stay fast.

## 4. When the container “won’t start”

| Symptom | What to check |
|--------|----------------|
| `AUTH_SECRET must be set` / `PAYLOAD_SECRET must be set` | Pass secrets via `.env` and `docker compose --env-file .env up` |
| `Prisma migrate failed` | Logs show the real error. Common: DB volume from an older app version — backup data, `docker compose down -v`, bring up again, or run `npx prisma migrate deploy` manually against that DB. If you applied SQL or scripts by hand and Prisma reports drift, fix with `prisma migrate resolve` (see Prisma docs) or restore from backup — do not delete production data blindly |
| Stuck on “Waiting for database” | Postgres not healthy — `docker compose ps`, `docker compose logs postgres` |
| App exits after Payload migrate | Prisma step already passed; check **previous** lines for `prisma migrate` errors |
| Login / session issues in browser | Set `NEXTAUTH_URL=http://localhost:3000` in `.env`; `AUTH_TRUST_HOST` defaults to **true** in Compose |

## 5. pgAdmin (optional)

Compose includes **pgAdmin** on **http://127.0.0.1:5050** (defaults in `docker-compose.yml`). Register a server with host **`postgres`**, user **`postgres`**, password **`postgres`**, database **`exam_prep_db`**.
