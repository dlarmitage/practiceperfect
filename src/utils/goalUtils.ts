import type { Goal, GoalStatus, PracticeCadence } from '../types';

/**
 * Calculates the current status of a goal based on its properties
 * 
 * @param goal - The goal to calculate status for
 * @returns The current status of the goal
 */
export const calculateGoalStatus = (goal: Goal): GoalStatus => {
  if (!goal.isActive) {
    return 'not-started';
  }

  const now = new Date();
  const startDate = new Date(goal.startDate);
  
  // If the goal hasn't started yet
  if (startDate > now) {
    return 'not-started';
  }
  
  // If the goal is past due date
  if (goal.dueDate && new Date(goal.dueDate) < now) {
    return 'past-due';
  }
  
  // Check if the goal is out of cadence
  const lastUpdated = new Date(goal.updatedAt);
  const isOutOfCadence = isGoalOutOfCadence(goal.practiceCadence, lastUpdated);
  
  return isOutOfCadence ? 'out-of-cadence' : 'active';
};

/**
 * Determines if a goal is out of its practice cadence
 * 
 * @param cadence - The practice cadence of the goal
 * @param lastUpdated - The date when the goal was last updated
 * @returns Whether the goal is out of cadence
 */
export const isGoalOutOfCadence = (
  cadence: PracticeCadence, 
  lastUpdated: Date
): boolean => {
  const now = new Date();
  
  switch (cadence) {
    case 'hourly':
      // Check if more than 1 hour has passed
      return now.getTime() - lastUpdated.getTime() > 60 * 60 * 1000;
      
    case 'daily':
      // Check if the last update was on a different day
      return (
        now.getDate() !== lastUpdated.getDate() ||
        now.getMonth() !== lastUpdated.getMonth() ||
        now.getFullYear() !== lastUpdated.getFullYear()
      );
      
    case 'weekly':
      // Check if more than 7 days have passed
      const diffTime = Math.abs(now.getTime() - lastUpdated.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 7;
      
    default:
      return false;
  }
};

/**
 * Formats a date for display
 * 
 * @param dateString - ISO date string to format
 * @returns Formatted date string (e.g., "May 26, 2025")
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
