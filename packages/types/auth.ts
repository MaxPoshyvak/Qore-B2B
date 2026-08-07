import { User } from '@my-app/database';

// Робимо пароль обов'язковим за допомогою NonNullable
export interface LoginDTO extends Pick<User, 'email'> {
    password: NonNullable<User['password']>;
}

export interface RegisterDTO extends LoginDTO {
    name: NonNullable<User['name']>;
}

export interface UserResponseDTO {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
}

export interface AuthSuccessResponse {
    success: boolean;
    data: {
        user: UserResponseDTO;
        accessToken: string;
        refreshToken: string;
    };
}
