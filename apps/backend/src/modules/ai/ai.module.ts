import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { UpsellCacheService } from './services/upsell-cache.service';

@Module({
    imports: [
        ThrottlerModule.forRoot({
            throttlers: [{ name: 'default', ttl: 60000, limit: 10 }],
        }),
    ],
    controllers: [AiController],
    providers: [AiService, UpsellCacheService],
    exports: [AiService, UpsellCacheService],
})
export class AiModule {}
