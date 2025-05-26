# PracticePerfect PWA

PracticePerfect is a Progressive Web Application (PWA) designed to help users track their practice sessions for various skills and tasks. Users can create goals, track their progress, and receive encouraging messages to help them stay motivated.

## Features

- **User Authentication**: Secure login and registration using Supabase
- **Goal Tracking**: Create and manage practice goals with customizable properties
- **Practice Cadence**: Set hourly, daily, or weekly practice schedules
- **Visual Status Indicators**: Color-coded buttons show goal status at a glance
- **Motivational Messages**: AI-generated encouraging messages using OpenAI
- **Offline Support**: Use the app even without an internet connection
- **Mobile-First Design**: Responsive interface optimized for mobile devices
- **Push Notifications**: Optional reminders for practice sessions

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: TailwindCSS
- **Authentication & Database**: Supabase
- **AI Integration**: OpenAI
- **Build Tool**: Vite
- **PWA Support**: Workbox

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your API keys:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Database Setup

Create the following tables in your Supabase project:

### Goals Table

```sql
create table goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  count integer default 0,
  practice_cadence text not null,
  start_date timestamp with time zone not null,
  due_date timestamp with time zone,
  external_link text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Set up RLS policies
alter table goals enable row level security;

create policy "Users can create their own goals."
  on goals for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own goals."
  on goals for select
  using (auth.uid() = user_id);

create policy "Users can update their own goals."
  on goals for update
  using (auth.uid() = user_id);

create policy "Users can delete their own goals."
  on goals for delete
  using (auth.uid() = user_id);
```

## Deployment

To build the app for production:

```bash
npm run build
```

The built files will be in the `dist` directory, ready to be deployed to your favorite hosting service.
