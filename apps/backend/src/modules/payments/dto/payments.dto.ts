import { createZodDto } from 'nestjs-zod';
import {
    createOrderPaymentSchema,
    createEqualSplitPaymentSchema,
    createItemSplitPaymentSchema,
    unlockSplitItemsSchema,
    verifyOrderPaymentSchema,
} from '@my-app/types';

export class CreateOrderPaymentDto extends createZodDto(createOrderPaymentSchema) {}
export class CreateEqualSplitPaymentDto extends createZodDto(createEqualSplitPaymentSchema) {}
export class CreateItemSplitPaymentDto extends createZodDto(createItemSplitPaymentSchema) {}
export class UnlockSplitItemsDto extends createZodDto(unlockSplitItemsSchema) {}
export class VerifyOrderPaymentDto extends createZodDto(verifyOrderPaymentSchema) {}
