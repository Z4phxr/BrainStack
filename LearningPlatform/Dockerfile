## Multi-stage Dockerfile (production-ready)
## Builder: install all deps, run build, prune dev deps
FROM node:20-bullseye-slim AS builder

WORKDIR /app

# Install system build deps required by native modules like sharp/prisma
RUN set -eux; \
  export DEBIAN_FRONTEND=noninteractive; \
  RETRIES=5; \
  COUNT=0; \
  until [ "$COUNT" -ge "$RETRIES" ]; do \
    apt-get update && apt-get install -y --no-install-recommends build-essential python3 git ca-certificates && break || true; \
    COUNT=$((COUNT+1)); \
    echo "apt-get failed, retrying ($COUNT/$RETRIES)"; \
    apt-get update --fix-missing || true; \
    sleep 3; \
  done; \
  rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

# Install all dependencies (including dev) but skip lifecycle scripts (postinstall)
# This avoids running `prisma generate` before the full source (including schema)
# is copied into the image. We'll run `prisma generate` explicitly later when
# the schema file is present.
RUN set -eux; \
  RETRIES=5; \
  COUNT=0; \
  until [ "$COUNT" -ge "$RETRIES" ]; do \
    npm ci \
      --no-audit \
      --no-fund \
      --ignore-scripts \
      --fetch-retries=5 \
      --fetch-retry-factor=2 \
      --fetch-retry-mintimeout=10000 \
      --fetch-retry-maxtimeout=120000 && break || true; \
    COUNT=$((COUNT+1)); \
    echo "npm ci failed, retrying ($COUNT/$RETRIES)"; \
    npm cache verify || true; \
    sleep 5; \
  done; \
  if [ "$COUNT" -ge "$RETRIES" ]; then \
    echo "npm ci failed after $RETRIES attempts"; \
    exit 1; \
  fi

# Copy rest of source and run build
COPY . .
# Ensure public/ exists even when the directory is empty (git skips empty dirs)
RUN mkdir -p /app/public

# Build-time configuration for Payload CMS / Prisma initialization.
# DATABASE_URL and PAYLOAD_DATABASE_URL are non-sensitive placeholders so
# Prisma client generation works without a real DB at build time.
# PAYLOAD_SECRET and AUTH_SECRET are set to placeholder values here ONLY so
# that Next.js can complete the "Collecting page data" phase (which imports
# server modules that validate env vars on load). These dummy values are
# NOT baked into the runner image and are NOT used at runtime — Railway injects
# the real secrets via environment variables when the container starts.
ARG DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/postgres"
ARG PAYLOAD_DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/postgres"
ARG PAYLOAD_SECRET="build-time-placeholder-not-used-at-runtime"
ARG AUTH_SECRET="build-time-placeholder-not-used-at-runtime"

# Export build-time args as env vars for the build step only.
ENV DATABASE_URL="${DATABASE_URL}" \
  PAYLOAD_DATABASE_URL="${PAYLOAD_DATABASE_URL}" \
  PAYLOAD_SECRET="${PAYLOAD_SECRET}" \
  AUTH_SECRET="${AUTH_SECRET}" \
  VERBOSE_LOGGING="false"
# Generate Prisma client if schema exists, then build Next app
# Keep devDependencies in the builder so build-time tools (e.g. tsx) are available
# Disable ESLint during the production build in the builder to avoid plugin
# resolution issues in some build environments. ESLint will still run locally
# via `npm run lint` and in CI if desired.
RUN if [ -f prisma/schema.prisma ]; then \
      npx prisma generate; \
    else \
      echo "No prisma/schema.prisma found; skipping prisma generate"; \
    fi && \
    NEXT_DISABLE_ESLINT=1 npm run build

# Note: devDependencies are pruned so the runner image only contains runtime dependencies.


## Runner: lightweight runtime image with only prod artifacts
FROM node:20-bullseye-slim AS runner

WORKDIR /app

# Set NODE_ENV to production by default in the image
ENV NODE_ENV=production \
    VERBOSE_LOGGING=false

# Copy runtime files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/src ./src
COPY --from=builder /app/auth.ts ./auth.ts
COPY --from=builder /app/middleware.ts ./middleware.ts
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/tsconfig.scripts.json ./tsconfig.scripts.json

# Copy entrypoint and make executable
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN sed -i 's/\r$//' ./docker-entrypoint.sh && \
	chmod +x ./docker-entrypoint.sh

EXPOSE 3000

CMD ["sh", "/app/docker-entrypoint.sh"]
