import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomInt } from 'crypto';
import { CreateTenantDto } from './dto/tenants.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { SuccessResponse, UpdateTenantSettingsDto } from '@my-app/types';
import { Prisma, Tenant } from '@my-app/database';

@Injectable()
export class TenantsService {
    constructor(private prisma: PrismaService) {}

    async createTenant(dto: CreateTenantDto, userId: string): Promise<SuccessResponse<Tenant>> {
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

    async getTenantBySlug(slug: string, userId: string): Promise<SuccessResponse<Tenant>> {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug, ownerId: userId },
            include: { settings: true },
        });

        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }

        return { success: true, data: tenant };
    }

    /**
     * Public, auth-free tenant lookup for the B2C venue page. Resolves by slug
     * only and always joins `settings` so guests see hours, Wi-Fi and location
     * without a JWT. The 404 must stay indistinguishable from an unauthorized
     * call, hence no ownership/session check here.
     */
    async getPublicTenantBySlug(slug: string): Promise<SuccessResponse<Tenant>> {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug },
            include: { settings: true },
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

        const { name, workingHours, ...settingsData } = dto;

        // 1. Оновлюємо назву закладу у базовій моделі Tenant, якщо вона змінилась
        if (name && name !== tenant.name) {
            await this.prisma.tenant.update({
                where: { id: tenant.id },
                data: { name },
            });
        }

        // 2. Готуємо об'єкт налаштувань
        const formattedSettings: Prisma.TenantSettingsUpdateInput = {
            ...settingsData,
        };

        if (workingHours !== undefined) {
            formattedSettings.workingHours = workingHours as Prisma.InputJsonValue;
        }

        // 3. Атомарно оновлюємо або створюємо налаштування
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
}
