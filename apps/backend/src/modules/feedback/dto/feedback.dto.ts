import { createZodDto } from 'nestjs-zod';
import { CreateFeedbackSchema, ModerateFeedbackSchema } from '@my-app/types';

export class CreateFeedbackDto extends createZodDto(CreateFeedbackSchema) {}

export class ModerateFeedbackDto extends createZodDto(ModerateFeedbackSchema) {}
