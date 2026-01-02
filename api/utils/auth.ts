import { sign, verify } from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';
import { serialize } from 'cookie';
import type { VercelRequest } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, timestamp, boolean, uuid, integer } from 'drizzle-orm/pg-core';

// ============ JWT & AUTH ============
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod';
const COOKIE_NAME = 'auth_token';

export interface JWTPayload {
    userId: string;
    email: string;
}

export const hashPassword = async (password: string): Promise<string> => {
    return await hash(password, 10);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return await compare(password, hash);
};

export const signToken = (payload: JWTPayload): string => {
    return sign(payload, JWT_SECRET, { expiresIn: '30d' });
};

export const verifyToken = (token: string): JWTPayload | null => {
    try {
        return verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
};

export const setAuthCookie = (token: string) => {
    return serialize(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
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

export const getAuthTokenFromRequest = (req: VercelRequest): string | null => {
    const cookies = req.cookies;
    return cookies?.[COOKIE_NAME] || null;
};

// ============ DATABASE SCHEMA ============
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash'),
    displayName: text('display_name'),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const magicTokens = pgTable('magic_tokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const goals = pgTable('goals', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    count: integer('count').default(0).notNull(),
    targetCount: integer('target_count').notNull(),
    cadence: text('cadence').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    completed: boolean('completed').default(false).notNull(),
    startDate: timestamp('start_date').defaultNow().notNull(),
    dueDate: timestamp('due_date'),
    link: text('link'),
    sortOrder: integer('sort_order').default(0),
    lastClicked: timestamp('last_clicked'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    goalId: uuid('goal_id').notNull(),
    sessionDate: timestamp('session_date').defaultNow().notNull(),
    duration: integer('duration'),
    mood: integer('mood'),
    notes: text('notes'),
    location: text('location'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============ DATABASE CONNECTION ============
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
    if (!_db) {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            throw new Error('DATABASE_URL environment variable is not set');
        }
        const sql = neon(dbUrl);
        _db = drizzle(sql);
    }
    return _db;
}
