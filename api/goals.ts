import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, timestamp, uuid, integer, boolean } from 'drizzle-orm/pg-core';
import { eq, desc, and } from 'drizzle-orm';

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

        // Single goal operations (PUT/DELETE with ?id=...)
        if (id) {
            if (req.method === 'PUT') {
                const data = req.body;
                const updateData: Record<string, any> = { updatedAt: new Date() };
                if (data.name !== undefined) updateData.name = data.name;
                if (data.description !== undefined) updateData.description = data.description || '';
                if (data.count !== undefined) updateData.count = data.count;
                if (data.targetCount !== undefined) updateData.targetCount = data.targetCount;
                if (data.cadence !== undefined) updateData.cadence = data.cadence;
                if (data.isActive !== undefined) updateData.isActive = data.isActive;
                if (data.completed !== undefined) updateData.completed = data.completed;
                if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : new Date();
                if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
                if (data.link !== undefined) updateData.link = data.link || null;
                if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
                if (data.lastClicked !== undefined) updateData.lastClicked = data.lastClicked ? new Date(data.lastClicked) : null;

                const [updated] = await db.update(goals)
                    .set(updateData)
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
        }

        // Collection operations (GET/POST)
        if (req.method === 'GET') {
            const userGoals = await db.select().from(goals)
                .where(eq(goals.userId, payload.userId))
                .orderBy(desc(goals.createdAt));
            return res.status(200).json(userGoals);
        }

        if (req.method === 'POST') {
            const data = req.body;

            const goalData = {
                userId: payload.userId,
                name: data.name,
                description: data.description || '',
                count: data.count || 0,
                targetCount: data.targetCount,
                cadence: data.cadence,
                isActive: data.isActive ?? true,
                completed: data.completed ?? false,
                startDate: data.startDate ? new Date(data.startDate) : new Date(),
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                link: data.link || null,
                sortOrder: data.sortOrder || 0,
            };

            const [newGoal] = await db.insert(goals).values(goalData).returning();
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
