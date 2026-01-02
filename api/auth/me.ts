import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../src/db/drizzle';
import { users } from '../../src/db/schema';
import { getAuthTokenFromRequest, verifyToken } from '../utils/auth';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const token = getAuthTokenFromRequest(req);
    if (!token) {
        return res.status(200).json({ user: null });
    }

    const payload = verifyToken(token);
    if (!payload) {
        return res.status(200).json({ user: null });
    }

    try {
        const [user] = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);
        if (!user) {
            return res.status(200).json({ user: null });
        }

        return res.status(200).json({ user: { id: user.id, email: user.email, displayName: user.displayName } });
    } catch (error) {
        console.error('Auth check error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
