import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import type { CreateMenuItemDTO, UpdateMenuItemDTO } from '@my-app/types';

@Injectable()
export class MenuItemsService {
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

    async createMenuItem(dto: CreateMenuItemDTO, userId: string) {
        await this.assertOwnsTenant(dto.tenantId, userId);

        return this.prisma.menuItem.create({
            data: {
                name: dto.name,
                price: dto.price,
                description: dto.description,
                categoryId: dto.categoryId,
                tenantId: dto.tenantId,
                isActive: dto.isAvailable,
            },
        });
    }

    async updateMenuItem(id: string, dto: UpdateMenuItemDTO, userId: string) {
        const existing = await this.prisma.menuItem.findUnique({
            where: { id },
            select: { tenantId: true },
        });
        if (!existing) throw new NotFoundException('Menu item not found');
        await this.assertOwnsTenant(existing.tenantId, userId);

        return this.prisma.menuItem.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.price !== undefined && { price: dto.price }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
                ...(dto.isAvailable !== undefined && { isActive: dto.isAvailable }),
            },
        });
    }

    async deleteMenuItem(id: string, userId: string) {
        const existing = await this.prisma.menuItem.findUnique({
            where: { id },
            select: { tenantId: true },
        });
        if (!existing) throw new NotFoundException('Menu item not found');
        await this.assertOwnsTenant(existing.tenantId, userId);

        return this.prisma.menuItem.delete({ where: { id } });
    }
}