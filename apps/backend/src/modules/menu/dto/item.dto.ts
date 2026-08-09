import { createZodDto } from 'nestjs-zod';
import { CreateMenuItemSchema, UpdateMenuItemSchema } from '@my-app/types';

export class CreateMenuItemDto extends createZodDto(CreateMenuItemSchema) {}
export class UpdateMenuItemDto extends createZodDto(UpdateMenuItemSchema) {}
