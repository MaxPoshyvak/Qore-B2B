import { createZodDto } from 'nestjs-zod';
import { aiWaiterChatInputSchema } from '@my-app/types';

export class WaiterChatDto extends createZodDto(aiWaiterChatInputSchema) {}
