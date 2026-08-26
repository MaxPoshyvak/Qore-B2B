import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { OrdersModule } from 'src/modules/orders/orders.module';
import { PrismaModule } from 'src/modules/prisma/prisma.module';

@Module({
    imports: [OrdersModule, PrismaModule],
    controllers: [CartController],
    providers: [CartService],
})
export class CartModule {}
