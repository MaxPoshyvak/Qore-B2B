import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CartService, type CartSessionWithItems } from './cart.service';
import { AddCartItemDto, ToggleReadyDto, UpdateCartItemDto } from './dto/cart.dto';
import { SuccessResponse } from '@my-app/types';
import { CartItem } from '@my-app/database';

@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) {}

    // Takeaway: create a single-player session not tied to a table.
    @Post('takeaway')
    createTakeaway(): Promise<SuccessResponse<CartSessionWithItems>> {
        return this.cartService.createTakeawaySession();
    }

    // B2C public: returns (or lazily creates) the active cart session for a table.
    @Get('table/:tableId')
    getSession(@Param('tableId') tableId: string): Promise<SuccessResponse<CartSessionWithItems>> {
        return this.cartService.getSessionForTable(tableId);
    }

    // Takeaway polling: fetch a specific session by its id.
    @Get('session/:sessionId')
    getSessionById(@Param('sessionId') sessionId: string): Promise<SuccessResponse<CartSessionWithItems>> {
        return this.cartService.getSessionById(sessionId);
    }

    @Post('table/:tableId/items')
    addItem(
        @Param('tableId') tableId: string,
        @Body() dto: AddCartItemDto,
    ): Promise<SuccessResponse<CartSessionWithItems>> {
        return this.cartService.addItem(tableId, dto);
    }

    // Unified add by cart-session id (used for takeaway).
    @Post(':sessionId/items')
    addItemBySession(
        @Param('sessionId') sessionId: string,
        @Body() dto: AddCartItemDto,
    ): Promise<SuccessResponse<CartSessionWithItems>> {
        return this.cartService.addItemForSession(sessionId, dto);
    }

    @Post('table/:tableId/toggle-ready')
    toggleReady(
        @Param('tableId') tableId: string,
        @Body() dto: ToggleReadyDto,
    ): Promise<SuccessResponse<CartSessionWithItems>> {
        return this.cartService.toggleReady(tableId, dto.guestSessionId);
    }

    @Patch('items/:itemId')
    updateItem(
        @Param('itemId') itemId: string,
        @Body() dto: UpdateCartItemDto,
    ): Promise<SuccessResponse<CartItem | null>> {
        return this.cartService.updateItem(itemId, dto);
    }

    @Delete('items/:itemId')
    removeItem(
        @Param('itemId') itemId: string,
        @Query('guestSessionId') guestSessionId: string,
    ): Promise<SuccessResponse<CartItem>> {
        return this.cartService.removeItem(itemId, guestSessionId);
    }

    @Delete('table/:tableId/clear')
    clearTable(@Param('tableId') tableId: string): Promise<SuccessResponse<{ cleared: number }>> {
        return this.cartService.clearTable(tableId);
    }
}
