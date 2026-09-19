import { IsNotEmpty, IsString } from 'class-validator';
import { createZodDto } from 'nestjs-zod';
import { LoginSchema, RegisterSchema, VerifyOtpSchema, ResendCodeSchema, ForgotPasswordSchema, ResetPasswordSchema } from '@my-app/types';

// Створюємо класи для NestJS на основі спільних Zod-схем!
export class LoginDto extends createZodDto(LoginSchema) {}
export class RegisterDto extends createZodDto(RegisterSchema) {}
export class VerifyOtpDto extends createZodDto(VerifyOtpSchema) {}
export class ResendCodeDto extends createZodDto(ResendCodeSchema) {}
export class ForgotPasswordDto extends createZodDto(ForgotPasswordSchema) {}
export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}

export class RefreshDto {
    @IsString()
    @IsNotEmpty({ message: "Refresh токен є обов'язковим" })
    refreshToken!: string;
}
