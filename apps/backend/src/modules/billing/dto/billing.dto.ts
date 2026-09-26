import { createZodDto } from 'nestjs-zod';
import { createCheckoutSessionSchema, verifyCheckoutSessionSchema } from '@my-app/types';

export class CreateCheckoutDto extends createZodDto(createCheckoutSessionSchema) {}
export class VerifyCheckoutSessionDto extends createZodDto(verifyCheckoutSessionSchema) {}
