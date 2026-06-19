# Stage 1: Build
FROM node:22-slim AS builder

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/core/package.json packages/core/
COPY packages/pdf-engine/package.json packages/pdf-engine/
COPY packages/mcp-server/package.json packages/mcp-server/
COPY packages/rest-api/package.json packages/rest-api/
COPY packages/ai-integration/package.json packages/ai-integration/
COPY packages/dashboard/package.json packages/dashboard/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm -r run build

# Prune dev dependencies after build to save space
RUN pnpm -r exec rm -rf node_modules src tsconfig.json
RUN pnpm install --prod --frozen-lockfile

# Stage 2: Production
FROM node:22-slim

# Install Chromium for Puppeteer
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true

RUN corepack enable pnpm

WORKDIR /app

COPY --from=builder /app .

RUN mkdir -p /app/data /app/output

ENV STORAGE_TYPE=sqlite
ENV SQLITE_PATH=/app/data/docuforge.db
ENV PDF_OUTPUT_DIR=/app/output
ENV PORT=3000

EXPOSE 3000
EXPOSE 3001

# Command is meant to be overridden in docker-compose.yml for MCP vs REST
CMD ["node", "packages/rest-api/dist/index.js"]
