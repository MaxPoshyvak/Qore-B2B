import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, OrderResponse, SuccessResponse, UpdateOrderStatusDto } from '@my-app/types';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { TenantsService } from 'src/modules/tenants/tenants.service';
import { KdsGuard } from './guards/kds.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
        private readonly tenantsService: TenantsService,
    ) {}

    @Public()
    @Post('checkout')
    async checkout(@Body() dto: CreateOrderDto): Promise<SuccessResponse<OrderResponse>> {
        const data = await this.ordersService.createOrderFromCart(dto);
        return { success: true, data };
    }

    @UseGuards(KdsGuard)
    @Get('kds/:token')
    async getKdsOrders(@Param('token') token: string): Promise<SuccessResponse<OrderResponse[]>> {
        const tenantId = await this.ordersService.resolveKdsToken(token);
        const data = await this.ordersService.getActiveOrders(tenantId);
        return { success: true, data };
    }

    @UseGuards(KdsGuard)
    @Patch('kds/:token/:orderId/status')
    async updateKdsStatus(
        @Param('token') token: string,
        @Param('orderId') orderId: string,
        @Body() dto: UpdateOrderStatusDto,
    ): Promise<SuccessResponse<OrderResponse>> {
        const tenantId = await this.ordersService.resolveKdsToken(token);
        const data = await this.ordersService.updateOrderStatus(tenantId, orderId, dto);
        return { success: true, data };
    }

    @Post(':tenantId')
    async create(
        @Param('tenantId') tenantId: string,
        @CurrentUser('id') userId: string,
        @Body() dto: CreateOrderDto,
    ): Promise<SuccessResponse<OrderResponse>> {
        await this.tenantsService.getTenantById(tenantId, userId);
        const data = await this.ordersService.createOrderFromCart(dto);
        return { success: true, data };
    }

    @Get('active/:tenantId')
    async getActive(
        @Param('tenantId') tenantId: string,
        @CurrentUser('id') userId: string,
    ): Promise<SuccessResponse<OrderResponse[]>> {
        await this.tenantsService.getTenantById(tenantId, userId);
        const data = await this.ordersService.getActiveOrders(tenantId);
        return { success: true, data };
    }

    @Patch(':tenantId/:id/status')
    async updateStatus(
        @Param('tenantId') tenantId: string,
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateOrderStatusDto,
    ): Promise<SuccessResponse<OrderResponse>> {
        await this.tenantsService.getTenantById(tenantId, userId);
        const data = await this.ordersService.updateOrderStatus(tenantId, id, dto);
        return { success: true, data };
    }
}
