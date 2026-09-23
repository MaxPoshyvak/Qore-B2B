import { Module } from '@nestjs/common';
import { AiModule } from 'src/modules/ai/ai.module';
import { CategoriesController } from './controllers/categories.controller';
import { MenuItemsController } from './controllers/menu-items.controller';
import { PublicMenuController } from './controllers/public-menu.controller';
import { CategoriesService } from './services/categories.service';
import { MenuItemsService } from './services/menu-items.service';

@Module({
    imports: [AiModule],
    controllers: [CategoriesController, MenuItemsController, PublicMenuController],
    providers: [CategoriesService, MenuItemsService],
    exports: [CategoriesService, MenuItemsService],
})
export class MenuModule {}