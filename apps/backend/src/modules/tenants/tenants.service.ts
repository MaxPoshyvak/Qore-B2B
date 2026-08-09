import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTenantDto } from './dto/tenants.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { SuccessResponse } from '@my-app/types';
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
}
