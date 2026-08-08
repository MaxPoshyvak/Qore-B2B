import { createZodDto } from 'nestjs-zod';
import { CreateTenantSchema } from '@my-app/types';

export class CreateTenantDto extends createZodDto(CreateTenantSchema) {}
