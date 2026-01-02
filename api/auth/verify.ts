import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';

// ============ SCHEMA ============
const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash'),
    displayName: text('display_name'),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

const magicTokens = pgTable('magic_tokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============ DB ============
function getDb() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL not set');
    return drizzle(neon(dbUrl));
}

// ============ AUTH ============
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const COOKIE_NAME = 'auth_token';

function signToken(payload: { userId: string; email: string }): string {
    return sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

function setAuthCookie(token: string) {
    return serialize(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
    });
}

// ============ HANDLER ============
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const token = req.query.token as string;
    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    try {
        const db = getDb();

        // Find token
        const [magicToken] = await db.select().from(magicTokens).where(eq(magicTokens.token, token)).limit(1);
        if (!magicToken) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // Check expiry
        if (new Date() > magicToken.expiresAt) {
            await db.delete(magicTokens).where(eq(magicTokens.id, magicToken.id));
            return res.status(400).json({ error: 'Token has expired' });
        }

        // Find or create user
        let [user] = await db.select().from(users).where(eq(users.email, magicToken.email)).limit(1);
        if (!user) {
            [user] = await db.insert(users).values({ email: magicToken.email }).returning();
        }

        // Delete used token
        await db.delete(magicTokens).where(eq(magicTokens.id, magicToken.id));

        // Set session cookie
        const jwtToken = signToken({ userId: user.id, email: user.email });
        res.setHeader('Set-Cookie', setAuthCookie(jwtToken));

        return res.status(200).json({
            success: true,
            user: { id: user.id, email: user.email, displayName: user.displayName }
        });
    } catch (error) {
        console.error('Verify error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
