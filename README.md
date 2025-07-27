# Practice Perfect

A comprehensive Progressive Web Application (PWA) designed to help users build consistent practice habits and track their progress across various skills and activities. Practice Perfect combines goal setting, session tracking, progress analysis, and motivational features to support your journey toward mastery.

## 🌟 Key Features

### **Goal Management**
- **Flexible Goal Creation**: Set up practice goals with custom names, descriptions, and target counts
- **Multiple Cadences**: Choose from hourly, daily, or weekly practice schedules
- **Smart Due Dates**: Optional due dates with automatic status tracking
- **External Links**: Add relevant resources or references to your goals
- **Goal Status Tracking**: Visual indicators for "In Progress", "Completed", "Past Due", and "Not Started" states

### **Practice Session Tracking**
- **Session Timer**: Built-in timer for tracking practice duration
- **Session Completion**: Log completed sessions with duration, mood, notes, and location
- **Progress Visualization**: Real-time progress bars and completion percentages
- **Session History**: Comprehensive view of all practice sessions with filtering options

### **Advanced Analytics**
- **Progress Analysis**: Detailed charts and statistics for each goal
- **Performance Trends**: Track improvement over time with visual graphs
- **Session Insights**: Analyze practice patterns, duration trends, and mood correlations
- **Goal Comparison**: Compare progress across multiple goals

### **User Experience**
- **Mobile-First Design**: Fully responsive interface optimized for mobile devices
- **Drag & Drop Reordering**: Custom sort goals by dragging them into your preferred order
- **Multiple Sort Options**: View goals by newest first, oldest first, or custom order
- **PWA Support**: Install as a native app on mobile devices with offline capabilities
- **Real-time Updates**: Instant synchronization across devices

### **Motivation & Engagement**
- **AI-Powered Encouragement**: Personalized motivational messages using OpenAI
- **Celebration Effects**: Confetti animations for completed goals and milestones
- **Progress Celebrations**: Visual feedback for achievements and progress milestones
- **Helpful Hints**: Contextual guidance for new users

### **Account Management**
- **Secure Authentication**: Email/password authentication via Supabase
- **Profile Management**: Update personal information and preferences
- **Password Management**: Change passwords and reset forgotten passwords
- **Account Deletion**: Option to permanently delete account and data

## 🛠️ Technology Stack

### **Frontend**
- **React 19** with TypeScript for type-safe development
- **React Router** for client-side routing
- **Tailwind CSS** for utility-first styling
- **Recharts** for data visualization and analytics

### **Backend & Services**
- **Supabase** for authentication, database, and real-time features
- **OpenAI API** for AI-generated motivational messages
- **PostgreSQL** database with Row Level Security (RLS)

### **Build & Deployment**
- **Vite** for fast development and optimized builds
- **PWA Support** with Workbox for offline functionality
- **TypeScript** for enhanced development experience
- **ESLint** for code quality and consistency

### **Additional Libraries**
- **date-fns** for date manipulation and formatting
- **canvas-confetti** for celebration animations
- **workbox-window** for service worker management

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Supabase account and project
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dlarmitage/practiceperfect.git
   cd practiceperfect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up the database**
   - Create a new Supabase project
   - Run the SQL commands from `src/db/schema.sql` in your Supabase SQL editor
   - Set up Row Level Security policies as defined in the schema

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📊 Database Schema

### Goals Table
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  count INTEGER DEFAULT 0,
  target_count INTEGER DEFAULT 1,
  practice_cadence TEXT NOT NULL CHECK (practice_cadence IN ('hourly', 'daily', 'weekly')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  external_link TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  session_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  duration INTEGER,
  mood TEXT,
  notes TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── GoalButton.tsx   # Individual goal display and interaction
│   ├── GoalForm.tsx     # Goal creation and editing
│   ├── SessionTimer.tsx # Practice session timer
│   ├── Analysis.tsx     # Progress analytics and charts
│   └── ...              # Other UI components
├── pages/               # Main application pages
│   ├── Home.tsx         # Dashboard with goals overview
│   ├── Sessions.tsx     # Session history and management
│   ├── Analysis.tsx     # Detailed progress analysis
│   └── ...              # Other pages
├── context/             # React context providers
│   ├── AuthContext.tsx  # Authentication state management
│   ├── GoalContext.tsx  # Goals data management
│   └── SessionContext.tsx # Sessions data management
├── services/            # API and external service integrations
│   ├── supabase.ts      # Supabase client and queries
│   └── openai.ts        # OpenAI API integration
├── utils/               # Utility functions and helpers
├── types/               # TypeScript type definitions
└── db/                  # Database schema and migrations
```

## 📱 PWA Features

Practice Perfect is a full-featured Progressive Web Application with:

- **Offline Support**: Continue using the app without internet connection
- **App Installation**: Install on mobile devices like a native app
- **Push Notifications**: Get reminders for practice sessions (coming soon)
- **Background Sync**: Sync data when connection is restored
- **Responsive Design**: Optimized for all screen sizes

## 🎨 UI/UX Features

### **Mobile-First Design**
- Touch-friendly interface optimized for mobile devices
- Responsive layout that adapts to different screen sizes
- Smooth animations and transitions

### **Accessibility**
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management for better usability

### **Visual Feedback**
- Loading states and progress indicators
- Success and error notifications
- Hover and active states for interactive elements
- Celebration animations for achievements

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Consistent naming conventions

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to:
- Vercel
- Netlify
- Firebase Hosting
- Any static hosting service

### Environment Variables
Make sure to set the following environment variables in your production environment:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_OPENAI_API_KEY`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the excellent backend-as-a-service platform
- **OpenAI** for AI-powered motivational features
- **Tailwind CSS** for the utility-first CSS framework
- **React** team for the amazing frontend framework
- **Vite** for the fast build tool and development experience

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Practice Perfect** - Building better habits, one session at a time. 🎯
