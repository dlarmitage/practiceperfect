import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../src/db/drizzle';
import { sessions } from '../../src/db/schema';
import { getAuthTokenFromRequest, verifyToken } from '../utils/auth';
import { eq, desc, and } from 'drizzle-orm';

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
            const goalId = req.query.goalId as string | undefined;

            const conditions = [eq(sessions.userId, payload.userId)];

            if (goalId) {
                conditions.push(eq(sessions.goalId, goalId));
            }

            const userSessions = await db.select()
                .from(sessions)
                // @ts-ignore - drizzle 'and' types can be tricky with arrays
                .where(and(...conditions))
                .orderBy(desc(sessions.sessionDate));

            return res.status(200).json(userSessions);
        } catch (error) {
            console.error('Error fetching sessions:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    if (req.method === 'POST') {
        try {
            const data = req.body;
            const [newSession] = await db.insert(sessions).values({ ...data, userId: payload.userId }).returning();
            return res.status(201).json(newSession);
        } catch (error) {
            console.error('Error creating session:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
