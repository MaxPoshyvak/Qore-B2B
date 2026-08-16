import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { SuccessResponse } from '@my-app/types';
import { MenuCategory } from '@my-app/database';
import type { CreateCategoryDTO, PublicMenuResponseDTO, UpdateCategoryDTO } from '@my-app/types';

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) {}

    private async assertOwnsTenant(tenantId: string, userId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { ownerId: true },
        });

        if (!tenant || tenant.ownerId !== userId) {
            throw new ForbiddenException('Access denied to this venue');
        }
    }

    async createCategory(dto: CreateCategoryDTO, userId: string): Promise<SuccessResponse<MenuCategory>> {
        await this.assertOwnsTenant(dto.tenantId, userId);

        const result = await this.prisma.menuCategory.create({
            data: { name: dto.name, tenantId: dto.tenantId },
        });

        return { success: true, data: result };
    }

    async getCategoriesByTenant(tenantId: string, userId: string): Promise<SuccessResponse<MenuCategory[]>> {
        await this.assertOwnsTenant(tenantId, userId);

        const result = await this.prisma.menuCategory.findMany({
            where: { tenantId },
            orderBy: { sortOrder: 'asc' },
            include: { items: { orderBy: { sortOrder: 'asc' } } },
        });

        return { success: true, data: result };
    }

    async updateCategory(id: string, dto: UpdateCategoryDTO, userId: string): Promise<SuccessResponse<MenuCategory>> {
        const existing = await this.prisma.menuCategory.findUnique({
            where: { id },
            select: { tenantId: true },
        });
        if (!existing) throw new NotFoundException('Category not found');
        await this.assertOwnsTenant(existing.tenantId, userId);

        const result = await this.prisma.menuCategory.update({
            where: { id },
            data: { name: dto.name },
        });

        return { success: true, data: result };
    }

    async deleteCategory(id: string, userId: string): Promise<SuccessResponse<MenuCategory>> {
        const existing = await this.prisma.menuCategory.findUnique({
            where: { id },
            select: { tenantId: true },
        });
        if (!existing) throw new NotFoundException('Category not found');
        await this.assertOwnsTenant(existing.tenantId, userId);

        const result = await this.prisma.menuCategory.delete({ where: { id } });

        return { success: true, data: result };
    }

    /**
     * Read-only, auth-free menu for venue guests, resolved by `slug`.
     *
     * Differs from `getCategoriesByTenant` in three ways: no owner check, only
     * in-stock items are returned (Prisma `isActive` ← write contract
     * `isAvailable`), and empty categories are dropped so guests never see
     * headers with no dishes.
     */
    async getPublicMenuBySlug(slug: string): Promise<SuccessResponse<PublicMenuResponseDTO>> {
        if (!slug || typeof slug !== 'string') {
            throw new NotFoundException('Venue not found');
        }

        const tenant = await this.prisma.tenant.findFirst({
            where: { slug },
            include: { settings: true },
        });

        if (!tenant) throw new NotFoundException('Venue not found');

        const categories = await this.prisma.menuCategory.findMany({
            where: {
                tenantId: tenant.id,
                isActive: true,
                items: { some: { isActive: true } },
            },
            orderBy: { sortOrder: 'asc' },
            include: {
                items: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        const result: PublicMenuResponseDTO = {
            venue: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                // Profile fields live on `TenantSettings` (1-to-1), not `Tenant`.
                description: tenant.settings?.description ?? null,
                logoUrl: tenant.settings?.logoUrl ?? null,
            },
            categories: categories.map((category) => ({
                ...category,
                // Decimal columns serialize to strings over the wire.
                items: category.items.map((item) => ({
                    ...item,
                    price: item.price.toString(),
                    happyHourPrice: item.happyHourPrice?.toString() ?? null,
                })),
            })),
        };

        return { success: true, data: result };
    }
}
