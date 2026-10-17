import { createZodDto } from 'nestjs-zod';
import { platformLoginSchema, platformTrackHitSchema } from '@my-app/types';

export class PlatformLoginDto extends createZodDto(platformLoginSchema) {}
export class PlatformTrackHitDto extends createZodDto(platformTrackHitSchema) {}
