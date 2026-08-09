import { Module } from '@nestjs/common';
import { WishlistModule } from 'src/modules/wishlist/wishlist.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { MenuModule } from 'src/modules/menu/menu.module';

@Module({
    imports: [WishlistModule, AuthModule, PrismaModule, TenantsModule, MenuModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
