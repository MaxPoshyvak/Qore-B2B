import {
    Body,
    Controller,
    Get,
    Headers,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics.dto';
import {
    OverviewMetricsResponse,
    SalesPerformanceResponse,
    SuccessResponse,
    TrafficMetricsResponse,
} from '@my-app/types';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TenantGuard } from 'src/common/guards/tenant.guard';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    // Публічний трекінг перегляду QR-меню (без автентифікації)
    @Public()
    @Post('public/:slug/track-view')
    async trackView(
        @Param('slug') slug: string,
        @Body('tableId') tableId: string | undefined,
        @Headers('user-agent') userAgent: string | undefined,
    ): Promise<SuccessResponse<{ id: string }>> {
        const data = await this.analyticsService.trackMenuView(slug, tableId, userAgent);
        return { success: true, data };
    }

    @UseGuards(JwtAuthGuard, TenantGuard)
    @Get(':tenantId/overview')
    async getOverview(
        @Param('tenantId') tenantId: string,
        @Query() query: AnalyticsQueryDto,
    ): Promise<SuccessResponse<OverviewMetricsResponse>> {
        const data = await this.analyticsService.getOverviewMetrics(
            tenantId,
            query.startDate,
            query.endDate,
        );
        return { success: true, data };
    }

    @UseGuards(JwtAuthGuard, TenantGuard)
    @Get(':tenantId/sales')
    async getSales(
        @Param('tenantId') tenantId: string,
        @Query() query: AnalyticsQueryDto,
    ): Promise<SuccessResponse<SalesPerformanceResponse>> {
        const data = await this.analyticsService.getSalesPerformance(
            tenantId,
            query.startDate,
            query.endDate,
        );
        return { success: true, data };
    }

    @UseGuards(JwtAuthGuard, TenantGuard)
    @Get(':tenantId/traffic')
    async getTraffic(
        @Param('tenantId') tenantId: string,
        @Query() query: AnalyticsQueryDto,
    ): Promise<SuccessResponse<TrafficMetricsResponse>> {
        const data = await this.analyticsService.getTrafficMetrics(
            tenantId,
            query.startDate,
            query.endDate,
        );
        return { success: true, data };
    }
}
