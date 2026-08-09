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
}