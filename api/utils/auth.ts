import { sign, verify } from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';
import { serialize } from 'cookie';
import type { VercelRequest } from '@vercel/node';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod';
const COOKIE_NAME = 'auth_token';

// Types
export interface JWTPayload {
    userId: string;
    email: string;
}

// Password Utils
export const hashPassword = async (password: string): Promise<string> => {
    return await hash(password, 10);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return await compare(password, hash);
};

// JWT Utils
export const signToken = (payload: JWTPayload): string => {
    return sign(payload, JWT_SECRET, { expiresIn: '30d' });
};

export const verifyToken = (token: string): JWTPayload | null => {
    try {
        return verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
        return null;
    }
};

// Cookie Utils
export const setAuthCookie = (token: string) => {
    return serialize(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
    });
};

export const clearAuthCookie = () => {
    return serialize(COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: -1,
        path: '/',
    });
};

// Updated to work with VercelRequest
export const getAuthTokenFromRequest = (req: VercelRequest): string | null => {
    const cookies = req.cookies;
    return cookies?.[COOKIE_NAME] || null;
};
