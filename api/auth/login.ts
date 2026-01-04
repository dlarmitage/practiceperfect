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
