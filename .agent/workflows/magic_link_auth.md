---
description: Implement Standard Magic Link + OTP Authentication
---

# Standard Magic Link + OTP Authentication Workflow

This workflow implements a robust authentication system using Magic Links (for speed) and 6-digit OTP codes (for cross-device/incognito access).

## Prerequisites
- **Database:** Neon (Postgres) with Drizzle ORM
- **Email:** Resend
- **Framework:** React/Vite (Frontend) + Vercel Serverless Functions (Backend)

## 1. Database Schema
Add the following tables to your Drizzle schema (`src/db/schema.ts`):

```typescript
// Users table
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    displayName: text('display_name'),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Magic Link/OTP tokens table
export const magicTokens = pgTable('magic_tokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    token: text('token').notNull().unique(), // UUID for link
    code: text('code'), // 6-digit OTP for manual entry
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

## 2. API Endpoints

### Login Endpoint (`api/auth/login.ts`)
- Accepts `POST { email }`
- Generates a UUID `token` AND a 6-digit numeric `code`.
- Stores both in `magic_tokens`.
- Sends an email using Resend with:
    - A "Sign In" button linking to `/api/auth/verify?token=...`
    - A prominent display of the 6-digit code.
    - Sender: `PracticePerfect <admin@ambient.technology>` (Customize app name)

### Verify Endpoint (`api/auth/verify.ts`)
- Handles GET requests from the email link.
- Validates `token`.
- Checks expiration (15 mins).
- Creates/Gets user.
- Sets HTTP-only `auth_token` cookie.
- Redirects to app home.

### Verify Code Endpoint (`api/auth/verify-code.ts`)
- Accepts `POST { email, code }`.
- Validates `code` matches the latest token for that email.
- Performs same login/cookie logic as `verify.ts`.

## 3. Frontend UI (`src/pages/Login.tsx`)
- **State 1:** Simple Email Input form.
- **State 2:** (After submission) OTP Entry form.
    - 6 input boxes for the code.
    - Auto-focus and paste handling.
    - "Resend Code" button.
    - "Check your email" instructions.

## 4. Environment Variables
Ensure these are set in `.env` and Vercel:
- `DATABASE_URL`
- `RESEND_API_KEY`
- `JWT_SECRET`
- `APP_URL`
- `FROM_EMAIL` (Optional, defaults within code)
