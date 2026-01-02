import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { getDb, magicTokens } from '../utils/auth';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.APP_URL || 'http://localhost:5173';
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const db = getDb();

        // Generate a secure token
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Delete any existing tokens for this email
        await db.delete(magicTokens).where(eq(magicTokens.email, email));

        // Store the token
        await db.insert(magicTokens).values({
            email,
            token,
            expiresAt,
        });

        // Build the magic link
        const magicLink = `${APP_URL}/auth/verify?token=${token}`;

        // Send the email
        const { error: emailError } = await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'Sign in to PracticePerfect',
            html: `
                <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #10B981;">PracticePerfect</h2>
                    <p>Click the link below to sign in to your account:</p>
                    <a href="${magicLink}" style="display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                        Sign In
                    </a>
                    <p style="color: #666; font-size: 14px;">This link expires in 15 minutes.</p>
                    <p style="color: #999; font-size: 12px;">If you didn't request this email, you can safely ignore it.</p>
                </div>
            `,
        });

        if (emailError) {
            console.error('Resend error:', emailError);
            return res.status(500).json({ error: 'Failed to send email', details: emailError.message });
        }

        return res.status(200).json({ success: true, message: 'Magic link sent' });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
