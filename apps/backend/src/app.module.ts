import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { MenuModule } from 'src/modules/menu/menu.module';
import { TablesModule } from './modules/tables/tables.module';
import { CartModule } from './modules/cart/cart.module';

@Module({
    imports: [AuthModule, PrismaModule, TenantsModule, MenuModule, TablesModule, CartModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
