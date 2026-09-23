import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { GenerateDishDto } from './dto/generate-dish.dto';
import { CartUpsellDto } from './dto/cart-upsell.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { SubscriptionGuard } from 'src/common/guards/subscription.guard';
import { RequirePlan } from 'src/common/decorators/require-plan.decorator';
import { GenerateDishOutput, SuccessResponse, CartUpsellResponse } from '@my-app/types';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) {}

    @Post('generate-dish')
    @UseGuards(JwtAuthGuard, SubscriptionGuard, ThrottlerGuard)
    @RequirePlan('pro')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async generateDish(@Body() dto: GenerateDishDto): Promise<SuccessResponse<GenerateDishOutput>> {
        const data = await this.aiService.generateDish(dto);
        return { success: true, data, message: 'Dish generated successfully' };
    }

    @Post('cart-upsell')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 15, ttl: 60000 } })
    async getCartUpsell(@Body() dto: CartUpsellDto): Promise<CartUpsellResponse> {
        return this.aiService.getCartUpsell(dto);
    }
}
