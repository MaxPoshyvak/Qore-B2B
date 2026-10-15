FROM oven/bun:1.3.14-alpine

WORKDIR /app

# Install openssl for prisma client runtime
RUN apk add --no-cache openssl nodejs

# Copy workspace package manifests
COPY package.json bun.lock* turbo.json ./
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN bun install

# Copy source code
COPY packages ./packages
COPY apps/frontend ./apps/frontend

# Build shared packages
RUN cd packages/database && bun run build
RUN cd packages/types && bun run build

WORKDIR /app/apps/frontend

# Build Next.js application
RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "start"]