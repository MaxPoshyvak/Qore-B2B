import { createZodDto } from 'nestjs-zod';
import { createReservationSchema } from '@my-app/types';

export class CreateReservationDto extends createZodDto(createReservationSchema) {}
