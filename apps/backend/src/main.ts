import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './config/env';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { ZodValidationPipe } from 'nestjs-zod';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.enableCors({
        origin: 'http://localhost:3000',
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

    await app.listen(env.PORT, () => {
        console.log(`🚀 Сервер на порту ${env.PORT} | режим: ${env.NODE_ENV}`);
    });
}

bootstrap();
