import { Controller, Post, Body, Get, Query, Res, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshDto, VerifyOtpDto, ResendCodeDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { AuthSuccessResponse, VerificationSentResponse } from '@my-app/types';
import { env } from '../../config/env';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async register(@Body() dto: RegisterDto): Promise<AuthSuccessResponse> {
        return this.authService.register(dto);
    }

    @Post('login')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async login(@Body() dto: LoginDto): Promise<AuthSuccessResponse> {
        return this.authService.login(dto);
    }

    @Post('refresh')
    async refresh(@Body() dto: RefreshDto) {
        return this.authService.refreshTokens(dto.refreshToken);
    }

    @Post('verify-otp')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async verifyOtp(@Body() dto: VerifyOtpDto): Promise<AuthSuccessResponse> {
        return this.authService.verifyOtp(dto);
    }

    @Post('resend-code')
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async resendCode(@Body() dto: ResendCodeDto): Promise<VerificationSentResponse> {
        return this.authService.resendCode(dto);
    }

    @Post('forgot-password')
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<VerificationSentResponse> {
        return this.authService.forgotPassword(dto);
    }

    @Post('reset-password')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async resetPassword(@Body() dto: ResetPasswordDto): Promise<VerificationSentResponse> {
        return this.authService.resetPassword(dto);
    }

    @Get('verify-link')
    async verifyLink(@Query('token') token: string, @Res() res: Response) {
        if (!token) {
            return res.redirect(`${env.FRONTEND_URL}/verify-email?status=invalid`);
        }

        try {
            await this.authService.verifyLink(token);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Verification failed';
            return res.redirect(`${env.FRONTEND_URL}/verify-email?status=error&reason=${encodeURIComponent(message)}`);
        }

        return res.redirect(`${env.FRONTEND_URL}/onboarding?verified=1`);
    }
}
