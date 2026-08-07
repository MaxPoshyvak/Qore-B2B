import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Некоректний формат email' })
    email!: string;

    @IsString()
    @MinLength(6, { message: 'Пароль має містити мінімум 6 символів' })
    password!: string;

    @IsString()
    @IsNotEmpty({ message: "Ім'я є обов'язковим" })
    name!: string;
}

export class LoginDto {
    @IsEmail({}, { message: 'Некоректний формат email' })
    email!: string;

    @IsString()
    @IsNotEmpty({ message: "Пароль є обов'язковим" })
    password!: string;
}

export class RefreshDto {
    @IsString()
    @IsNotEmpty({ message: "Refresh токен є обов'язковим" })
    refreshToken!: string;
}
