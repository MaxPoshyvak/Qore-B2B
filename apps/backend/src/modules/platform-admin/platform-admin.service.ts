import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes, randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
    PlatformLoginDto,
    PlatformTrackHitDto,
    FastVenueDto,
} from './dto/platform-admin.dto';
import {
    type PlatformStatsResponse,
    type FastVenueResultDTO,
    isReservedSlug,
    THEME_PRESETS,
    DEFAULT_THEME_CONFIG,
} from '@my-app/types';
import { Prisma } from '@my-app/database';

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'venue';
}

@Injectable()
export class PlatformAdminService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async login(dto: PlatformLoginDto): Promise<{ token: string; expiresIn: number }> {
        const masterHash = process.env.PLATFORM_MASTER_PASSWORD_HASH;

        if (!masterHash) {
            throw new UnauthorizedException('Master password is not configured on the server');
        }

        const isMatch = await bcrypt.compare(dto.password, masterHash);

        if (!isMatch) {
            throw new UnauthorizedException('Invalid master password');
        }

        const secret = process.env.JWT_SECRET || 'platform_admin_super_secret';
        const token = this.jwtService.sign(
            { role: 'PLATFORM_OWNER', sub: 'platform_owner' },
            { secret, expiresIn: '24h' },
        );

        return {
            token,
            expiresIn: 86400,
        };
    }

    async trackHit(dto: PlatformTrackHitDto): Promise<{ success: boolean }> {
        try {
            await this.prisma.platformTrafficLog.create({
                data: {
                    path: dto.path.slice(0, 500),
                    visitorId: dto.visitorId.slice(0, 100),
                    referrer: dto.referrer ? dto.referrer.slice(0, 500) : null,
                    userAgent: dto.userAgent ? dto.userAgent.slice(0, 500) : null,
                },
            });
            return { success: true };
        } catch (error) {
            console.error('Failed to log platform traffic hit:', error);
            return { success: false };
        }
    }

    async getStats(): Promise<PlatformStatsResponse> {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // 1. Traffic Metrics
        const [
            totalPageviews,
            todayPageviews,
            allDistinctVisitors,
            todayDistinctVisitors,
            activeVisitors,
            topRoutesGrouped,
            recentHits,
        ] = await Promise.all([
            this.prisma.platformTrafficLog.count(),
            this.prisma.platformTrafficLog.count({
                where: { createdAt: { gte: startOfToday } },
            }),
            this.prisma.platformTrafficLog.findMany({
                select: { visitorId: true },
                distinct: ['visitorId'],
            }),
            this.prisma.platformTrafficLog.findMany({
                where: { createdAt: { gte: startOfToday } },
                select: { visitorId: true },
                distinct: ['visitorId'],
            }),
            this.prisma.platformTrafficLog.findMany({
                where: { createdAt: { gte: fifteenMinutesAgo } },
                select: { visitorId: true },
                distinct: ['visitorId'],
            }),
            this.prisma.platformTrafficLog.groupBy({
                by: ['path'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 15,
            }),
            this.prisma.platformTrafficLog.findMany({
                orderBy: { createdAt: 'desc' },
                take: 20,
            }),
        ]);

        // Calculate unique visitors per top route
        const topRoutes = await Promise.all(
            topRoutesGrouped.map(async (route) => {
                const uniqueVisitors = (
                    await this.prisma.platformTrafficLog.findMany({
                        where: { path: route.path },
                        select: { visitorId: true },
                        distinct: ['visitorId'],
                    })
                ).length;

                return {
                    path: route.path,
                    pageviews: route._count.id,
                    uniqueVisitors,
                };
            }),
        );

        // 2. Subscriptions & SaaS Metrics
        const [freeTenantsCount, proTenantsCount, businessTenantsCount, paidTenants, lifetimeSales] =
            await Promise.all([
                this.prisma.tenant.count({ where: { subscriptionPlan: 'free' } }),
                this.prisma.tenant.count({ where: { subscriptionPlan: 'pro' } }),
                this.prisma.tenant.count({ where: { subscriptionPlan: 'business' } }),
                this.prisma.tenant.findMany({
                    where: { subscriptionPlan: { in: ['pro', 'business'] } },
                    include: {
                        owner: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                }),
                this.prisma.paymentTransaction.aggregate({
                    where: { status: 'succeeded' },
                    _sum: { totalCharged: true },
                }),
            ]);

        const mrr = proTenantsCount * 29 + businessTenantsCount * 79;
        const totalRevenue = Number(lifetimeSales._sum.totalCharged ?? 0);

        // 3. User Metrics
        const [totalUsers, newUsersLast7Days, totalTenants, recentUsersList] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
            this.prisma.tenant.count(),
            this.prisma.user.findMany({
                take: 15,
                orderBy: { createdAt: 'desc' },
                include: {
                    tenants: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            subscriptionPlan: true,
                        },
                    },
                },
            }),
        ]);

        // 4. Leaderboard Metrics
        const [topViewsGrouped, topOrdersGrouped] = await Promise.all([
            this.prisma.menuView.groupBy({
                by: ['tenantId'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 8,
            }),
            this.prisma.order.groupBy({
                by: ['tenantId'],
                _count: { id: true },
                _sum: { totalAmount: true },
                orderBy: { _count: { id: 'desc' } },
                take: 8,
            }),
        ]);

        const topTenantIds = Array.from(
            new Set([
                ...topViewsGrouped.map((item) => item.tenantId),
                ...topOrdersGrouped.map((item) => item.tenantId),
            ]),
        );

        const tenantsMap = new Map(
            (
                await this.prisma.tenant.findMany({
                    where: { id: { in: topTenantIds } },
                    include: { owner: { select: { email: true } } },
                })
            ).map((t) => [t.id, t]),
        );

        const topByMenuViews = topViewsGrouped
            .map((item) => {
                const tenant = tenantsMap.get(item.tenantId);
                if (!tenant) return null;
                return {
                    id: tenant.id,
                    name: tenant.name,
                    slug: tenant.slug,
                    plan: tenant.subscriptionPlan,
                    viewsCount: item._count.id,
                    ownerEmail: tenant.owner?.email ?? 'unknown',
                };
            })
            .filter(Boolean) as PlatformStatsResponse['leaderboard']['topByMenuViews'];

        const topByOrders = topOrdersGrouped
            .map((item) => {
                const tenant = tenantsMap.get(item.tenantId);
                if (!tenant) return null;
                return {
                    id: tenant.id,
                    name: tenant.name,
                    slug: tenant.slug,
                    plan: tenant.subscriptionPlan,
                    ordersCount: item._count.id,
                    totalSales: Number(item._sum.totalAmount ?? 0),
                    ownerEmail: tenant.owner?.email ?? 'unknown',
                };
            })
            .filter(Boolean) as PlatformStatsResponse['leaderboard']['topByOrders'];

        return {
            traffic: {
                totalPageviews,
                uniqueVisitors: allDistinctVisitors.length,
                todayPageviews,
                todayUniqueVisitors: todayDistinctVisitors.length,
                activeVisitorsLast15m: activeVisitors.length,
                topRoutes,
                recentHits: recentHits.map((hit) => ({
                    id: hit.id,
                    path: hit.path,
                    visitorId: hit.visitorId,
                    referrer: hit.referrer,
                    createdAt: hit.createdAt.toISOString(),
                })),
            },
            subscriptions: {
                mrr,
                totalRevenue,
                activeSubscribersCount: proTenantsCount + businessTenantsCount,
                plansBreakdown: {
                    free: freeTenantsCount,
                    pro: proTenantsCount,
                    business: businessTenantsCount,
                },
                paidTenants: paidTenants.map((t) => ({
                    id: t.id,
                    name: t.name,
                    slug: t.slug,
                    plan: t.subscriptionPlan as 'free' | 'pro' | 'business',
                    status: t.subscriptionStatus,
                    expiresAt: t.subscriptionExpiresAt ? t.subscriptionExpiresAt.toISOString() : null,
                    stripeSubscriptionId: t.stripeSubscriptionId,
                    owner: {
                        id: t.owner.id,
                        name: t.owner.name,
                        email: t.owner.email,
                    },
                    createdAt: t.createdAt.toISOString(),
                })),
            },
            users: {
                totalUsers,
                newUsersLast7Days,
                totalTenants,
                recentUsers: recentUsersList.map((u) => ({
                    id: u.id,
                    email: u.email,
                    name: u.name,
                    createdAt: u.createdAt.toISOString(),
                    isEmailVerified: u.isEmailVerified,
                    tenants: u.tenants.map((t) => ({
                        id: t.id,
                        name: t.name,
                        slug: t.slug,
                        subscriptionPlan: t.subscriptionPlan,
                    })),
                })),
            },
            leaderboard: {
                topByMenuViews,
                topByOrders,
            },
            system: {
                dbConnected: true,
                nodeVersion: process.version,
                uptimeSeconds: Math.floor(process.uptime()),
                serverTime: new Date().toISOString(),
            },
        };
    }

    async fastVenue(dto: FastVenueDto): Promise<FastVenueResultDTO> {
        let baseSlug = slugify(dto.venue.slug || dto.venue.name);
        if (isReservedSlug(baseSlug)) {
            baseSlug = `${baseSlug}-${randomInt(100, 999)}`;
        }

        let uniqueSlug = baseSlug;
        let attempt = 0;
        while (attempt < 10) {
            const existing = await this.prisma.tenant.findUnique({ where: { slug: uniqueSlug } });
            if (!existing) break;
            uniqueSlug = `${baseSlug}-${randomInt(100, 999)}`;
            attempt++;
        }

        const userEmail = `${uniqueSlug}_${randomInt(100, 999)}@useqore.demo`;
        const rawPassword = `Qore#${randomBytes(4).toString('hex')}!`;
        const passwordHash = await bcrypt.hash(rawPassword, 10);

        const presetKey = dto.venue.themePreset || 'modern-minimal';
        const themeConfig = THEME_PRESETS[presetKey] || DEFAULT_THEME_CONFIG;

        const tablesCount = dto.venue.tablesCount || 6;
        let totalItems = 0;

        const result = await this.prisma.$transaction(async (tx) => {
            // 1. Create User
            const user = await tx.user.create({
                data: {
                    email: userEmail,
                    password: passwordHash,
                    name: `${dto.venue.name} Admin`,
                    isEmailVerified: true,
                },
            });

            // 2. Create Tenant with Settings
            const tenant = await tx.tenant.create({
                data: {
                    name: dto.venue.name,
                    slug: uniqueSlug,
                    ownerId: user.id,
                    subscriptionPlan: 'pro',
                    subscriptionStatus: 'active',
                    settings: {
                        create: {
                            description: dto.venue.description || null,
                            coverUrl: (dto.venue as any).coverUrl || (dto.venue as any).coverImage || null,
                            currency: dto.venue.currency || 'USD',
                            phone: dto.venue.phone || null,
                            address: dto.venue.address || null,
                            instagramUrl: dto.venue.instagramUrl || null,
                            wifiSsid: dto.venue.wifiSsid || null,
                            wifiPassword: dto.venue.wifiPassword || null,
                            workingHours: (dto.venue.workingHours || {}) as Prisma.InputJsonValue,
                        },
                    },
                },
            });

            // 3. Create and assign Theme
            const theme = await tx.tenantTheme.create({
                data: {
                    tenantId: tenant.id,
                    themeConfig: themeConfig as unknown as Prisma.InputJsonValue,
                    isAiGenerated: true,
                },
            });

            await tx.tenant.update({
                where: { id: tenant.id },
                data: { activeThemeId: theme.id },
            });

            // 4. Create Tables
            for (let i = 1; i <= tablesCount; i++) {
                await tx.table.create({
                    data: {
                        tenantId: tenant.id,
                        name: `Table ${i}`,
                        capacity: i <= 2 ? 2 : i <= 4 ? 4 : 6,
                        qrToken: `${uniqueSlug}-t${i}-${randomBytes(3).toString('hex')}`,
                        isActive: true,
                    },
                });
            }

            // 5. Create Categories and Items
            for (let cIdx = 0; cIdx < dto.categories.length; cIdx++) {
                const catData = dto.categories[cIdx];
                const category = await tx.menuCategory.create({
                    data: {
                        tenantId: tenant.id,
                        name: catData.name,
                        icon: catData.icon || 'Utensils',
                        sortOrder: cIdx,
                        isActive: true,
                    },
                });

                for (let iIdx = 0; iIdx < catData.items.length; iIdx++) {
                    const itemData = catData.items[iIdx];
                    totalItems++;
                    await tx.menuItem.create({
                        data: {
                            tenantId: tenant.id,
                            categoryId: category.id,
                            name: itemData.name,
                            description: itemData.description || null,
                            price: new Prisma.Decimal(itemData.price),
                            imageUrl: itemData.imageUrl || (itemData as any).image || null,
                            tags: (itemData.tags || []) as Prisma.InputJsonValue,
                            allergens: (itemData.allergens || []) as Prisma.InputJsonValue,
                            sortOrder: iIdx,
                            isActive: true,
                        },
                    });
                }
            }

            return tenant;
        });

        const frontendUrl = process.env.FRONTEND_URL || 'https://useqore.app';

        return {
            tenantId: result.id,
            venueName: result.name,
            slug: uniqueSlug,
            publicMenuUrl: `${frontendUrl}/${uniqueSlug}/menu`,
            venueLandingUrl: `${frontendUrl}/${uniqueSlug}`,
            dashboardUrl: `${frontendUrl}/dashboard/${uniqueSlug}/menu`,
            categoriesCreated: dto.categories.length,
            itemsCreated: totalItems,
            tablesCreated: tablesCount,
            credentials: {
                email: userEmail,
                password: rawPassword,
            },
        };
    }
}
