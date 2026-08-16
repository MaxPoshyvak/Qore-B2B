import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTenantDto } from './dto/tenants.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { SuccessResponse, UpdateTenantSettingsDto } from '@my-app/types';
import { Tenant } from '@my-app/database';

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

    async updateTenantSettings(
        slug: string,
        dto: UpdateTenantSettingsDto,
        userId: string,
    ): Promise<SuccessResponse<Tenant>> {
        const tenant = await this.prisma.tenant.findFirst({
            where: { slug, ownerId: userId },
        });

        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }

        const updatedTenant = await this.prisma.tenant.update({
            where: { slug },
            data: {
                settings: {
                    update: {
                        name: dto.name,
                        description: dto.description,
                        logoUrl: dto.logoUrl,
                        coverUrl: dto.coverUrl,
                        phone: dto.phone,
                        address: dto.address,
                        instagramUrl: dto.instagramUrl,
                        googleMapsUrl: dto.googleMapsUrl,
                        wifiName: dto.wifiName,
                        wifiPassword: dto.wifiPassword,
                        workingHours: dto.workingHours,
                    },
                },
            },
            include: { settings: true },
        });

        return { success: true, data: updatedTenant };
    }
}
