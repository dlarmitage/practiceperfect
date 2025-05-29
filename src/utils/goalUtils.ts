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
  // Use end of day comparison to ensure a goal is only past-due after the day is over
  if (goal.dueDate) {
    const date = new Date(goal.dueDate);
    
    // Get UTC components to avoid timezone shifts
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    
    // Create a date at 11:59:59 PM of the due date in local time
    const endOfDueDay = new Date(year, month, day, 23, 59, 59);
    
    if (endOfDueDay < now) {
      return 'past-due';
    }
  }
  
  // Check if the goal is out of cadence
  if (!goal.lastClicked) {
    // For new goals that have never been clicked
    // Daily goals should start as active until the end of the day
    if (goal.cadence === 'daily') {
      // Check if the goal was created today
      const createdDate = new Date(goal.createdAt);
      const isSameDay = (
        now.getDate() === createdDate.getDate() &&
        now.getMonth() === createdDate.getMonth() &&
        now.getFullYear() === createdDate.getFullYear()
      );
      
      // If the goal was created today, it's still active
      if (isSameDay) {
        return 'active';
      }
    }
    
    // For other cadences or goals created on previous days, mark as out-of-cadence
    return 'out-of-cadence';
  }
  
  // Otherwise, check if it's out of cadence based on the last interaction time
  const lastInteraction = new Date(goal.lastClicked);
  const isOutOfCadence = isGoalOutOfCadence(goal.cadence, lastInteraction, goal.count, goal.targetCount);
  
  return isOutOfCadence ? 'out-of-cadence' : 'active';
};

/**
 * Determines if a goal is out of its practice cadence based on count, target, and time
 * 
 * @param cadence - The practice cadence of the goal
 * @param lastInteraction - The date when the goal was last interacted with
 * @param currentCount - The current count of the goal
 * @param targetCount - The target count of the goal
 * @returns Whether the goal is out of cadence
 */
export const isGoalOutOfCadence = (
  cadence: Cadence, 
  lastInteraction: Date,
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
      // For hourly goals, check how many hours have passed since last interaction
      const hoursSinceLastUpdate = (now.getTime() - lastInteraction.getTime()) / (60 * 60 * 1000);
      
      // Calculate expected count by now based on target per hour
      // If target is 5 per hour, and 2 hours passed, expected count would be current + 10
      const expectedProgressPerHour = targetCount;
      const expectedAdditionalProgress = Math.floor(hoursSinceLastUpdate * expectedProgressPerHour);
      
      // If no progress has been made in the time frame where we expect progress, it's out of cadence
      return expectedAdditionalProgress > 0;
    }
      
    case 'daily': {
      // Check if the last interaction was on a different day
      const dayDifference = (
        now.getDate() !== lastInteraction.getDate() ||
        now.getMonth() !== lastInteraction.getMonth() ||
        now.getFullYear() !== lastInteraction.getFullYear()
      );
      
      // If a day has passed and the target hasn't been met, it's out of cadence
      return dayDifference;
    }
      
    case 'weekly': {
      // Check if more than 7 days have passed
      const diffTime = Math.abs(now.getTime() - lastInteraction.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 7;
    }
      
    case 'monthly': {
      // Check if we're in a different month
      return (
        now.getMonth() !== lastInteraction.getMonth() ||
        now.getFullYear() !== lastInteraction.getFullYear()
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
  
  // Parse the date string and handle timezone offset
  const date = new Date(dateString);
  
  // Get UTC components to avoid timezone shifts
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  
  // Create a new date using local timezone but with the UTC components
  // This ensures the date displayed is the exact date that was selected
  const localDate = new Date(year, month, day);
  
  return localDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Formats a cadence for display
 * 
 * @param cadence - The cadence to format
 * @returns Formatted cadence string (e.g., "Daily", "Weekly", etc.)
 */
export const formatCadence = (cadence: Cadence): string => {
  switch (cadence) {
    case 'hourly':
      return 'Hourly';
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    default:
      // Convert the cadence to string to ensure we can use string methods
      const cadenceStr = String(cadence);
      return cadenceStr.charAt(0).toUpperCase() + cadenceStr.slice(1);
  }
};
