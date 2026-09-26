import { Controller, Post, Param, Body, UseGuards, Req, Headers, BadRequestException, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { BillingService } from './billing.service';
import { CreateCheckoutDto, VerifyCheckoutSessionDto } from './dto/billing.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { SuccessResponse, CheckoutSessionResponse, PortalSessionResponse, VerifyCheckoutSessionResponse } from '@my-app/types';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post(':tenantId/checkout')
  async createCheckout(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateCheckoutDto,
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<CheckoutSessionResponse>> {
    return this.billingService.createCheckoutSession(tenantId, dto.plan, userId);
  }

  @Post(':tenantId/portal')
  async createPortal(
    @Param('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<PortalSessionResponse>> {
    return this.billingService.createPortalSession(tenantId, userId);
  }

  @Post(':tenantId/verify-session')
  async verifySession(
    @Param('tenantId') tenantId: string,
    @Body() dto: VerifyCheckoutSessionDto,
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<VerifyCheckoutSessionResponse>> {
    return this.billingService.verifySession(tenantId, dto.sessionId, userId);
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

    return this.billingService.handleWebhook(req.rawBody, signature);
  }
}
