import { createZodDto } from 'nestjs-zod';
import { CreateTenantSchema, updateTenantSettingsSchema, updateTenantThemeSchema } from '@my-app/types';

export class CreateTenantDto extends createZodDto(CreateTenantSchema) {}
export class UpdateTenantSettingsDto extends createZodDto(updateTenantSettingsSchema) {}
export class UpdateTenantThemeDto extends createZodDto(updateTenantThemeSchema) {}
