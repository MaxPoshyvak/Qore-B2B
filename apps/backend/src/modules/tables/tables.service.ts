import { randomUUID } from 'node:crypto';
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateTableDto, ResolvedTableDto, SuccessResponse, UpdateTableDto } from '@my-app/types';
import { Table, Tenant } from '@my-app/database';

@Injectable()
export class TablesService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Resolves the tenant that owns the given `slug` and asserts that the
     * requesting user is its owner. Returns the tenant (id + slug + name) or
     * throws NotFoundException so an attacker cannot distinguish between a
     * missing venue and a venue they don't own.
     */
    private async assertOwnsTenantBySlug(slug: string, userId: string): Promise<Pick<Tenant, 'id'>> {
        const tenant = await this.prisma.tenant.findFirst({
            where: { slug, ownerId: userId },
            select: { id: true },
        });

        if (!tenant) {
            throw new NotFoundException('Venue not found');
        }

        return tenant;
    }

    async getTablesBySlug(slug: string, userId: string): Promise<SuccessResponse<Table[]>> {
        const tenant = await this.assertOwnsTenantBySlug(slug, userId);

        const tables = await this.prisma.table.findMany({
            where: { tenantId: tenant.id },
            orderBy: { name: 'asc' },
        });

        return { success: true, data: tables };
    }

    async createTable(slug: string, dto: CreateTableDto, userId: string): Promise<SuccessResponse<Table>> {
        const tenant = await this.assertOwnsTenantBySlug(slug, userId);

        const existing = await this.prisma.table.findFirst({
            where: { name: dto.name, tenantId: tenant.id },
            select: { id: true },
        });
        if (existing) {
            throw new ConflictException('Table name already exists');
        }

        const table = await this.prisma.table.create({
            data: {
                tenantId: tenant.id,
                name: dto.name,
                capacity: dto.capacity,
                isActive: dto.isActive ?? true,
            },
        });

        return { success: true, data: table };
    }

    async updateTable(
        slug: string,
        tableId: string,
        dto: UpdateTableDto,
        userId: string,
    ): Promise<SuccessResponse<Table>> {
        const tenant = await this.assertOwnsTenantBySlug(slug, userId);

        const existing = await this.prisma.table.findFirst({
            where: { id: tableId, tenantId: tenant.id },
            select: { id: true },
        });
        if (!existing) {
            throw new NotFoundException('Table not found');
        }

        const existingName = await this.prisma.table.findFirst({
            where: { name: dto.name, tenantId: tenant.id },
            select: { id: true },
        });
        if (existingName && existingName.id !== tableId) {
            throw new ConflictException('Table name already exists');
        }

        const table = await this.prisma.table.update({
            where: { id: tableId },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.capacity !== undefined && { capacity: dto.capacity }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            },
        });

        return { success: true, data: table };
    }

    async deleteTable(slug: string, tableId: string, userId: string): Promise<SuccessResponse<Table>> {
        const tenant = await this.assertOwnsTenantBySlug(slug, userId);

        const existing = await this.prisma.table.findFirst({
            where: { id: tableId, tenantId: tenant.id },
            select: { id: true },
        });
        if (!existing) {
            throw new NotFoundException('Table not found');
        }

        const table = await this.prisma.table.delete({
            where: { id: tableId },
        });

        return { success: true, data: table };
    }

    async refreshQr(slug: string, tableId: string, userId: string): Promise<SuccessResponse<Table>> {
        const tenant = await this.assertOwnsTenantBySlug(slug, userId);

        const existing = await this.prisma.table.findFirst({
            where: { id: tableId, tenantId: tenant.id },
            select: { id: true },
        });
        if (!existing) {
            throw new NotFoundException('Table not found');
        }

        const table = await this.prisma.table.update({
            where: { id: tableId },
            data: { qrToken: randomUUID() },
        });

        return { success: true, data: table };
    }

    /**
     * Public, auth-free resolution of a QR code for venue guests. Finds the
     * table by its `qrToken`, joins its tenant, and returns the minimal data
     * needed to render the guest experience. Throws NotFoundException when the
     * token is unknown or the table has been deactivated.
     */
    async resolvePublicTable(qrToken: string): Promise<SuccessResponse<ResolvedTableDto>> {
        const table = await this.prisma.table.findUnique({
            where: { qrToken },
            include: { tenant: { select: { slug: true, name: true } } },
        });

        if (!table || table.isActive === false) {
            throw new NotFoundException('Table not found');
        }

        const data: ResolvedTableDto = {
            table: { id: table.id, name: table.name },
            tenant: { slug: table.tenant.slug, name: table.tenant.name },
        };

        return { success: true, data };
    }
}
