import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { MenuModule } from 'src/modules/menu/menu.module';
import { TablesModule } from './modules/tables/tables.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HappyHourModule } from './modules/happy-hour/happy-hour.module';
import { MediaModule } from './modules/media/media.module';
import { AiModule } from './modules/ai/ai.module';
import { BillingModule } from './modules/billing/billing.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AppController } from './app.controller';

@Module({
    imports: [
        ThrottlerModule.forRoot([
            {
                name: 'default',
                ttl: 60000,
                limit: 120,
            },
        ]),
        AuthModule,
        PrismaModule,
        TenantsModule,
        MenuModule,
        TablesModule,
        CartModule,
        OrdersModule,
        ReservationsModule,
        AnalyticsModule,
        FeedbackModule,
        DashboardModule,
        HappyHourModule,
        MediaModule,
        AiModule,
        BillingModule,
        PaymentsModule,
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
