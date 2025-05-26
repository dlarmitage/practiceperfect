// Define types for the application

// Define the cadence type
export type Cadence = 'hourly' | 'daily' | 'weekly' | 'monthly';

// Define goal status type
export type GoalStatus = 'active' | 'not-started' | 'out-of-cadence' | 'past-due';

// Goal type
export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description: string;
  count: number;
  targetCount: number;
  cadence: Cadence;
  isActive: boolean;
  startDate: string;
  dueDate?: string;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

// User type
export interface User {
  id: string;
  email: string;
  user_metadata?: {
    display_name?: string;
    name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  setUser: (user: User | null) => void;
  signUp: (email: string, password: string, firstName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Goal context type
export interface GoalContextType {
  goals: Goal[];
  loading: boolean;
  error: Error | null;
  createGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'user_id'> & { dueDate?: string }) => Promise<Goal>;
  updateGoal: (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt' | 'user_id'>>) => Promise<Goal>;
  incrementGoalCount: (id: string) => Promise<Goal>;
  deleteGoal: (id: string) => Promise<boolean>;
  showInactive: boolean;
  setShowInactive: (show: boolean) => void;
}
