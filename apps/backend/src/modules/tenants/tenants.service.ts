import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateTenantDto } from './dto/tenants.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class TenantsService {
    constructor(private prisma: PrismaService) {}
    async createTenant(dto: CreateTenantDto, userId: string) {
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

        return this.prisma.tenant.create({
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
    }
}
