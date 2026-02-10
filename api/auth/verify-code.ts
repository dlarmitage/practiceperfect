import type { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { pgTable, text, timestamp, boolean, uuid, integer } from 'drizzle-orm/pg-core';
import { eq, and, gt } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

// Inline schema definitions
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
    code: text('code'),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Lazy DB connection
let _db: any = null;
function getDb() {
    if (!_db) {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) throw new Error('DATABASE_URL not set');
        const sql = neon(dbUrl);
        _db = drizzle(sql);
    }
    return _db;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL || 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ error: 'Email and code are required' });
        }

        const db = getDb();
        const now = new Date();

        // Find valid token for this email with matching code
        // Note: Using a raw query logic here via drizzle
        const [validToken] = await db
            .select()
            .from(magicTokens)
            .where(and(
                eq(magicTokens.email, email),
                eq(magicTokens.code, code),
                gt(magicTokens.expiresAt, now)
            ))
            .limit(1);

        if (!validToken) {
            return res.status(401).json({ error: 'Invalid or expired code' });
        }

        // Get or create user
        let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!user) {
            [user] = await db.insert(users).values({
                email,
                displayName: email.split('@')[0],
            }).returning();
        }

        // Create JWT
        const tokenSecret = process.env.JWT_SECRET;
        if (!tokenSecret) {
            throw new Error('JWT_SECRET is not set');
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            tokenSecret,
            { expiresIn: '30d' }
        );

        // Delete used token(s)
        await db.delete(magicTokens).where(eq(magicTokens.email, email));

        // Set cookie
        res.setHeader('Set-Cookie', cookie.serialize('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
        }));

        return res.status(200).json({ user, token });
    } catch (error) {
        console.error('Verify Code error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
