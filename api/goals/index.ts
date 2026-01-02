import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, timestamp, uuid, integer, boolean } from 'drizzle-orm/pg-core';
import { eq, desc } from 'drizzle-orm';

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

        const db = getDb();

        if (req.method === 'GET') {
            const userGoals = await db.select().from(goals)
                .where(eq(goals.userId, payload.userId))
                .orderBy(desc(goals.createdAt));
            return res.status(200).json(userGoals);
        }

        if (req.method === 'POST') {
            const data = req.body;
            const [newGoal] = await db.insert(goals).values({ ...data, userId: payload.userId }).returning();
            return res.status(201).json(newGoal);
        }

        return res.status(405).json({ error: 'Method Not Allowed' });
    } catch (error) {
        console.error('Goals API error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
