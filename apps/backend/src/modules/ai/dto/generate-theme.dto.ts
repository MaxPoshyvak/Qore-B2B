import { createZodDto } from 'nestjs-zod';
import { generateThemeInputSchema } from '@my-app/types';

export class GenerateThemeDto extends createZodDto(generateThemeInputSchema) {}
