import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TenantGuard } from 'src/common/guards/tenant.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { AvailabilitySlot, ReservationResponse, SuccessResponse } from '@my-app/types';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Controller('reservations')
export class ReservationsController {
    constructor(private readonly reservationsService: ReservationsService) {}

    @Public()
    @Get('public/:slug/availability')
    async getAvailability(
        @Param('slug') slug: string,
        @Query('date') date: string,
    ): Promise<SuccessResponse<AvailabilitySlot[]>> {
        const data = await this.reservationsService.getAvailability(slug, date);
        return { success: true, data };
    }

    @Public()
    @Post('public/:slug')
    async create(
        @Param('slug') slug: string,
        @Body() dto: CreateReservationDto,
    ): Promise<SuccessResponse<ReservationResponse>> {
        const data = await this.reservationsService.createReservation(slug, dto);
        return { success: true, data };
    }

    @UseGuards(JwtAuthGuard, TenantGuard)
    @Get(':tenantId')
    async getByTenant(
        @Param('tenantId') tenantId: string,
    ): Promise<SuccessResponse<ReservationResponse[]>> {
        const data = await this.reservationsService.getReservations(tenantId);
        return { success: true, data };
    }

    @UseGuards(JwtAuthGuard, TenantGuard)
    @Patch(':tenantId/:id')
    async update(
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdateReservationDto,
    ): Promise<SuccessResponse<ReservationResponse>> {
        const data = await this.reservationsService.updateReservation(tenantId, id, dto);
        return { success: true, data };
    }

    @Public()
    @Patch('public/cancel/:id')
    async cancel(@Param('id') id: string): Promise<SuccessResponse<ReservationResponse>> {
        const data = await this.reservationsService.cancelReservation(id);
        return { success: true, data };
    }

    @Public()
    @Get('public/:slug/table/:tableId/upcoming')
    async getTableUpcoming(
        @Param('slug') slug: string,
        @Param('tableId') tableId: string,
    ): Promise<SuccessResponse<ReservationResponse | null>> {
        const data = await this.reservationsService.getTableUpcomingReservation(slug, tableId);
        return { success: true, data };
    }
}
