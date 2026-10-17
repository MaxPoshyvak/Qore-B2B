import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomInt } from 'crypto';
import { CreateTenantDto } from './dto/tenants.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
    DEFAULT_THEME_CONFIG,
    isReservedSlug,
    PublicTenantResponse,
    SuccessResponse,
    THEME_PRESETS,
    ThemeConfig,
    UpdateTenantSettingsDto,
    UpdateTenantThemeDto,
} from '@my-app/types';
import { Prisma, Tenant, TenantTheme } from '@my-app/database';


@Injectable()
export class TenantsService {
    constructor(private prisma: PrismaService) {}

    async createTenant(dto: CreateTenantDto, userId: string): Promise<SuccessResponse<Tenant>> {
        if (isReservedSlug(dto.slug)) {
            throw new BadRequestException('This URL (slug) is reserved for system use and cannot be used.');
        }

        const existingTenants = await this.prisma.tenant.findMany({
            where: { ownerId: userId },
            select: { id: true, subscriptionPlan: true },
        });

        if (existingTenants.length > 0) {
            const hasBusinessPlan = existingTenants.some(
                (tenant) => tenant.subscriptionPlan === 'business', // або 'BUSINESS', залежно від твого Enum
            );

            if (!hasBusinessPlan) {
                throw new ForbiddenException(
                    'Limit reached: You can only create more than one venue with a business subscription plan.',
                );
            }
        }

        const existingSlug = await this.prisma.tenant.findUnique({
            where: { slug: dto.slug },
        });

        if (existingSlug) {
            throw new ConflictException('Ця адреса (slug) вже зайнята');
        }

        const tenant = await this.prisma.tenant.create({
            data: {
                name: dto.name,
                slug: dto.slug,
                ownerId: userId,
                settings: {
                    create: {
                        workingHours: {},
                    },
                },
            },
        });

        return { success: true, data: tenant };
    }

