import { Module } from '@nestjs/common';
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

@Module({
    imports: [
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
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
