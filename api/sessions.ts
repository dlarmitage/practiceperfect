import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { eq, desc, and } from 'drizzle-orm';

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
    const cookieToken = req.cookies?.[COOKIE_NAME];
    if (cookieToken) return cookieToken;
    const authHeader = req.headers['authorization'];
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}

// ============ HANDLER ============
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const token = getAuthTokenFromRequest(req);
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const payload = verifyToken(token);
        if (!payload) return res.status(401).json({ error: 'Unauthorized' });

        const db = getDb();
        const id = req.query.id as string | undefined;

        // Single session operations (PUT/DELETE with ?id=...)
        if (id) {
            if (req.method === 'PUT') {
                const data = req.body;
                const updateData: Record<string, any> = { updatedAt: new Date() };
                if (data.goalId !== undefined) updateData.goalId = data.goalId;
                if (data.sessionDate !== undefined) updateData.sessionDate = data.sessionDate ? new Date(data.sessionDate) : new Date();
                if (data.duration !== undefined) updateData.duration = data.duration;
                if (data.mood !== undefined) updateData.mood = data.mood;
                if (data.notes !== undefined) updateData.notes = data.notes;
                if (data.location !== undefined) updateData.location = data.location;

                const [updated] = await db.update(sessions)
                    .set(updateData)
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
        }

        // Collection operations (GET/POST)
        if (req.method === 'GET') {
            const goalId = req.query.goalId as string | undefined;
            const conditions = [eq(sessions.userId, payload.userId)];
            if (goalId) conditions.push(eq(sessions.goalId, goalId));

            const userSessions = await db.select().from(sessions)
                // @ts-ignore
                .where(and(...conditions))
                .orderBy(desc(sessions.sessionDate));

            return res.status(200).json(userSessions);
        }

        if (req.method === 'POST') {
            const data = req.body;

            const sessionData = {
                userId: payload.userId,
                goalId: data.goalId || data.goal_id,
                sessionDate: data.sessionDate ? new Date(data.sessionDate) : new Date(),
                duration: data.duration || null,
                mood: data.mood || null,
                notes: data.notes || null,
                location: data.location || null,
            };

            const [newSession] = await db.insert(sessions).values(sessionData).returning();
            return res.status(201).json(newSession);
        }

        return res.status(405).json({ error: 'Method Not Allowed' });
    } catch (error) {
        console.error('Sessions API error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
