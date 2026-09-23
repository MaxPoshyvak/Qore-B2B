import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('4000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(10),
    FRONTEND_URL: z.string().url().default('http://localhost:3000'),
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().min(1),
    SMTP_PASS: z.string().min(1),
    MAIL_FROM: z.string().min(1).default('Qore <no-reply@useqore.app>'),
    CLOUDINARY_API_SECRET: z.string().min(10),
    CLOUDINARY_API_KEY: z.string().min(10),
    CLOUDINARY_CLOUD_NAME: z.string().min(3),
    OPENROUTER_API_KEY: z.string().optional().default(''),
    OPENROUTER_MODEL: z.string().default('google/gemini-2.0-flash-001'),
    OPENROUTER_UPSELL_MODEL: z.string().default('openai/gpt-4o-mini'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error('❌ Помилка в змінних оточення (.env):');
    console.error(_env.error.format());
    process.exit(1);
}

export const env = _env.data;
