import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, users, magicTokens, signToken, setAuthCookie } from '../utils/auth';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const token = req.query.token as string;
    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    try {
        const db = getDb();

        // Find the token
        const [magicToken] = await db.select()
            .from(magicTokens)
            .where(eq(magicTokens.token, token))
            .limit(1);

        if (!magicToken) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // Check if expired
        if (new Date() > magicToken.expiresAt) {
            await db.delete(magicTokens).where(eq(magicTokens.id, magicToken.id));
            return res.status(400).json({ error: 'Token has expired' });
        }

        // Find or create user
        let [user] = await db.select()
            .from(users)
            .where(eq(users.email, magicToken.email))
            .limit(1);

        if (!user) {
            [user] = await db.insert(users).values({
                email: magicToken.email,
            }).returning();
        }

        // Delete the used token
        await db.delete(magicTokens).where(eq(magicTokens.id, magicToken.id));

        // Create session
        const jwtToken = signToken({ userId: user.id, email: user.email });
        const cookie = setAuthCookie(jwtToken);

        res.setHeader('Set-Cookie', cookie);
        return res.status(200).json({
            success: true,
            user: { id: user.id, email: user.email, displayName: user.displayName }
        });

    } catch (error) {
        console.error('Verify error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
