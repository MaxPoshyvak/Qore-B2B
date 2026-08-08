import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        // 1. Визначаємо HTTP статус-код
        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        // 2. Витягуємо повідомлення про помилку
        let errorMessage = 'Внутрішня помилка сервера';

        if (exception instanceof HttpException) {
            const res = exception.getResponse();

            if (typeof res === 'string') {
                errorMessage = res;
            } else if (typeof res === 'object' && res !== null) {
                // Обробка випадків, коли NestJS або Zod повертають об'єкт або масив помилок
                const resObj = res as Record<string, any>;
                if (Array.isArray(resObj.message)) {
                    errorMessage = resObj.message.join(', ');
                } else if (typeof resObj.message === 'string') {
                    errorMessage = resObj.message;
                } else if (typeof resObj.error === 'string') {
                    errorMessage = resObj.error;
                }
            }
        } else if (exception instanceof Error) {
            // Для неперехоплених помилок JS
            errorMessage = exception.message;
        }

        // 3. Формуємо ТВІЙ ЄДИНИЙ формат відповіді
        response.status(status).json({
            success: false,
            error: errorMessage,
            statusCode: status, // (опціонально для зручності)
        });
    }
}
