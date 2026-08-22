import { createZodDto } from 'nestjs-zod';
import { addCartItemSchema, toggleReadySchema, updateCartItemSchema } from '@my-app/types';

export class AddCartItemDto extends createZodDto(addCartItemSchema) {}
export class UpdateCartItemDto extends createZodDto(updateCartItemSchema) {}
export class ToggleReadyDto extends createZodDto(toggleReadySchema) {}
