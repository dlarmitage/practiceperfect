export type PracticeCadence = 'hourly' | 'daily' | 'weekly';

export type GoalStatus = 'not-started' | 'active' | 'out-of-cadence' | 'past-due';

export interface Goal {
  id: string;
  name: string;
  description?: string;
  count: number;
  practiceCadence: PracticeCadence;
  startDate: string; // ISO date string
  dueDate?: string; // ISO date string
  externalLink?: string;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  sortOrder?: number; // Position for custom sorting
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}
