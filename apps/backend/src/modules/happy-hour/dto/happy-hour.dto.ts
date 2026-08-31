import { createZodDto } from 'nestjs-zod';
import { CreateHappyHourSchema, UpdateHappyHourSchema } from '@my-app/types';

export class CreateHappyHourDto extends createZodDto(CreateHappyHourSchema) {}

export class UpdateHappyHourDto extends createZodDto(UpdateHappyHourSchema) {}
