import { Module } from '@nestjs/common';
import { WishlistModule } from 'src/modules/wishlist/wishlist.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from 'src/modules/prisma/prisma.module';

@Module({
    imports: [WishlistModule, AuthModule, PrismaModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
