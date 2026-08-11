import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { CategoriesService } from '../services/categories.service';
import type { PublicMenuResponseDTO } from '@my-app/types';

// Intentionally unguarded: venue guests only know the public `slug` and hold
// no auth token. The 404 path must stay indistinguishable from an unauthorized
// one, so there is no `@UseGuards(JwtAuthGuard)` here.
@Controller('menu/public')
export class PublicMenuController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Get(':slug')
    getPublicMenu(@Param('slug') slug: string): Promise<PublicMenuResponseDTO> {
        if (!slug) throw new NotFoundException('Venue not found');
        return this.categoriesService.getPublicMenuBySlug(slug);
    }
}
