import { createZodDto } from 'nestjs-zod';
import { CreateTenantSchema, updateTenantSettingsSchema } from '@my-app/types';

export class CreateTenantDto extends createZodDto(CreateTenantSchema) {}
export class UpdateTenantSettingsDto extends createZodDto(updateTenantSettingsSchema) {}
