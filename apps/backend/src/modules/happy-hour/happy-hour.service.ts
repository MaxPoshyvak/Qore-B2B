import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
    CreateHappyHourDto,
    HappyHourLinkedEntity,
    HappyHourRuleResponse,
    UpdateHappyHourDto,
} from '@my-app/types';

// Скорочений вибір пов'язаних сутностей (лише id та name)
const linkedEntitySelect = {
    id: true,
    name: true,
} as const;

@Injectable()
export class HappyHourService {
    constructor(private readonly prisma: PrismaService) {}

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

    // Перетворює модель Prisma у формат відповіді API
    private mapRule(rule: {
        id: string;
        name: string;
        daysOfWeek: number[];
        startTime: string;
        endTime: string;
        discountType: 'PERCENTAGE' | 'FIXED';
        discountValue: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        categories: HappyHourLinkedEntity[];
        items: HappyHourLinkedEntity[];
    }): HappyHourRuleResponse {
        return {
            id: rule.id,
            name: rule.name,
            daysOfWeek: rule.daysOfWeek,
            startTime: rule.startTime,
            endTime: rule.endTime,
            discountType: rule.discountType,
            discountValue: rule.discountValue,
            isActive: rule.isActive,
            categories: rule.categories,
            items: rule.items,
            createdAt: rule.createdAt.toISOString(),
            updatedAt: rule.updatedAt.toISOString(),
        };
    }

    /**
     * Створює нове правило Happy Hour для веню.
     * Прив'язує категорії та позиції меню через масив connect.
     */
    async createRule(tenantId: string, dto: CreateHappyHourDto): Promise<HappyHourRuleResponse> {
        const created = await this.prisma.happyHourRule.create({
            data: {
                tenantId,
                name: dto.name,
                daysOfWeek: dto.daysOfWeek,
                startTime: dto.startTime,
                endTime: dto.endTime,
                discountType: dto.discountType,
                discountValue: dto.discountValue,
                categories: dto.categoryIds?.length
                    ? { connect: dto.categoryIds.map((id) => ({ id })) }
                    : undefined,
                items: dto.itemIds?.length
                    ? { connect: dto.itemIds.map((id) => ({ id })) }
                    : undefined,
            },
            include: {
                categories: { select: linkedEntitySelect },
                items: { select: linkedEntitySelect },
            },
        });

        return this.mapRule(created);
    }

    /**
     * Повертає всі правила Happy Hour веню для дашборду
     * разом із пов'язаними категоріями та позиціями меню.
     */
    async getRules(tenantId: string): Promise<HappyHourRuleResponse[]> {
        const rules = await this.prisma.happyHourRule.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            include: {
                categories: { select: linkedEntitySelect },
                items: { select: linkedEntitySelect },
            },
        });

        return rules.map((rule) => this.mapRule(rule));
    }

    /**
     * Оновлює правило Happy Hour. Якщо передано categoryIds / itemIds,
     * зв'язки повністю перезаписуються через set.
     */
    async updateRule(
        tenantId: string,
        id: string,
        dto: UpdateHappyHourDto,
    ): Promise<HappyHourRuleResponse> {
        const existing = await this.prisma.happyHourRule.findUnique({
            where: { id },
            select: { tenantId: true },
        });

        if (!existing || existing.tenantId !== tenantId) {
            throw new NotFoundException('Happy hour rule not found');
        }

        const updated = await this.prisma.happyHourRule.update({
            where: { id },
            data: {
                name: dto.name,
                daysOfWeek: dto.daysOfWeek,
                startTime: dto.startTime,
                endTime: dto.endTime,
                discountType: dto.discountType,
                discountValue: dto.discountValue,
                isActive: dto.isActive,
                categories:
                    dto.categoryIds !== undefined
                        ? { set: dto.categoryIds.map((categoryId) => ({ id: categoryId })) }
                        : undefined,
                items:
                    dto.itemIds !== undefined
                        ? { set: dto.itemIds.map((itemId) => ({ id: itemId })) }
                        : undefined,
            },
            include: {
                categories: { select: linkedEntitySelect },
                items: { select: linkedEntitySelect },
            },
        });

        return this.mapRule(updated);
    }

    /**
     * Видаляє правило Happy Hour. Перевіряє належність до веню.
     */
    async deleteRule(tenantId: string, id: string): Promise<{ id: string }> {
        const existing = await this.prisma.happyHourRule.findUnique({
            where: { id },
            select: { tenantId: true },
        });

        if (!existing || existing.tenantId !== tenantId) {
            throw new NotFoundException('Happy hour rule not found');
        }

        await this.prisma.happyHourRule.delete({
            where: { id },
        });

        return { id };
    }

    /**
     * Повертає лише активні правила Happy Hour для публічного меню
     * (за slug веню). Фільтрація за поточним часом виконується на фронтенді.
     */
    async getActivePublicRules(slug: string): Promise<HappyHourRuleResponse[]> {
        const tenantId = await this.resolveTenantIdBySlug(slug);

        const rules = await this.prisma.happyHourRule.findMany({
            where: { tenantId, isActive: true },
            orderBy: { createdAt: 'desc' },
            include: {
                categories: { select: linkedEntitySelect },
                items: { select: linkedEntitySelect },
            },
        });

        return rules.map((rule) => this.mapRule(rule));
    }

    /**
     * Повертає правила Happy Hour, що активні САМЕ ЗАРАЗ (на боці сервера),
     * для динамічного застосування знижок під час створення замовлення.
     * Логіка збігається з фронтенд-хуком `isRuleActiveNow`.
     */
    async getActiveRulesForTenant(tenantId: string): Promise<HappyHourRuleResponse[]> {
        const rules = await this.prisma.happyHourRule.findMany({
            where: { tenantId, isActive: true },
            orderBy: { createdAt: 'desc' },
            include: {
                categories: { select: linkedEntitySelect },
                items: { select: linkedEntitySelect },
            },
        });

        const now = new Date();
        return rules.filter((rule) => this.isActiveNow(rule, now)).map((rule) => this.mapRule(rule));
    }

    /** Чи діє правило у вказаний момент (день тижня + час, з урахуванням переходу через північ). */
    private isActiveNow(
        rule: { daysOfWeek: number[]; startTime: string; endTime: string },
        now: Date,
    ): boolean {
        const today = now.getDay();
        if (!rule.daysOfWeek.includes(today)) return false;

        const timeToMinutes = (time: string): number => {
            const [hh, mm] = time.split(':').map((n) => Number.parseInt(n, 10));
            return (Number.isFinite(hh) ? hh : 0) * 60 + (Number.isFinite(mm) ? mm : 0);
        };

        const start = timeToMinutes(rule.startTime);
        const end = timeToMinutes(rule.endTime);
        const current = now.getHours() * 60 + now.getMinutes();

        if (start === end) return false;
        if (end < start) return current >= start || current < end;
        return current >= start && current < end;
    }
}
