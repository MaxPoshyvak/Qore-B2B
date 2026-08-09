import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto';

@UseGuards(JwtAuthGuard)
@Controller('menu/categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Post()
    createCategory(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateCategoryDto,
    ) {
        return this.categoriesService.createCategory(dto, userId);
    }

    @Get(':tenantId')
    getCategories(
        @CurrentUser('id') userId: string,
        @Param('tenantId') tenantId: string,
    ) {
        return this.categoriesService.getCategoriesByTenant(tenantId, userId);
    }

    @Patch(':id')
    updateCategory(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
        @Body() dto: UpdateCategoryDto,
    ) {
        return this.categoriesService.updateCategory(id, dto, userId);
    }

    @Delete(':id')
    deleteCategory(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
    ) {
        return this.categoriesService.deleteCategory(id, userId);
    }
}