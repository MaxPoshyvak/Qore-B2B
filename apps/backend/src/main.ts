import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './config/env';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { ZodValidationPipe } from 'nestjs-zod';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        rawBody: true,
    });
    app.use(cookieParser());
    const allowedOrigins = [
        env.FRONTEND_URL,
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ].filter(Boolean);

    app.enableCors({
        origin: (
            origin: string | undefined,
            callback: (err: Error | null, allow?: boolean) => void,
        ) => {
            // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
            if (!origin) return callback(null, true);
            if (
                allowedOrigins.includes(origin) ||
                origin.endsWith('.vercel.app') ||
                process.env.NODE_ENV !== 'production'
            ) {
                return callback(null, true);
            }
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true,
    });

    const config = new DocumentBuilder()
        .setTitle('API Documentation')
        .setDescription('The API description')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ZodValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());

    const port = Number(env.PORT) || 4000;
    await app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${port} | host: 0.0.0.0 | env: ${env.NODE_ENV}`);
    });
}

bootstrap();
