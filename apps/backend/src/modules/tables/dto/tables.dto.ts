import { createZodDto } from 'nestjs-zod';
import { createTableSchema, updateTableSchema } from '@my-app/types';

export class CreateTableDto extends createZodDto(createTableSchema) {}
export class UpdateTableDto extends createZodDto(updateTableSchema) {}
