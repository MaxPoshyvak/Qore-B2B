# Використовуємо офіційний легкий образ Bun
FROM oven/bun:1-alpine

WORKDIR /app

# Копіюємо весь монорепозиторій (це важливо для доступу до packages)
COPY . .

# Встановлюємо всі залежності всього проєкту
RUN bun install

# Генеруємо Prisma-клієнт (інакше база даних не працюватиме)
RUN cd packages/database && bun generate
RUN cd packages/types && bun run build

# Відкриваємо порт бекенду
EXPOSE 4000

# Переходимо в папку бекенду і запускаємо його
WORKDIR /app/apps/backend

# Якщо у тебе є скрипт build (наприклад, для NestJS), розкоментуй наступний рядок:
# RUN bun run build

# Запускаємо сервер
CMD ["bun", "run", "dev"] 
# (Для продакшну заміни "dev" на свій стартовий скрипт, наприклад "start")