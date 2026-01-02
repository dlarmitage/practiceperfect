import type { VercelRequest, VercelResponse } from '@vercel/node';
import cookie from 'cookie';

const COOKIE_NAME = 'auth_token';

function clearAuthCookie() {
    return cookie.serialize(COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: -1,
        path: '/',
    });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const cookieHeader = clearAuthCookie();
    res.setHeader('Set-Cookie', cookieHeader);
    return res.status(200).json({ success: true });
}
