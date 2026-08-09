import { createZodDto } from 'nestjs-zod';
import { CreateCategorySchema, UpdateCategorySchema } from '@my-app/types';

export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {}
export class UpdateCategoryDto extends createZodDto(UpdateCategorySchema) {}
