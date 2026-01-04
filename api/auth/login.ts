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
    code: text('code'),
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

        // Generate a random token for the magic link (UUID)
        const token = crypto.randomUUID();

        // Generate a 6-digit OTP code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Delete existing tokens for this email
        await db.delete(magicTokens).where(eq(magicTokens.email, email));

        // Store both token and code
        await db.insert(magicTokens).values({
            email,
            token,
            code,
            expiresAt,
        });

        // Send email with both options
        const magicLink = `${APP_URL}/api/auth/verify?token=${token}`;

        const { error: emailError } = await resend.emails.send({
            from: 'PracticePerfect <admin@ambient.technology>',
            to: email,
            subject: 'Sign in to PracticePerfect',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333; text-align: center;">Sign in to PracticePerfect</h2>
                    
                    <p style="text-align: center; font-size: 16px; color: #555;">
                        Click the button below to sign in instantly, or enter the code if you're on a different device.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${magicLink}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                            Sign In to PracticePerfect
                        </a>
                    </div>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <p style="margin-top: 0; color: #666; font-size: 14px; margin-bottom: 10px;">Using the app on your phone? Enter this code:</p>
                        <div style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #10B981; background: white; padding: 10px 20px; border: 2px solid #10B981; border-radius: 8px; display: inline-block;">
                            ${code}
                        </div>
                    </div>

                    <p style="text-align: center; color: #888; font-size: 14px; margin-top: 30px;">
                        Or copy and paste this link into your browser:<br>
                        <a href="${magicLink}" style="color: #10B981; word-break: break-all;">${magicLink}</a>
                    </p>
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
