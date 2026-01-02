import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, goals } from '../utils/db';
import { getAuthTokenFromRequest, verifyToken } from '../utils/auth';
import { eq, and } from 'drizzle-orm';

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

        const id = req.query.id as string;
        if (!id) {
            return res.status(400).json({ error: 'Goal ID required' });
        }

        const db = getDb();

        if (req.method === 'PUT') {
            const data = req.body;
            const [updated] = await db.update(goals)
                .set({ ...data, updatedAt: new Date() })
                .where(and(eq(goals.id, id), eq(goals.userId, payload.userId)))
                .returning();

            if (!updated) {
                return res.status(404).json({ error: 'Goal not found' });
            }
            return res.status(200).json(updated);
        }

        if (req.method === 'DELETE') {
            const [deleted] = await db.delete(goals)
                .where(and(eq(goals.id, id), eq(goals.userId, payload.userId)))
                .returning();

            if (!deleted) {
                return res.status(404).json({ error: 'Goal not found' });
            }
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