    async getTenantsByUserId(userId: string): Promise<SuccessResponse<Tenant[]>> {
        const existingTenants = await this.prisma.tenant.findMany({
            where: { ownerId: userId },
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: existingTenants };
    }

    async getTenantBySlug(slug: string, userId: string): Promise<SuccessResponse<PublicTenantResponse>> {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug, ownerId: userId },
            include: { settings: true, activeTheme: true },
        });

        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }

        return { success: true, data: tenant };
    }

    /**
     * Public, auth-free tenant lookup for the B2C venue page. Resolves by slug
     * only and always joins `settings` and `activeTheme` so guests see hours,
     * Wi-Fi, location, and customized themes without a JWT.
     */
    async getPublicTenantBySlug(slug: string): Promise<SuccessResponse<PublicTenantResponse>> {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug },
            include: { settings: true, activeTheme: true },
        });

        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }

        return { success: true, data: tenant };
    }

    /**
     * Resolves a tenant by id, scoped to the owning user. Throws when the venue
     * does not exist or the caller is not its owner — used to authorize tenant
     * scoped operations (e.g. orders) triggered from the dashboard.
     */
    async getTenantById(tenantId: string, userId: string): Promise<Tenant> {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId, ownerId: userId },
        });

        if (!tenant) {
            throw new NotFoundException('Venue not found or access denied');
        }

        return tenant;
    }

    async updateTenantSettings(slug: string, dto: UpdateTenantSettingsDto, userId: string) {
        const tenant = await this.prisma.tenant.findFirst({
            where: { slug, ownerId: userId },
            include: { settings: true },
        });

        if (!tenant) {
            throw new NotFoundException('Tenant not found or access denied');
        }

        const { name, workingHours, convertPrices, conversionRate, ...settingsData } = dto;

        // 1. Оновлюємо назву закладу у базовій моделі Tenant, якщо вона змінилась
        if (name && name !== tenant.name) {
            await this.prisma.tenant.update({
                where: { id: tenant.id },
                data: { name },
            });
        }

        // 2. Якщо користувач обрав конвертацію цін страв за курсом
        if (convertPrices && conversionRate && conversionRate > 0) {
            await this.prisma.$transaction(async (tx) => {
                const menuItems = await tx.menuItem.findMany({
                    where: { tenantId: tenant.id },
                    select: { id: true, price: true, happyHourPrice: true },
                });

                for (const item of menuItems) {
                    const newPrice = Math.round(Number(item.price) * conversionRate * 100) / 100;
                    const newHappyHour =
                        item.happyHourPrice != null
                            ? Math.round(Number(item.happyHourPrice) * conversionRate * 100) / 100
                            : null;

                    await tx.menuItem.update({
                        where: { id: item.id },
                        data: {
                            price: new Prisma.Decimal(newPrice),
                            happyHourPrice: newHappyHour != null ? new Prisma.Decimal(newHappyHour) : null,
                        },
                    });
                }

                const modifierOptions = await tx.modifierOption.findMany({
                    where: { group: { menuItem: { tenantId: tenant.id } } },
                    select: { id: true, priceAdjustment: true },
                });

                for (const opt of modifierOptions) {
                    if (Number(opt.priceAdjustment) !== 0) {
                        const newAdj = Math.round(Number(opt.priceAdjustment) * conversionRate * 100) / 100;
                        await tx.modifierOption.update({
                            where: { id: opt.id },
                            data: {
                                priceAdjustment: new Prisma.Decimal(newAdj),
                            },
                        });
                    }
                }
            });
        }

        // 3. Готуємо об'єкт налаштувань
        const formattedSettings: Prisma.TenantSettingsUpdateInput = {
            ...settingsData,
        };

        if (workingHours !== undefined) {
            formattedSettings.workingHours = workingHours as Prisma.InputJsonValue;
        }

        // 4. Атомарно оновлюємо або створюємо налаштування
        const updatedTenant = await this.prisma.tenant.update({
            where: { id: tenant.id },
            data: {
                settings: {
                    upsert: {
                        create: {
                            ...(settingsData as Prisma.TenantSettingsCreateWithoutTenantInput),
                            workingHours: (workingHours ?? {}) as Prisma.InputJsonValue,
                        },
                        update: formattedSettings,
                    },
                },
            },
            include: { settings: true },
        });

        return { success: true, data: updatedTenant };
    }

    /**
     * Generates a fresh KDS credential pair for the venue: a unique `kdsToken`
     * (cuid) and a random 4-digit `kdsPin`. Saved on `TenantSettings`; returns both.
     */
    async generateKdsAccess(tenantId: string, userId: string): Promise<SuccessResponse<{ kdsToken: string; kdsPin: string }>> {
        await this.getTenantById(tenantId, userId);

        const kdsToken = crypto.randomUUID();
        const kdsPin = String(randomInt(0, 9999)).padStart(4, '0');

        await this.prisma.tenantSettings.update({
            where: { tenantId },
            data: { kdsToken, kdsPin },
        });

        return { success: true, data: { kdsToken, kdsPin } };
    }

    /** Revokes KDS access by clearing the token + pin on `TenantSettings`. */
    async revokeKdsAccess(tenantId: string, userId: string): Promise<SuccessResponse<{ kdsToken: null; kdsPin: null }>> {
        await this.getTenantById(tenantId, userId);

        await this.prisma.tenantSettings.update({
            where: { tenantId },
            data: { kdsToken: null, kdsPin: null },
        });

        return { success: true, data: { kdsToken: null, kdsPin: null } };
    }

    /** Returns the active theme for a venue, falling back to Modern Minimal default. */
    async getTenantTheme(slug: string): Promise<SuccessResponse<ThemeConfig>> {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug },
            include: { activeTheme: true },
        });

        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }

        const config = (tenant.activeTheme?.themeConfig as ThemeConfig | undefined) ?? DEFAULT_THEME_CONFIG;
        return { success: true, data: config };
    }

    /** Updates or sets a venue's active theme (from a preset or custom config). */
    async updateTenantTheme(
        slug: string,
        dto: UpdateTenantThemeDto,
        userId: string,
    ): Promise<SuccessResponse<{ id: string; themeConfig: ThemeConfig; isAiGenerated: boolean }>> {
        const tenant = await this.prisma.tenant.findFirst({
            where: { slug, ownerId: userId },
            include: { activeTheme: true },
        });

        if (!tenant) {
            throw new NotFoundException('Venue not found or access denied');
        }

        let resolvedConfig: ThemeConfig = DEFAULT_THEME_CONFIG;

        if (dto.presetId && THEME_PRESETS[dto.presetId]) {
            resolvedConfig = THEME_PRESETS[dto.presetId];
        } else if (dto.customConfig) {
            resolvedConfig = dto.customConfig;
        }

        const isAi = !dto.presetId && Boolean(dto.customConfig);

        const newTheme = await this.prisma.tenantTheme.create({
            data: {
                tenantId: tenant.id,
                themeConfig: resolvedConfig as unknown as Prisma.InputJsonValue,
                isAiGenerated: isAi,
            },
        });

        await this.prisma.tenant.update({
            where: { id: tenant.id },
            data: { activeThemeId: newTheme.id },
        });

        return {
            success: true,
            data: {
                id: newTheme.id,
                themeConfig: resolvedConfig,
                isAiGenerated: isAi,
            },
        };
    }
}

