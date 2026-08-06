FROM oven/bun:1-alpine

WORKDIR /app

# Знову ж таки, копіюємо весь проєкт для доступу до спільних пакетів
COPY . .
RUN bun install
RUN cd packages/database && bun generate
RUN cd packages/types && bun run build

WORKDIR /app/apps/frontend

# Збираємо Next.js додаток
# (Під час білду Next.js може знадобитися NEXT_PUBLIC_API_URL, ми передамо його з docker-compose)
RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "start"]