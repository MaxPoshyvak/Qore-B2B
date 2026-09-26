FROM oven/bun:1.3.14-alpine AS base

WORKDIR /app

# Install openssl and nodejs for runtime
RUN apk add --no-cache openssl nodejs npm

# Copy workspace package manifests
COPY package.json bun.lock* turbo.json ./
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY apps/backend/package.json ./apps/backend/

# Install dependencies
RUN bun install

# Copy source code
COPY packages ./packages
COPY apps/backend ./apps/backend

# Generate Prisma client and build packages
RUN cd packages/database && bunx prisma generate && bunx tsc -p tsconfig.json
RUN cd packages/types && bunx tsc -p tsconfig.json

# Build backend NestJS application
RUN cd apps/backend && bun run build

WORKDIR /app/apps/backend

ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

# Start NestJS server
CMD ["node", "dist/main.js"]