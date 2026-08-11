import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import type { CreateCategoryDTO, UpdateCategoryDTO } from '@my-app/types';

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

    async createCategory(dto: CreateCategoryDTO, userId: string) {
        await this.assertOwnsTenant(dto.tenantId, userId);

        return this.prisma.menuCategory.create({
            data: { name: dto.name, tenantId: dto.tenantId },
        });
    }

    async getCategoriesByTenant(tenantId: string, userId: string) {
        await this.assertOwnsTenant(tenantId, userId);

        return this.prisma.menuCategory.findMany({
            where: { tenantId },
            orderBy: { sortOrder: 'asc' },
            include: { items: { orderBy: { sortOrder: 'asc' } } },
        });
    }

    async updateCategory(id: string, dto: UpdateCategoryDTO, userId: string) {
        const existing = await this.prisma.menuCategory.findUnique({
            where: { id },
            select: { tenantId: true },
        });
        if (!existing) throw new NotFoundException('Category not found');
        await this.assertOwnsTenant(existing.tenantId, userId);

        return this.prisma.menuCategory.update({
            where: { id },
            data: { name: dto.name },
        });
    }

    async deleteCategory(id: string, userId: string) {
        const existing = await this.prisma.menuCategory.findUnique({
            where: { id },
            select: { tenantId: true },
        });
        if (!existing) throw new NotFoundException('Category not found');
        await this.assertOwnsTenant(existing.tenantId, userId);

        return this.prisma.menuCategory.delete({ where: { id } });
    }

    /**
     * Read-only, auth-free menu for venue guests, resolved by `slug`.
     *
     * Differs from `getCategoriesByTenant` in three ways: no owner check, only
     * in-stock items are returned (Prisma `isActive` ← write contract
     * `isAvailable`), and empty categories are dropped so guests never see
     * headers with no dishes.
     */
    async getPublicMenuBySlug(slug: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                logoUrl: true,
            },
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

        return {
            venue: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                description: tenant.description,
                logoUrl: tenant.logoUrl,
            },
            categories: categories.map((category) => ({
                ...category,
                // Decimal/Json columns don't satisfy the serialized response
                // contract (prices are strings over the wire), so map explicitly.
                items: category.items.map((item) => ({
                    ...item,
                    price: item.price.toString(),
                    happyHourPrice: item.happyHourPrice?.toString() ?? null,
                })),
            })),
        };
    }
}