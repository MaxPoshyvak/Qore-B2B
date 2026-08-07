import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshDto } from './dto/auth.dto';
import { AuthSuccessResponse } from '@my-app/types';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() dto: RegisterDto): Promise<AuthSuccessResponse> {
        return this.authService.register(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginDto): Promise<AuthSuccessResponse> {
        return this.authService.login(dto);
    }

    @Post('refresh')
    async refresh(@Body() dto: RefreshDto) {
        return this.authService.refreshTokens(dto.refreshToken);
    }
}
