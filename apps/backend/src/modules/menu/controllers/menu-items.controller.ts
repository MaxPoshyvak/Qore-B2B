import {
    Body,
    Controller,
    Delete,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { MenuItemsService } from '../services/menu-items.service';
import { CreateMenuItemDto, UpdateMenuItemDto } from '../dto/item.dto';

@UseGuards(JwtAuthGuard)
@Controller('menu/items')
export class MenuItemsController {
    constructor(private readonly menuItemsService: MenuItemsService) {}

    @Post()
    createItem(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateMenuItemDto,
    ) {
        return this.menuItemsService.createMenuItem(dto, userId);
    }

    @Patch(':id')
    updateItem(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
        @Body() dto: UpdateMenuItemDto,
    ) {
        return this.menuItemsService.updateMenuItem(id, dto, userId);
    }

    @Delete(':id')
    deleteItem(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
    ) {
        return this.menuItemsService.deleteMenuItem(id, userId);
    }
}