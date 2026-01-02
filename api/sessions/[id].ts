import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { eq, and } from 'drizzle-orm';

// ============ SCHEMA ============
const sessions = pgTable('sessions', {
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

// ============ DB ============
function getDb() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL not set');
    return drizzle(neon(dbUrl));
}

// ============ AUTH ============
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const COOKIE_NAME = 'auth_token';

interface JWTPayload { userId: string; email: string; }

function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

function getAuthTokenFromRequest(req: VercelRequest): string | null {
    return req.cookies?.[COOKIE_NAME] || null;
}

// ============ HANDLER ============
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const token = getAuthTokenFromRequest(req);
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const payload = verifyToken(token);
        if (!payload) return res.status(401).json({ error: 'Unauthorized' });

        const id = req.query.id as string;
        if (!id) return res.status(400).json({ error: 'Session ID required' });

        const db = getDb();

        if (req.method === 'PUT') {
            const data = req.body;
            const [updated] = await db.update(sessions)
                .set({ ...data, updatedAt: new Date() })
                .where(and(eq(sessions.id, id), eq(sessions.userId, payload.userId)))
                .returning();

            if (!updated) return res.status(404).json({ error: 'Session not found' });
            return res.status(200).json(updated);
        }

        if (req.method === 'DELETE') {
            const [deleted] = await db.delete(sessions)
                .where(and(eq(sessions.id, id), eq(sessions.userId, payload.userId)))
                .returning();

            if (!deleted) return res.status(404).json({ error: 'Session not found' });
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method Not Allowed' });
    } catch (error) {
        console.error('Session API error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
