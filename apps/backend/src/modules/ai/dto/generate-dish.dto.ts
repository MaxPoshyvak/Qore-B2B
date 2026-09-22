import { createZodDto } from 'nestjs-zod';
import { generateDishInputSchema } from '@my-app/types';

export class GenerateDishDto extends createZodDto(generateDishInputSchema) {}
