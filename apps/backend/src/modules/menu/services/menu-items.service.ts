import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UpsellCacheService } from 'src/modules/ai/services/upsell-cache.service';
import { SuccessResponse } from '@my-app/types';
import { MenuItem, Prisma } from '@my-app/database';
import type { CreateMenuItemDTO, ModifierGroupDTO, UpdateMenuItemDTO } from '@my-app/types';

/** Групи модифікаторів завжди віддаємо разом зі стравою і в стабільному порядку. */
const MODIFIERS_INCLUDE = {
    modifiers: {
        orderBy: { sortOrder: 'asc' },
        include: { options: { orderBy: { sortOrder: 'asc' } } },
    },
} satisfies Prisma.MenuItemInclude;

@Injectable()
export class MenuItemsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly upsellCacheService: UpsellCacheService,
    ) {}

    private async assertOwnsTenant(tenantId: string, userId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { ownerId: true },
        });

        if (!tenant || tenant.ownerId !== userId) {
            throw new ForbiddenException('Access denied to this venue');
        }
    }

    private async invalidateTenantUpsellCache(tenantId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { slug: true },
        });
        if (tenant?.slug) {
            this.upsellCacheService.invalidateVenue(tenant.slug);
        }
    }

    /**
     * Перетворює масив груп із DTO у вкладений `create` для Prisma.
     * Порядок, у якому власник розставив групи та опції у білдері, зберігаємо
     * через `sortOrder` — інакше після ре-фетчу він був би довільним.
     */
    private buildModifiersCreate(modifiers: ModifierGroupDTO[]): Prisma.ModifierGroupCreateWithoutMenuItemInput[] {
        return modifiers.map((group, groupIndex) => ({
            name: group.name,
            minSelections: group.minSelections,
            maxSelections: group.maxSelections,
            sortOrder: groupIndex,
            options: {
                create: group.options.map((option, optionIndex) => ({
                    name: option.name,
                    priceAdjustment: option.priceAdjustment,
                    sortOrder: optionIndex,
                })),
            },
        }));
    }

    async createMenuItem(dto: CreateMenuItemDTO, userId: string): Promise<SuccessResponse<MenuItem>> {
        await this.assertOwnsTenant(dto.tenantId, userId);

        const result = await this.prisma.menuItem.create({
            data: {
                name: dto.name,
                price: dto.price,
                description: dto.description,
                categoryId: dto.categoryId,
                tenantId: dto.tenantId,
                isActive: dto.isAvailable,
                // Раніше ці поля приймалися схемою і просто відкидалися сервісом,
                // тому фото/алергени/теги ніколи не доходили до БД.
                imageUrl: dto.imageUrl ?? null,
                allergens: dto.allergens,
                tags: dto.tags,
                modifiers: { create: this.buildModifiersCreate(dto.modifiers) },
            },
            include: MODIFIERS_INCLUDE,
        });

        await this.invalidateTenantUpsellCache(dto.tenantId);

        return { success: true, data: result };
    }

    async updateMenuItem(id: string, dto: UpdateMenuItemDTO, userId: string): Promise<SuccessResponse<MenuItem>> {
        const existing = await this.prisma.menuItem.findUnique({
            where: { id },
            select: { tenantId: true },
        });
        if (!existing) throw new NotFoundException('Menu item not found');
        await this.assertOwnsTenant(existing.tenantId, userId);

        /*
         * Модифікатори — реляційне дерево, тож PATCH робимо в транзакції:
         * спершу скалярні поля, потім повна заміна груп (deleteMany + create).
         *
         * Заміна цілим блоком, а не діф по id, свідомо: білдер надсилає повний
         * бажаний стан, а каскад `onDelete: Cascade` прибирає опції видалених
         * груп. Це на порядок простіше за звірку id і не лишає сиріт.
         */
        const result = await this.prisma.$transaction(async (tx) => {
            await tx.menuItem.update({
                where: { id },
                data: {
                    ...(dto.name !== undefined && { name: dto.name }),
                    ...(dto.price !== undefined && { price: dto.price }),
                    ...(dto.description !== undefined && { description: dto.description }),
                    ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
                    ...(dto.isAvailable !== undefined && { isActive: dto.isAvailable }),
                    ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
                    ...(dto.allergens !== undefined && { allergens: dto.allergens }),
                    ...(dto.tags !== undefined && { tags: dto.tags }),
                },
            });

            if (dto.modifiers !== undefined) {
                await tx.modifierGroup.deleteMany({ where: { menuItemId: id } });

                for (const [groupIndex, group] of dto.modifiers.entries()) {
                    await tx.modifierGroup.create({
                        data: {
                            menuItemId: id,
                            name: group.name,
                            minSelections: group.minSelections,
                            maxSelections: group.maxSelections,
                            sortOrder: groupIndex,
                            options: {
                                create: group.options.map((option, optionIndex) => ({
                                    name: option.name,
                                    priceAdjustment: option.priceAdjustment,
                                    sortOrder: optionIndex,
                                })),
                            },
                        },
                    });
                }
            }

            return tx.menuItem.findUniqueOrThrow({
                where: { id },
                include: MODIFIERS_INCLUDE,
            });
        });

        await this.invalidateTenantUpsellCache(existing.tenantId);

        return { success: true, data: result };
    }

    async deleteMenuItem(id: string, userId: string): Promise<SuccessResponse<MenuItem>> {
        const existing = await this.prisma.menuItem.findUnique({
            where: { id },
            select: { tenantId: true },
        });
        if (!existing) throw new NotFoundException('Menu item not found');
        await this.assertOwnsTenant(existing.tenantId, userId);

        const result = await this.prisma.menuItem.delete({ where: { id } });

        await this.invalidateTenantUpsellCache(existing.tenantId);

        return { success: true, data: result };
    }

    /**
     * "86 list" тумблер: інвертує `isActive` страви (ручне приховування з меню
     * гостя без фізичного видалення). Повертає оновлений запис.
     */
    async toggleItem(id: string, userId: string): Promise<SuccessResponse<MenuItem>> {
        const existing = await this.prisma.menuItem.findUnique({
            where: { id },
            select: { tenantId: true, isActive: true },
        });
        if (!existing) throw new NotFoundException('Menu item not found');
        await this.assertOwnsTenant(existing.tenantId, userId);

        const result = await this.prisma.menuItem.update({
            where: { id },
            data: { isActive: !existing.isActive },
        });

        await this.invalidateTenantUpsellCache(existing.tenantId);

        return { success: true, data: result };
    }
}
