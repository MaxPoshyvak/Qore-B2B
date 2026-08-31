import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TenantsModule } from '../tenants/tenants.module';
import { PrismaModule } from '../prisma/prisma.module';
import { HappyHourModule } from '../happy-hour/happy-hour.module';
import { KdsGuard } from 'src/common/guards/kds.guard';

@Module({
    imports: [TenantsModule, PrismaModule, HappyHourModule],
    controllers: [OrdersController],
    providers: [OrdersService, KdsGuard],
    exports: [OrdersService],
})
export class OrdersModule {}
