import type { Goal, GoalStatus, Cadence } from '../types';

/**
 * Calculates the current status of a goal based on its properties
 * 
 * @param goal - The goal to calculate status for
 * @returns The current status of the goal
 */
export const calculateGoalStatus = (goal: Goal): GoalStatus => {
  const now = new Date();
  const startDate = new Date(goal.startDate);
  
  // If the goal hasn't started yet (future start date)
  if (startDate > now) {
    return 'not-started';
  }
  
  // If the goal is manually set to inactive
  if (!goal.isActive) {
    return 'not-started';
  }
  
  // If the goal is past due date
  if (goal.dueDate && new Date(goal.dueDate) < now) {
    return 'past-due';
  }
  
  // Check if the goal is out of cadence
  const lastUpdated = new Date(goal.updatedAt);
  const isOutOfCadence = isGoalOutOfCadence(goal.cadence, lastUpdated, goal.count, goal.targetCount);
  
  return isOutOfCadence ? 'out-of-cadence' : 'active';
};

/**
 * Determines if a goal is out of its practice cadence
 * 
 * @param cadence - The practice cadence of the goal
 * @param lastUpdated - The date when the goal was last updated
 * @returns Whether the goal is out of cadence
 */
/**
 * Determines if a goal is out of its practice cadence based on count, target, and time
 * 
 * @param cadence - The practice cadence of the goal
 * @param lastUpdated - The date when the goal was last updated
 * @param currentCount - The current count of the goal
 * @param targetCount - The target count of the goal
 * @returns Whether the goal is out of cadence
 */
export const isGoalOutOfCadence = (
  cadence: Cadence, 
  lastUpdated: Date,
  currentCount: number,
  targetCount: number
): boolean => {
  const now = new Date();
  
  // First check if the goal has met its target count
  if (currentCount >= targetCount) {
    return false; // Goal is achieved, not out of cadence
  }
  
  // Calculate expected progress based on time elapsed and cadence
  switch (cadence) {
    case 'hourly': {
      // For hourly goals, check how many hours have passed since last update
      const hoursSinceLastUpdate = (now.getTime() - lastUpdated.getTime()) / (60 * 60 * 1000);
      
      // Calculate expected count by now based on target per hour
      // If target is 5 per hour, and 2 hours passed, expected count would be current + 10
      const expectedProgressPerHour = targetCount;
      const expectedAdditionalProgress = Math.floor(hoursSinceLastUpdate * expectedProgressPerHour);
      
      // If no progress has been made in the time frame where we expect progress, it's out of cadence
      return expectedAdditionalProgress > 0;
    }
      
    case 'daily': {
      // Check if the last update was on a different day
      const dayDifference = (
        now.getDate() !== lastUpdated.getDate() ||
        now.getMonth() !== lastUpdated.getMonth() ||
        now.getFullYear() !== lastUpdated.getFullYear()
      );
      
      // If a day has passed and the target hasn't been met, it's out of cadence
      return dayDifference;
    }
      
    case 'weekly': {
      // Check if more than 7 days have passed
      const diffTime = Math.abs(now.getTime() - lastUpdated.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 7;
    }
      
    case 'monthly': {
      // Check if we're in a different month
      return (
        now.getMonth() !== lastUpdated.getMonth() ||
        now.getFullYear() !== lastUpdated.getFullYear()
      );
    }
      
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
