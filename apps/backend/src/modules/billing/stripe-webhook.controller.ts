import { BadRequestException, Controller, Headers, Inject, forwardRef, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { BillingService } from './billing.service';
import { PaymentsService } from '../payments/payments.service';
import Stripe from 'stripe';
import { env } from '../../config/env';

@Controller('stripe')
export class StripeWebhookController {
    private readonly stripe: Stripe;

    constructor(
        private readonly billingService: BillingService,
        @Inject(forwardRef(() => PaymentsService))
        private readonly paymentsService: PaymentsService,
    ) {
        this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16' as any,
        });
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

        let event: Stripe.Event;
        try {
            event = this.stripe.webhooks.constructEvent(
                req.rawBody,
                signature,
                env.STRIPE_WEBHOOK_SECRET,
            );
        } catch (err: any) {
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }

        // Route by event type and metadata
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            if (session.metadata?.type === 'order_payment') {
                return this.paymentsService.handleWebhook(req.rawBody, signature);
            }
            return this.billingService.handleWebhook(req.rawBody, signature);
        }

        if (event.type === 'checkout.session.expired') {
            return this.paymentsService.handleWebhook(req.rawBody, signature);
        }

        if (event.type.startsWith('customer.subscription.') || event.type.startsWith('invoice.')) {
            return this.billingService.handleWebhook(req.rawBody, signature);
        }

        // For any other event, pass through
        await Promise.allSettled([
            this.billingService.handleWebhook(req.rawBody, signature),
            this.paymentsService.handleWebhook(req.rawBody, signature),
        ]);

        return { received: true };
    }
}
