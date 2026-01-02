import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearAuthCookie } from '../utils/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const cookie = clearAuthCookie();
    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ success: true });
}
