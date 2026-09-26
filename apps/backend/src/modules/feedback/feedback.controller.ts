import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TenantGuard } from 'src/common/guards/tenant.guard';
import { SubscriptionGuard } from 'src/common/guards/subscription.guard';
import { RequirePlan } from 'src/common/decorators/require-plan.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import {
    DashboardFeedbackResponse,
    FeedbackCreatedResponse,
    PublicFeedbackResponse,
    ReviewDigestResponse,
    SuccessResponse,
} from '@my-app/types';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/feedback.dto';
import { ReviewDigestService } from '../ai/services/review-digest.service';

@Controller()
export class FeedbackController {
    constructor(
        private readonly feedbackService: FeedbackService,
        private readonly reviewDigestService: ReviewDigestService,
    ) {}

    // === Публічні маршрути (гості, без автентифікації) ===

    // Створення відгуку гостем
    @Public()
    @Post('public/feedback/:slug')
    async createPublicFeedback(
        @Param('slug') slug: string,
        @Body() dto: CreateFeedbackDto,
    ): Promise<SuccessResponse<FeedbackCreatedResponse>> {
        const data = await this.feedbackService.createPublicFeedback(slug, dto);
        return { success: true, data, message: 'Feedback submitted successfully' };
    }

    // Публічний список опублікованих відгуків для сторінки веню
    @Public()
    @Get('public/feedback/:slug')
    async getPublicFeedbacks(
        @Param('slug') slug: string,
    ): Promise<SuccessResponse<PublicFeedbackResponse[]>> {
        const data = await this.feedbackService.getPublicFeedbacks(slug);
        return { success: true, data };
    }

    // === Захищені маршрути (дашборд власника) ===

    // Усі відгуки веню для дашборду
    @UseGuards(JwtAuthGuard, TenantGuard)
    @Get('feedback/:tenantId')
    async getDashboardFeedbacks(
        @Param('tenantId') tenantId: string,
    ): Promise<SuccessResponse<DashboardFeedbackResponse[]>> {
        const data = await this.feedbackService.getDashboardFeedbacks(tenantId);
        return { success: true, data };
    }

    // AI Digest — аналіз відгуків (Pro)
    @UseGuards(JwtAuthGuard, TenantGuard, SubscriptionGuard)
    @RequirePlan('pro')
    @Get('feedback/:tenantId/digest')
    async getReviewDigest(
        @Param('tenantId') tenantId: string,
    ): Promise<SuccessResponse<ReviewDigestResponse>> {
        const data = await this.reviewDigestService.getOrGenerateDigest(tenantId);
        return { success: true, data };
    }

    // Схвалення прихованого відгуку (зміна статусу → 'published')
    @UseGuards(JwtAuthGuard, TenantGuard)
    @Patch('feedback/:tenantId/:id/approve')
    async approveFeedback(
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
    ): Promise<SuccessResponse<DashboardFeedbackResponse>> {
        const data = await this.feedbackService.moderateFeedback(tenantId, id, 'published');
        return { success: true, data, message: 'Feedback approved' };
    }
}
