import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { env } from '../../config/env';
import { PrismaService } from '../prisma/prisma.service';
import { SuccessResponse, CheckoutSessionResponse, PortalSessionResponse, VerifyCheckoutSessionResponse } from '@my-app/types';
import { SubscriptionPlan } from '@my-app/database';

@Injectable()
export class BillingService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(BillingService.name);

  private readonly PRICE_MAP = {
    pro: env.STRIPE_PRO_PRICE_ID,
    business: env.STRIPE_BUSINESS_PRICE_ID,
  };

  private readonly PRICE_TO_PLAN = {
    [env.STRIPE_PRO_PRICE_ID]: 'pro',
    [env.STRIPE_BUSINESS_PRICE_ID]: 'business',
  };

  constructor(private readonly prisma: PrismaService) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16' as any,
    });
  }

  async createCheckoutSession(
    tenantId: string,
    plan: 'pro' | 'business',
    userId: string,
  ): Promise<SuccessResponse<CheckoutSessionResponse>> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { owner: true },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.ownerId !== userId) {
      throw new ForbiddenException('Only the tenant owner can manage billing');
    }

    let customerId = tenant.stripeCustomerId;

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: tenant.owner.email,
        name: tenant.owner.name || undefined,
        metadata: { tenantId },
      });
      customerId = customer.id;

      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceId = this.PRICE_MAP[plan];

    // Prevent duplicate subscriptions: direct upgrade if tenant already has an active subscription
    if (
      tenant.stripeSubscriptionId &&
      tenant.subscriptionPlan !== 'free' &&
      tenant.subscriptionStatus !== 'canceled'
    ) {
      const subscription = await this.stripe.subscriptions.retrieve(tenant.stripeSubscriptionId);
      const itemId = subscription.items?.data?.[0]?.id;

      if (!itemId) {
        throw new BadRequestException('Could not find active subscription item to update');
      }

      const updatedSubscription = await this.stripe.subscriptions.update(tenant.stripeSubscriptionId, {
        items: [
          {
            id: itemId,
            price: priceId,
          },
        ],
        proration_behavior: 'always_invoice',
        cancel_at_period_end: false,
      });

      const periodEnd =
        updatedSubscription.items?.data?.[0]?.current_period_end ??
        (updatedSubscription as any).current_period_end;

      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionPlan: plan,
          stripePriceId: priceId,
          subscriptionStatus: 'active',
          subscriptionExpiresAt: periodEnd ? new Date(periodEnd * 1000) : null,
        },
      });

      return {
        success: true,
        data: {
          url: null,
          upgradedImmediately: true,
          plan,
        },
      };
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.FRONTEND_URL}/dashboard/${tenant.slug}/settings?section=billing&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.FRONTEND_URL}/dashboard/${tenant.slug}/settings?section=billing`,
      metadata: { tenantId, plan },
      subscription_data: {
        metadata: { tenantId, plan },
      },
    });

    return { success: true, data: { url: session.url! } };
  }

  async createPortalSession(
    tenantId: string,
    userId: string,
  ): Promise<SuccessResponse<PortalSessionResponse>> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.ownerId !== userId) {
      throw new ForbiddenException('Only the tenant owner can manage billing');
    }

    if (!tenant.stripeCustomerId) {
      throw new BadRequestException('No billing account found for this tenant');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${env.FRONTEND_URL}/dashboard/${tenant.slug}/settings?section=billing`,
    });

    return { success: true, data: { url: session.url } };
  }

  async verifySession(
    tenantId: string,
    sessionId: string,
    userId: string,
  ): Promise<SuccessResponse<VerifyCheckoutSessionResponse>> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (tenant.ownerId !== userId) {
      throw new ForbiddenException('Only the tenant owner can manage billing');
    }

    const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.metadata?.tenantId !== tenantId) {
      throw new BadRequestException('Session does not belong to this venue');
    }

    if (session.status !== 'complete' && session.payment_status !== 'paid') {
      throw new BadRequestException('Session is not completed or paid');
    }

    const plan = (session.metadata?.plan as SubscriptionPlan) || 'pro';
    const subscription =
      typeof session.subscription === 'object' && session.subscription
        ? (session.subscription as Stripe.Subscription)
        : await this.stripe.subscriptions.retrieve(session.subscription as string);

    const priceId = subscription.items?.data?.[0]?.price?.id;
    const periodEnd =
      subscription.items?.data?.[0]?.current_period_end ?? (subscription as any).current_period_end;

    const status = subscription.cancel_at_period_end ? 'canceling' : 'active';

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionPlan: plan,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: session.customer as string,
        stripePriceId: priceId,
        subscriptionStatus: status,
        subscriptionExpiresAt: periodEnd ? new Date(periodEnd * 1000) : null,
      },
    });

    return {
      success: true,
      data: {
        plan,
        subscriptionStatus: status,
      },
    };
  }

  async handleWebhook(payload: Buffer, signature: string): Promise<{ received: true }> {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err: any) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const tenantId = session.metadata?.tenantId;
          const plan = session.metadata?.plan as SubscriptionPlan;
          
          if (!tenantId) break;

          const subscription = await this.stripe.subscriptions.retrieve(session.subscription as string);

          const periodEnd = subscription.items?.data?.[0]?.current_period_end ?? (subscription as any).current_period_end;

          await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
              subscriptionPlan: plan,
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: session.customer as string,
              stripePriceId: subscription.items.data[0].price.id,
              subscriptionStatus: 'active',
              subscriptionExpiresAt: periodEnd ? new Date(periodEnd * 1000) : null,
            },
          });
          break;
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          const priceId = subscription.items?.data?.[0]?.price?.id;
          const plan = priceId ? this.PRICE_TO_PLAN[priceId] : undefined;

          const tenant = await this.prisma.tenant.findFirst({
            where: { stripeSubscriptionId: subscription.id },
          });

          if (!tenant) break;

          const periodEnd =
            subscription.items?.data?.[0]?.current_period_end ??
            (subscription as any).current_period_end;

          let status = 'active';
          if (subscription.cancel_at_period_end) {
            status = 'canceling';
          } else if (subscription.status === 'active' || subscription.status === 'trialing') {
            status = 'active';
          } else if (subscription.status === 'past_due') {
            status = 'past_due';
          } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            status = 'canceled';
          }

          await this.prisma.tenant.update({
            where: { id: tenant.id },
            data: {
              subscriptionStatus: status,
              subscriptionExpiresAt: periodEnd ? new Date(periodEnd * 1000) : null,
              ...(plan && priceId !== tenant.stripePriceId && {
                subscriptionPlan: plan as SubscriptionPlan,
                stripePriceId: priceId,
              }),
            },
          });
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;

          const tenant = await this.prisma.tenant.findFirst({
            where: { stripeSubscriptionId: subscription.id },
          });

          if (!tenant) break;

          await this.prisma.tenant.update({
            where: { id: tenant.id },
            data: {
              subscriptionPlan: 'free',
              stripeSubscriptionId: null,
              stripePriceId: null,
              subscriptionStatus: 'canceled',
              subscriptionExpiresAt: null,
            },
          });
          break;
        }

        default:
          this.logger.debug(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error('Error handling webhook event', error);
      throw new BadRequestException('Webhook handler failed');
    }

    return { received: true };
  }
}
