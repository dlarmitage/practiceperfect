import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../src/db/drizzle';
import { users } from '../../src/db/schema';
import { getAuthTokenFromRequest, verifyToken } from '../utils/auth';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const token = getAuthTokenFromRequest(req);
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = verifyToken(token);
    if (!payload) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { displayName } = req.body;

        const [updatedUser] = await db.update(users)
            .set({ displayName, updatedAt: new Date() })
            .where(eq(users.id, payload.userId))
            .returning();

        return res.status(200).json({ user: { id: updatedUser.id, email: updatedUser.email, displayName: updatedUser.displayName } });
    } catch (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
