import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, users, getAuthTokenFromRequest, verifyToken } from '../utils/auth';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const token = getAuthTokenFromRequest(req);
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { firstName } = req.body;
        const db = getDb();

        const [updated] = await db.update(users)
            .set({ displayName: firstName, updatedAt: new Date() })
            .where(eq(users.id, payload.userId))
            .returning();

        if (!updated) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({ user: { id: updated.id, email: updated.email, displayName: updated.displayName } });
    } catch (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
