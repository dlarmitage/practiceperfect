import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../src/db/drizzle';
import { goals } from '../../src/db/schema';
import { getAuthTokenFromRequest, verifyToken } from '../utils/auth';
import { eq, desc } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const token = getAuthTokenFromRequest(req);
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = verifyToken(token);
    if (!payload) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            const userGoals = await db.select()
                .from(goals)
                .where(eq(goals.userId, payload.userId))
                .orderBy(desc(goals.createdAt));
            return res.status(200).json(userGoals);
        } catch (error) {
            console.error('Error fetching goals:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    if (req.method === 'POST') {
        try {
            const data = req.body;
            const [newGoal] = await db.insert(goals).values({ ...data, userId: payload.userId }).returning();
            return res.status(201).json(newGoal);
        } catch (error) {
            console.error('Error creating goal:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
