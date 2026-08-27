import { createZodDto } from 'nestjs-zod';
import { updateReservationSchema } from '@my-app/types';

export class UpdateReservationDto extends createZodDto(updateReservationSchema) {}
