import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Headers,
    Param,
    Post,
    Query,
    Req,
    RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { PaymentsService } from './payments.service';
import {
    CreateEqualSplitPaymentDto,
    CreateItemSplitPaymentDto,
    CreateOrderPaymentDto,
    UnlockSplitItemsDto,
    VerifyOrderPaymentDto,
} from './dto/payments.dto';
import {
    OrderBillStatusResponse,
    OrderPaymentSessionResponse,
    SuccessResponse,
    VerifyPaymentResponse,
} from '@my-app/types';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Public()
    @Get('orders/:orderId/bill')
    async getBill(
        @Param('orderId') orderId: string,
        @Query('guestSessionId') guestSessionId?: string,
    ): Promise<SuccessResponse<OrderBillStatusResponse>> {
        const data = await this.paymentsService.getBillStatus(orderId, guestSessionId);
        return { success: true, data };
    }

    @Public()
    @Post('orders/:orderId/pay')
    async payFull(
        @Param('orderId') orderId: string,
        @Body() dto: CreateOrderPaymentDto,
    ): Promise<SuccessResponse<OrderPaymentSessionResponse>> {
        const data = await this.paymentsService.createFullPayment(orderId, dto);
        return { success: true, data };
    }

    @Public()
    @Post('orders/:orderId/split/equal')
    async splitEqual(
        @Param('orderId') orderId: string,
        @Body() dto: CreateEqualSplitPaymentDto,
    ): Promise<SuccessResponse<OrderPaymentSessionResponse>> {
        const data = await this.paymentsService.createEqualSplitPayment(orderId, dto);
        return { success: true, data };
    }

    @Public()
    @Post('orders/:orderId/split/items')
    async splitByItems(
        @Param('orderId') orderId: string,
        @Body() dto: CreateItemSplitPaymentDto,
    ): Promise<SuccessResponse<OrderPaymentSessionResponse>> {
        const data = await this.paymentsService.createItemSplitPayment(orderId, dto);
        return { success: true, data };
    }

    @Public()
    @Post('orders/:orderId/split/unlock')
    async unlockItems(
        @Param('orderId') orderId: string,
        @Body() dto: UnlockSplitItemsDto,
    ): Promise<SuccessResponse<{ unlocked: number }>> {
        const data = await this.paymentsService.unlockItems(orderId, dto.guestSessionId);
        return { success: true, data };
    }

    @Public()
    @Post('orders/:orderId/verify-session')
    async verifySession(
        @Param('orderId') orderId: string,
        @Body() dto: VerifyOrderPaymentDto,
    ): Promise<SuccessResponse<VerifyPaymentResponse>> {
        const data = await this.paymentsService.verifyPaymentSession(orderId, dto.sessionId);
        return { success: true, data };
    }

    @Public()
    @Post('webhook')
    async handleWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') signature: string,
    ): Promise<{ received: true }> {
        if (!signature) {
            throw new BadRequestException('Missing stripe-signature header');
        }

        if (!req.rawBody) {
            throw new BadRequestException('Missing raw body');
        }

        return this.paymentsService.handleWebhook(req.rawBody, signature);
    }
}
