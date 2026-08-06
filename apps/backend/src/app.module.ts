import { Module } from '@nestjs/common';
import { WishlistModule } from 'src/modules/wishlist/wishlist.module';

@Module({
    imports: [WishlistModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
