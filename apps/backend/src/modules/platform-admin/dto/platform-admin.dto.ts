import { createZodDto } from 'nestjs-zod';
import { platformLoginSchema, platformTrackHitSchema, fastVenueInputSchema } from '@my-app/types';

export class PlatformLoginDto extends createZodDto(platformLoginSchema) {}
export class PlatformTrackHitDto extends createZodDto(platformTrackHitSchema) {}
export class FastVenueDto extends createZodDto(fastVenueInputSchema) {}
