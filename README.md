# Practice Perfect

A Progressive Web Application (PWA) for building consistent practice habits and tracking progress across skills and activities. Combines goal setting, session tracking, progress analysis, and motivational features.

## Key Features

- **Goal Management**: Create goals with custom cadences (hourly/daily/weekly), target counts, due dates, and external resource links
- **Session Tracking**: Log practice sessions with duration, mood, notes, and location
- **Analytics**: Charts and statistics for progress trends, session insights, and goal comparison
- **Mobile-First PWA**: Installable on mobile devices with offline caching
- **Drag & Drop Sorting**: Reorder goals with custom sort order
- **AI Encouragement**: Motivational messages via OpenAI
- **Celebration Effects**: Confetti animations for milestones

## Tech Stack

### Frontend
- **React 19** + TypeScript
- **React Router v6** for client-side routing
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Vite** + **vite-plugin-pwa** for builds and PWA support

### Backend
- **Vercel Serverless Functions** (Node.js/TypeScript) in the `api/` directory
- **Neon PostgreSQL** via `@neondatabase/serverless`
- **Drizzle ORM** for database queries
- **JWT authentication** with `jsonwebtoken` (cookie + Authorization header)
- **Resend** for transactional email (OTP verification)

### Infrastructure
- **Vercel** for hosting and serverless deployment
- **Neon** for serverless PostgreSQL

## Getting Started

### Prerequisites
- Node.js v18+
- Vercel CLI (`npm i -g vercel`)
- A Neon database

### Installation

```bash
git clone https://github.com/dlarmitage/practiceperfect.git
cd practiceperfect
npm install
```

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://...your-neon-connection-string...
JWT_SECRET=your-jwt-secret
RESEND_API_KEY=your-resend-api-key
APP_URL=http://localhost:3000
FROM_EMAIL=noreply@yourdomain.com
```

### Development

```bash
# Authenticate with Vercel (first time only)
vercel login

# Start the dev server (serves both frontend and API)
vercel dev
```

The app will be available at `http://localhost:3000`.

**Note**: `npm run dev` starts only the Vite frontend dev server (no API). Use `vercel dev` for full-stack local development.

## Project Structure

```
api/                     # Vercel serverless functions
  auth/
    login.ts             # Email/password login
    logout.ts            # Session logout
    me.ts                # Current user check
    profile.ts           # Profile update
    verify.ts            # OTP email verification
    verify-code.ts       # OTP code validation
  goals.ts               # Goals CRUD (GET/POST + PUT/DELETE via ?id=)
  sessions.ts            # Sessions CRUD (GET/POST + PUT/DELETE via ?id=)
  health.ts              # Health check endpoint
src/
  components/            # Reusable UI components
  context/               # React context providers (Auth, Goal, Session)
  pages/                 # Route pages (Home, Sessions, Analysis)
  services/api.ts        # Frontend API client
  types/                 # TypeScript type definitions
  sw.ts                  # Service worker (PWA)
```

## API Routes

All API endpoints are under `/api/` and require JWT authentication (via `Authorization: Bearer <token>` header or `auth_token` cookie).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/verify` | Send OTP email |
| POST | `/api/auth/verify-code` | Validate OTP code |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update display name |
| GET | `/api/goals` | List user's goals |
| POST | `/api/goals` | Create a goal |
| PUT | `/api/goals?id=<uuid>` | Update a goal |
| DELETE | `/api/goals?id=<uuid>` | Delete a goal |
| GET | `/api/sessions` | List user's sessions |
| GET | `/api/sessions?goalId=<uuid>` | Sessions for a goal |
| POST | `/api/sessions` | Create a session |
| PUT | `/api/sessions?id=<uuid>` | Update a session |
| DELETE | `/api/sessions?id=<uuid>` | Delete a session |

## Scripts

```bash
npm run dev        # Start Vite dev server only (frontend)
npm run build      # TypeScript check + production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
vercel dev         # Full-stack local development
```

## Deployment

The app deploys to Vercel. Push to `main` to trigger automatic deployment. Required environment variables must be set in the Vercel project settings.

## License

MIT
