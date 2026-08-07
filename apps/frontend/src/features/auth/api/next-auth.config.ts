import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { env } from '@/env';
import { AuthSuccessResponse } from '@my-app/types'; // Твої типи DTO

// Окрема функція для запиту нового токена у NestJS
async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
        const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: token.refreshToken }),
        });

        const refreshedData = await res.json();

        if (!res.ok || !refreshedData.success) {
            throw refreshedData;
        }

        return {
            ...token,
            accessToken: refreshedData.data.accessToken,
            accessTokenExpires: Date.now() + 15 * 60 * 1000, // +15 хвилин
            // Якщо бекенд повертає новий refresh-токен — беремо його, якщо ні — залишаємо старий
            refreshToken: refreshedData.data.refreshToken ?? token.refreshToken,
        };
    } catch (error) {
        console.error('Error refreshing access token', error);
        return {
            ...token,
            error: 'RefreshAccessTokenError', // Фронтенд зловить це і викине на /login
        };
    }
}

export const authOptions: NextAuthOptions = {
    secret: env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 днів
    },
    cookies: {
        sessionToken: {
            name: `session_token`, // Твоя HttpOnly кука для власника
            options: {
                httpOnly: true,
                sameSite: 'strict',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) return null;

                try {
                    // Використовуємо нативний fetch, бо apiClient розрахований на запити з браузера
                    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    });

                    const json = await res.json();

                    if (!json.success) return null;

                    return {
                        id: json.data.user.id,
                        name: json.data.user.name,
                        email: json.data.user.email,
                        image: json.data.user.image,
                        accessToken: json.data.accessToken,
                        refreshToken: json.data.refreshToken,
                        expiresIn: 15 * 60 * 1000, // 15 хв
                    };
                } catch (err) {
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // 1. Перший вхід (user існує лише при логіні)
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                    accessTokenExpires: Date.now() + user.expiresIn,
                };
            }

            // 2. Наступні виклики: перевіряємо чи живий Access Token
            if (Date.now() < token.accessTokenExpires) {
                return token; // Токен дійсний, просто повертаємо його
            }

            // 3. Access Token протермінувався — робимо Refresh
            return refreshAccessToken(token);
        },

        async session({ session, token }) {
            // Віддаємо на клієнт тільки публічну інфу (безпека)
            session.user.id = token.id;
            session.error = token.error;

            return session;
        },
    },
};
