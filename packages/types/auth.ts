export interface LoginDTO {
    email: string;
    password: string;
}

export interface RegisterDTO {
    email: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

export interface JwtPayload {
    userId: string;
    role: string;
    iat?: number;
    exp?: number;
}
