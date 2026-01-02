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
                <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #10B981;">PracticePerfect</h2>
                    <p>Click the link below to sign in:</p>
                    <a href="${magicLink}" style="display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Sign In</a>
                    <p style="color: #666; font-size: 14px;">This link expires in 15 minutes.</p>
                </div>
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
