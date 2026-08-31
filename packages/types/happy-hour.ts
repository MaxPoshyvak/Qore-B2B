import { z } from 'zod';

// Тип знижки (синхронізовано з enum DiscountType у Prisma)
export const DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED'] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

// Дні тижня: 0 = Неділя, 6 = Субота
const dayOfWeekSchema = z
    .number()
    .int('Day of week must be a whole number')
    .min(0, 'Day of week must be between 0 and 6')
    .max(6, 'Day of week must be between 0 and 6');

// Час у форматі HH:mm (наприклад, "16:00")
const timeSchema = z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format');

// Схема створення правила Happy Hour
export const CreateHappyHourSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    daysOfWeek: z
        .array(dayOfWeekSchema)
        .min(1, 'Select at least one day of the week'),
    startTime: timeSchema,
    endTime: timeSchema,
    discountType: z.enum(DISCOUNT_TYPES),
    discountValue: z
        .number()
        .positive('Discount value must be greater than 0'),
    categoryIds: z.array(z.string()).optional(),
    itemIds: z.array(z.string()).optional(),
});

export type CreateHappyHourDto = z.infer<typeof CreateHappyHourSchema>;

// Схема оновлення правила Happy Hour (усі поля необов'язкові)
export const UpdateHappyHourSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long').optional(),
    daysOfWeek: z
        .array(dayOfWeekSchema)
        .min(1, 'Select at least one day of the week')
        .optional(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional(),
    discountType: z.enum(DISCOUNT_TYPES).optional(),
    discountValue: z
        .number()
        .positive('Discount value must be greater than 0')
        .optional(),
    isActive: z.boolean().optional(),
    categoryIds: z.array(z.string()).optional(),
    itemIds: z.array(z.string()).optional(),
});

export type UpdateHappyHourDto = z.infer<typeof UpdateHappyHourSchema>;

// Скорочена інформація про категорію/позицію меню у відповіді
export interface HappyHourLinkedEntity {
    id: string;
    name: string;
}

// Повна відповідь із правилом Happy Hour
export interface HappyHourRuleResponse {
    id: string;
    name: string;
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
    discountType: DiscountType;
    discountValue: number;
    isActive: boolean;
    categories: HappyHourLinkedEntity[];
    items: HappyHourLinkedEntity[];
    createdAt: string;
    updatedAt: string;
}
