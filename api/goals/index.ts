import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, goals } from '../lib/db';
import { getAuthTokenFromRequest, verifyToken } from '../utils/auth';
import { eq, desc } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const token = getAuthTokenFromRequest(req);
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const db = getDb();

        if (req.method === 'GET') {
            const userGoals = await db.select()
                .from(goals)
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
