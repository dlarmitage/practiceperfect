import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';

// ============ SCHEMA ============
const magicTokens = pgTable('magic_tokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============ DB ============
function getDb() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL not set');
    return drizzle(neon(dbUrl));
}

// ============ HANDLER ============
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
        const resend = new Resend(process.env.RESEND_API_KEY);
        const APP_URL = process.env.APP_URL || 'http://localhost:5173';
        const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

        // Generate token
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Delete existing tokens for this email
        await db.delete(magicTokens).where(eq(magicTokens.email, email));

        // Store new token
        await db.insert(magicTokens).values({ email, token, expiresAt });

        // Send email
        const magicLink = `${APP_URL}/auth/verify?token=${token}`;
        const { error: emailError } = await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'Sign in to PracticePerfect',
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 400px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #10B981;">PracticePerfect</h1>
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #374151; line-height: 1.5;">Click the button below to sign in to your account:</p>
                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                                <tr>
                                    <td style="border-radius: 8px; background-color: #10B981;">
                                        <a href="${magicLink}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">Sign In</a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 24px 0 8px 0; font-size: 14px; color: #6b7280;">Or copy and paste this link into your browser:</p>
                            <p style="margin: 0 0 24px 0; font-size: 12px; color: #3b82f6; word-break: break-all;"><a href="${magicLink}" style="color: #3b82f6; text-decoration: none;">${magicLink}</a></p>
                            <p style="margin: 0; font-size: 13px; color: #9ca3af;">This link expires in 15 minutes.</p>
                            <p style="margin: 16px 0 0 0; font-size: 12px; color: #d1d5db;">If you didn't request this email, you can safely ignore it.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `,
        });

        if (emailError) {
            console.error('Resend error:', emailError);
            return res.status(500).json({ error: 'Failed to send email' });
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
