import { IsNotEmpty, IsString } from 'class-validator';
import { createZodDto } from 'nestjs-zod';
import { LoginSchema, RegisterSchema } from '@my-app/types';

// Створюємо класи для NestJS на основі спільних Zod-схем!
export class LoginDto extends createZodDto(LoginSchema) {}
export class RegisterDto extends createZodDto(RegisterSchema) {}

export class RefreshDto {
    @IsString()
    @IsNotEmpty({ message: "Refresh токен є обов'язковим" })
    refreshToken!: string;
}
