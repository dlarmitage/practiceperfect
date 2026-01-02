import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../src/db/drizzle';
import { goals } from '../../src/db/schema';
import { getAuthTokenFromRequest, verifyToken } from '../utils/auth';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const id = req.query.id as string;
    if (!id) {
        return res.status(400).json({ error: 'Goal ID required' });
    }

    const token = getAuthTokenFromRequest(req);
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = verifyToken(token);
    if (!payload) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'PUT') {
        try {
            const updates = req.body;
            const [updatedGoal] = await db.update(goals)
                .set({ ...updates, updatedAt: new Date() })
                .where(and(eq(goals.id, id), eq(goals.userId, payload.userId)))
                .returning();

            if (!updatedGoal) {
                return res.status(404).json({ error: 'Goal not found' });
            }
            return res.status(200).json(updatedGoal);
        } catch (error) {
            console.error('Error updating goal:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const result = await db.delete(goals)
                .where(and(eq(goals.id, id), eq(goals.userId, payload.userId)))
                .returning();

            if (result.length === 0) {
                return res.status(404).json({ error: 'Goal not found' });
            }
            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error deleting goal:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
