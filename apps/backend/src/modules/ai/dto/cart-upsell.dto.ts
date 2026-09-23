import { createZodDto } from 'nestjs-zod';
import { cartUpsellInputSchema } from '@my-app/types';

export class CartUpsellDto extends createZodDto(cartUpsellInputSchema) {}
