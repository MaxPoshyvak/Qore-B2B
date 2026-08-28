import { z } from 'zod';

// Можливі стани відгуку (синхронізовано з enum FeedbackStatus у Prisma)
export const FEEDBACK_STATUSES = ['published', 'flagged'] as const;
export type FeedbackStatusType = (typeof FEEDBACK_STATUSES)[number];

// Схема створення публічного відгуку гостем
export const CreateFeedbackSchema = z.object({
    rating: z
        .number()
        .int('Rating must be a whole number')
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating must be at most 5'),
    comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
    guestName: z.string().optional(),
    orderId: z.string().optional(),
});

export type CreateFeedbackDto = z.infer<typeof CreateFeedbackSchema>;

// Схема модерації (схвалення/повернення у прихований стан)
export const ModerateFeedbackSchema = z.object({
    status: z.enum(FEEDBACK_STATUSES),
});

export type ModerateFeedbackDto = z.infer<typeof ModerateFeedbackSchema>;

// Публічна відповідь: лише опубліковані відгуки без службових полів
export interface PublicFeedbackResponse {
    id: string;
    guestName: string | null;
    rating: number;
    comment: string | null;
    createdAt: string;
}

// Відповідь дашборду: усі відгуки + пов’язане замовлення
export interface DashboardFeedbackResponse {
    id: string;
    rating: number;
    comment: string | null;
    guestName: string | null;
    status: FeedbackStatusType;
    aiSummaryBatch: string | null;
    createdAt: string;
    order: {
        id: string;
        totalAmount: number;
        createdAt: string;
    } | null;
}

// Відповідь після створення відгуку
export interface FeedbackCreatedResponse {
    id: string;
    rating: number;
    comment: string | null;
    guestName: string | null;
    status: FeedbackStatusType;
    createdAt: string;
}
