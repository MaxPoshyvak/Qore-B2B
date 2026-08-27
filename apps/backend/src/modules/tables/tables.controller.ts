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
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableDto } from './dto/tables.dto';
import { ResolvedTableDto, SuccessResponse } from '@my-app/types';
import { Table } from '@my-app/database';

@Controller('tables')
export class TablesController {
    constructor(private readonly tablesService: TablesService) {}

    // ── Public B2C route (NO AuthGuard) ──────────────────────────────────────
    // Declared before `GET :slug` so NestJS matches it first and the more
    // specific `public/resolve/:qrToken` path is not swallowed by the
    // catch-all `:slug` parameter.
    @Get('public/resolve/:qrToken')
    resolvePublicTable(
        @Param('qrToken') qrToken: string,
    ): Promise<SuccessResponse<ResolvedTableDto>> {
        return this.tablesService.resolvePublicTable(qrToken);
    }

    // ── Protected B2B routes (JWT + tenant ownership) ────────────────────────
    @UseGuards(JwtAuthGuard)
    @Get(':slug')
    getTablesBySlug(
        @Param('slug') slug: string,
        @CurrentUser('id') userId: string,
    ): Promise<SuccessResponse<Table[]>> {
        return this.tablesService.getTablesBySlug(slug, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':slug')
    createTable(
        @Param('slug') slug: string,
        @Body() dto: CreateTableDto,
        @CurrentUser('id') userId: string,
    ): Promise<SuccessResponse<Table>> {
        return this.tablesService.createTable(slug, dto, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':slug/:tableId')
    updateTable(
        @Param('slug') slug: string,
        @Param('tableId') tableId: string,
        @Body() dto: UpdateTableDto,
        @CurrentUser('id') userId: string,
    ): Promise<SuccessResponse<Table>> {
        return this.tablesService.updateTable(slug, tableId, dto, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':slug/:tableId')
    deleteTable(
        @Param('slug') slug: string,
        @Param('tableId') tableId: string,
        @CurrentUser('id') userId: string,
    ): Promise<SuccessResponse<Table>> {
        return this.tablesService.deleteTable(slug, tableId, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':slug/:tableId/refresh-qr')
    refreshQr(
        @Param('slug') slug: string,
        @Param('tableId') tableId: string,
        @CurrentUser('id') userId: string,
    ): Promise<SuccessResponse<Table>> {
        return this.tablesService.refreshQr(slug, tableId, userId);
    }
}
