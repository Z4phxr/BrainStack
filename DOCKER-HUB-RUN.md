# Run BrainStack From Docker Hub

This guide runs BrainStack with Postgres using Docker Compose and an image pulled from Docker Hub.

## Prerequisites

- Docker Desktop running
- Docker Hub image exists, e.g. `your-dockerhub-user/brainstack:latest`
- Repo cloned locally

## 1) Go to the app compose folder

From repo root:

```bash
cd LearningPlatform
```

## 2) Create your `.env`

Create `LearningPlatform/.env` (or update it) with at least:

```env
APP_IMAGE=your-dockerhub-user/brainstack:latest
AUTH_SECRET=replace-with-long-random-value
PAYLOAD_SECRET=replace-with-long-random-value
SEED_ADMIN_PASSWORD=replace-with-long-random-value
NEXTAUTH_URL=http://localhost:3000
```

Notes:

- `APP_IMAGE` tells Compose which Docker Hub tag to run.
- `DATABASE_URL` and `PAYLOAD_DATABASE_URL` have safe Docker defaults in `docker-compose.yml`.
- For production, always use strong unique secrets.

## 3) Pull and start

```bash
docker compose pull app
docker compose up -d --no-build
```

## 4) Verify

```bash
docker compose ps
docker compose logs -f app
```

App URL:

- [http://localhost:3000](http://localhost:3000)

## Useful commands

Stop:

```bash
docker compose down
```

Stop and remove database volume (fresh DB):

```bash
docker compose down -v
```

Update to a new image tag:

1. Change `APP_IMAGE` in `.env`
2. Run:

```bash
docker compose pull app
docker compose up -d --no-build
```
