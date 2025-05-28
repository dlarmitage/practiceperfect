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
- **Styling**: Tailwind CSS with custom components
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

## Tailwind CSS Implementation

### Overview

The application uses Tailwind CSS for styling with a utility-first approach. This provides several benefits:

- Consistent design system across all components
- Rapid UI development without context switching
- Smaller CSS bundle size in production
- Easy responsive design implementation

### Structure

- **tailwind.config.js**: Contains custom colors, theme extensions, and plugin configurations
- **src/tailwind.css**: Imports Tailwind's base, components, and utilities layers, plus custom component classes

### Custom Components

We've created custom component classes using Tailwind's `@apply` directive in `src/tailwind.css` for commonly used UI patterns:

```css
@layer components {
  .btn {
    @apply px-4 py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
  }
  
  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
  }
  
  /* ... more component classes ... */
}
```

### Development Notes

- **Lint Errors**: You will see lint errors related to the `@tailwind` and `@apply` directives in `tailwind.css`. These warnings appear as:
  ```
  Unknown at rule @tailwind
  Unknown at rule @apply
  ```
  These are **expected and can be safely ignored** during development, as they're processed correctly by the Tailwind CSS compiler. These directives are Tailwind-specific syntax that the standard CSS linter doesn't recognize, but they're properly processed during the build process.

- **TailwindButton Component**: A reusable button component is available at `src/components/TailwindButton.tsx` that demonstrates how to create flexible UI components with Tailwind.

- **TailwindDemo Page**: Visit the `/tailwind` route to see examples of various Tailwind-styled components.
