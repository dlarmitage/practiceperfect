import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, timestamp, uuid, integer, boolean } from 'drizzle-orm/pg-core';
import { eq, and } from 'drizzle-orm';

// ============ SCHEMA ============
const goals = pgTable('goals', {
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
        if (!id) return res.status(400).json({ error: 'Goal ID required' });

        const db = getDb();

        if (req.method === 'PUT') {
            const data = req.body;
            const [updated] = await db.update(goals)
                .set({ ...data, updatedAt: new Date() })
                .where(and(eq(goals.id, id), eq(goals.userId, payload.userId)))
                .returning();

            if (!updated) return res.status(404).json({ error: 'Goal not found' });
            return res.status(200).json(updated);
        }

        if (req.method === 'DELETE') {
            const [deleted] = await db.delete(goals)
                .where(and(eq(goals.id, id), eq(goals.userId, payload.userId)))
                .returning();

            if (!deleted) return res.status(404).json({ error: 'Goal not found' });
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method Not Allowed' });
    } catch (error) {
        console.error('Goal API error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
