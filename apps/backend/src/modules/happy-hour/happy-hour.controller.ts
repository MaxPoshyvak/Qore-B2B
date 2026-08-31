import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TenantGuard } from 'src/common/guards/tenant.guard';
import { Public } from 'src/common/decorators/public.decorator';
import {
    CreateHappyHourDto,
    HappyHourRuleResponse,
    SuccessResponse,
    UpdateHappyHourDto,
} from '@my-app/types';
import { HappyHourService } from './happy-hour.service';

@Controller()
export class HappyHourController {
    constructor(private readonly happyHourService: HappyHourService) {}

    // === Захищені маршрути дашборду власника ===

    // Створення правила Happy Hour
    @UseGuards(JwtAuthGuard, TenantGuard)
    @Post('happy-hour/:tenantId')
    async createRule(
        @Param('tenantId') tenantId: string,
        @Body() dto: CreateHappyHourDto,
    ): Promise<SuccessResponse<HappyHourRuleResponse>> {
        const data = await this.happyHourService.createRule(tenantId, dto);
        return { success: true, data, message: 'Happy hour rule created' };
    }

    // Отримання всіх правил веню
    @UseGuards(JwtAuthGuard, TenantGuard)
    @Get('happy-hour/:tenantId')
    async getRules(
        @Param('tenantId') tenantId: string,
    ): Promise<SuccessResponse<HappyHourRuleResponse[]>> {
        const data = await this.happyHourService.getRules(tenantId);
        return { success: true, data };
    }

    // Оновлення правила Happy Hour
    @UseGuards(JwtAuthGuard, TenantGuard)
    @Patch('happy-hour/:tenantId/:id')
    async updateRule(
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdateHappyHourDto,
    ): Promise<SuccessResponse<HappyHourRuleResponse>> {
        const data = await this.happyHourService.updateRule(tenantId, id, dto);
        return { success: true, data, message: 'Happy hour rule updated' };
    }

    // Видалення правила Happy Hour
    @UseGuards(JwtAuthGuard, TenantGuard)
    @Delete('happy-hour/:tenantId/:id')
    async deleteRule(
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
    ): Promise<SuccessResponse<{ id: string }>> {
        const data = await this.happyHourService.deleteRule(tenantId, id);
        return { success: true, data, message: 'Happy hour rule deleted' };
    }

    // === Публічний маршрут (гості) ===

    // Активні правила для публічного меню веню
    @Public()
    @Get('public/happy-hour/:slug')
    async getActivePublicRules(
        @Param('slug') slug: string,
    ): Promise<SuccessResponse<HappyHourRuleResponse[]>> {
        const data = await this.happyHourService.getActivePublicRules(slug);
        return { success: true, data };
    }
}
