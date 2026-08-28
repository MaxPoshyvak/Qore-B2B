import { Injectable, NotFoundException } from '@nestjs/common';
import { FeedbackStatus, Prisma } from '@my-app/database';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ProfanityService } from 'src/common/profanity/profanity.service';
import {
    CreateFeedbackDto,
    DashboardFeedbackResponse,
    FeedbackCreatedResponse,
    PublicFeedbackResponse,
} from '@my-app/types';

@Injectable()
export class FeedbackService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly profanityService: ProfanityService,
    ) {}

    // Знаходить tenantId за публічним slug веню
    private async resolveTenantIdBySlug(slug: string): Promise<string> {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!tenant) {
            throw new NotFoundException('Venue not found');
        }

        return tenant.id;
    }

    /**
     * Створює відгук від імені гостя (публічний потік).
     * Якщо у comment виявлено нецензурну лексику — статус 'flagged',
     * інакше — 'published'. Прив’язує необов’язкове orderId.
     */
    async createPublicFeedback(slug: string, dto: CreateFeedbackDto): Promise<FeedbackCreatedResponse> {
        const tenantId = await this.resolveTenantIdBySlug(slug);

        // Проганяємо коментар через фільтр нецензурної лексики
        const hasProfanity = dto.comment ? this.profanityService.containsProfanity(dto.comment) : false;
        const status: FeedbackStatus = hasProfanity ? 'flagged' : 'published';

        const created = await this.prisma.feedback.create({
            data: {
                tenantId,
                rating: dto.rating,
                comment: dto.comment ?? null,
                guestName: dto.guestName ?? null,
                orderId: dto.orderId ?? null,
                status,
            },
        });

        return {
            id: created.id,
            rating: created.rating,
            comment: created.comment,
            guestName: created.guestName,
            status: created.status,
            createdAt: created.createdAt.toISOString(),
        };
    }

    /**
     * Повертає лише опубліковані відгуки веню для публічної сторінки.
     * Приховані (flagged) відгуки не потрапляють до вибірки.
     */
    async getPublicFeedbacks(slug: string): Promise<PublicFeedbackResponse[]> {
        const tenantId = await this.resolveTenantIdBySlug(slug);

        const feedbacks = await this.prisma.feedback.findMany({
            where: { tenantId, status: 'published' },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                guestName: true,
                rating: true,
                comment: true,
                createdAt: true,
            },
        });

        return feedbacks.map((feedback) => ({
            id: feedback.id,
            guestName: feedback.guestName,
            rating: feedback.rating,
            comment: feedback.comment,
            createdAt: feedback.createdAt.toISOString(),
        }));
    }

    /**
     * Повертає ВСІ відгуки веню (опубліковані та приховані) для дашборду
     * власника разом із даними пов’язаного замовлення (сума, дата).
     */
    async getDashboardFeedbacks(tenantId: string): Promise<DashboardFeedbackResponse[]> {
        const feedbacks = await this.prisma.feedback.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            include: {
                order: {
                    select: {
                        id: true,
                        totalAmount: true,
                        createdAt: true,
                    },
                },
            },
        });

        return feedbacks.map((feedback) => ({
            id: feedback.id,
            rating: feedback.rating,
            comment: feedback.comment,
            guestName: feedback.guestName,
            status: feedback.status,
            aiSummaryBatch: feedback.aiSummaryBatch,
            createdAt: feedback.createdAt.toISOString(),
            order: feedback.order
                ? {
                      id: feedback.order.id,
                      totalAmount: Number(feedback.order.totalAmount),
                      createdAt: feedback.order.createdAt.toISOString(),
                  }
                : null,
        }));
    }

    /**
     * Модерація: дозволяє власнику змінити статус відгуку
     * (наприклад, схвалити прихований → 'published').
     */
    async moderateFeedback(
        tenantId: string,
        feedbackId: string,
        status: FeedbackStatus,
    ): Promise<DashboardFeedbackResponse> {
        const existing = await this.prisma.feedback.findUnique({
            where: { id: feedbackId },
            select: { tenantId: true },
        });

        if (!existing || existing.tenantId !== tenantId) {
            throw new NotFoundException('Feedback not found');
        }

        const updated = await this.prisma.feedback.update({
            where: { id: feedbackId },
            data: { status },
            include: {
                order: {
                    select: {
                        id: true,
                        totalAmount: true,
                        createdAt: true,
                    },
                },
            },
        });

        return {
            id: updated.id,
            rating: updated.rating,
            comment: updated.comment,
            guestName: updated.guestName,
            status: updated.status,
            aiSummaryBatch: updated.aiSummaryBatch,
            createdAt: updated.createdAt.toISOString(),
            order: updated.order
                ? {
                      id: updated.order.id,
                      totalAmount: Number(updated.order.totalAmount),
                      createdAt: updated.order.createdAt.toISOString(),
                  }
                : null,
        };
    }
}
