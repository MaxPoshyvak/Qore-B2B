import { apiClient } from '@/lib/api-client';
import type {
    CreateFeedbackDto,
    FeedbackCreatedResponse,
    DashboardFeedbackResponse,
    PublicFeedbackResponse,
    ReviewDigestResponse,
} from '@my-app/types';

export interface SubmitFeedbackInput {
    rating: number;
    comment?: string;
    guestName?: string;
    orderId?: string;
}

const FEEDBACK_URL = '/feedback';

/** Feedback API — усі відповіді "розгортаються" з `SuccessResponse<T>`. */
export class FeedbackApi {
    /** POST /api/public/feedback/:slug — створення відгуку гостем. */
    static async submitFeedback(slug: string, data: SubmitFeedbackInput): Promise<FeedbackCreatedResponse> {
        const res = await apiClient<FeedbackCreatedResponse>(`/public${FEEDBACK_URL}/${slug}`, {
            method: 'POST',
            body: JSON.stringify(data as CreateFeedbackDto),
        });
        return res.data;
    }

    /** GET /api/public/feedback/:slug — опубліковані відгуки для публічної сторінки. */
    static async getPublicFeedbacks(slug: string): Promise<PublicFeedbackResponse[]> {
        const res = await apiClient<PublicFeedbackResponse[]>(`/public${FEEDBACK_URL}/${slug}`);
        return res.data;
    }

    /** GET /api/feedback/:tenantId — усі відгуки (включно з прихованими) для дашборду. */
    static async getDashboardFeedbacks(tenantId: string): Promise<DashboardFeedbackResponse[]> {
        const res = await apiClient<DashboardFeedbackResponse[]>(`${FEEDBACK_URL}/${tenantId}`);
        return res.data;
    }

    /** PATCH /api/feedback/:tenantId/:id/approve — схвалення прихованого відгуку. */
    static async approveFeedback(tenantId: string, feedbackId: string): Promise<DashboardFeedbackResponse> {
        const res = await apiClient<DashboardFeedbackResponse>(`${FEEDBACK_URL}/${tenantId}/${feedbackId}/approve`, {
            method: 'PATCH',
        });
        return res.data;
    }

    /** GET /api/feedback/:tenantId/digest — AI-дайджест відгуків (Pro). */
    static async getReviewDigest(tenantId: string): Promise<ReviewDigestResponse> {
        const res = await apiClient<ReviewDigestResponse>(`${FEEDBACK_URL}/${tenantId}/digest`);
        return res.data;
    }
}
