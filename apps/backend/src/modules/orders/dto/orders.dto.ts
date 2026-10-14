import { createZodDto } from 'nestjs-zod';
import { createOrderSchema, updateOrderStatusSchema, orderHistoryQuerySchema } from '@my-app/types';

export class CreateOrderDto extends createZodDto(createOrderSchema) {}

export class UpdateOrderStatusDto extends createZodDto(updateOrderStatusSchema) {}

export class OrderHistoryQueryDto extends createZodDto(orderHistoryQuerySchema) {}

