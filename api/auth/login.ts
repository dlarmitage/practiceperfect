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
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #10B981; text-align: center; font-size: 32px; font-weight: bold; margin-bottom: 30px; letter-spacing: -1px;">PracticePerfect</h1>
                    
                    <p style="font-size: 16px; color: #374151; line-height: 24px; margin-bottom: 24px;">
                        Hello,
                    </p>

                    <p style="font-size: 16px; color: #374151; line-height: 24px; margin-bottom: 30px;">
                        Click the button below to sign in to PracticePerfect. This link will expire in 15 minutes.
                    </p>
                    
                    <div style="text-align: center; margin-bottom: 40px;">
                        <a href="${magicLink}" style="background-color: #10B981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                            Sign In to PracticePerfect
                        </a>
                    </div>
                    
                    <div style="background-color: #F3F4F6; padding: 32px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
                        <p style="margin-top: 0; color: #4B5563; font-size: 14px; margin-bottom: 16px;">Using the app on your phone? Enter this code:</p>
                        <div style="font-family: monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #10B981; background: white; padding: 16px 32px; border: 2px solid #10B981; border-radius: 8px; display: inline-block;">
                            ${code}
                        </div>
                    </div>

                    <div style="border-top: 1px solid #E5E7EB; padding-top: 30px; text-align: center;">
                        <p style="color: #6B7280; font-size: 14px; margin-bottom: 10px;">Or copy and paste this link into your browser:</p>
                        <a href="${magicLink}" style="color: #10B981; text-decoration: none; font-size: 13px; word-break: break-all; line-height: 1.5;">
                            ${magicLink}
                        </a>
                        <p style="margin-top: 24px; color: #9CA3AF; font-size: 12px;">
                            If you didn't request this email, you can safely ignore it.
                        </p>
                    </div>
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
