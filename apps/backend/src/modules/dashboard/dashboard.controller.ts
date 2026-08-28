import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TenantGuard } from 'src/common/guards/tenant.guard';
import { DashboardService } from './dashboard.service';
import { DashboardTodayResponse, SuccessResponse } from '@my-app/types';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, TenantGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    // GET /api/dashboard/:tenantId/today — легкий зріз даних за день для дашборду
    @Get(':tenantId/today')
    async getToday(
        @Param('tenantId') tenantId: string,
    ): Promise<SuccessResponse<DashboardTodayResponse>> {
        const data = await this.dashboardService.getToday(tenantId);
        return { success: true, data };
    }
}
