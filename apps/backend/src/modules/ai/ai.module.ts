import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { UpsellCacheService } from './services/upsell-cache.service';
import { ReviewDigestService } from './services/review-digest.service';

@Module({
    imports: [
        ThrottlerModule.forRoot({
            throttlers: [{ name: 'default', ttl: 60000, limit: 10 }],
        }),
    ],
    controllers: [AiController],
    providers: [AiService, UpsellCacheService, ReviewDigestService],
    exports: [AiService, UpsellCacheService, ReviewDigestService],
})
export class AiModule {}
