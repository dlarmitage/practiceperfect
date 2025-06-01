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
  
  // If the goal is completed, return active status regardless of other conditions
  // This ensures completed goals don't get marked as past-due or out-of-cadence
  if (goal.completed) {
    return 'active';
  }
  
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
      return 'past-due'; // Past due status takes precedence over cadence status
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
      // For hourly goals, check how many minutes have passed since last interaction
      const minutesSinceLastUpdate = (now.getTime() - lastInteraction.getTime()) / (60 * 1000);
      
      // Calculate how many minutes should pass before the goal is out of cadence
      // If target is 60 per hour, we expect 1 every minute, so threshold is 1 minute
      // If target is 6 per hour, we expect 1 every 10 minutes, so threshold is 10 minutes
      const minutesPerExpectedProgress = 60 / targetCount;
      
      // Goal is out of cadence if more time has passed than we allow between expected progress
      return minutesSinceLastUpdate > minutesPerExpectedProgress;
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

/**
 * Returns Tailwind classes for background and text color based on goal status
 */
export function getGoalStatusColor(goal: Goal): { bg: string; text: string } {
  // If goal is inactive, return grey color regardless of other status
  if (!goal.isActive) {
    return {
      bg: 'bg-gradient-to-br from-gray-400/80 to-gray-600/90 border-gray-400',
      text: 'text-white',
    };
  }
  
  if (goal.completed) {
    return {
      bg: 'bg-gradient-to-br from-blue-500/70 to-blue-700/80 border-blue-400',
      text: 'text-white',
    };
  }
  const status = calculateGoalStatus(goal);
  switch (status) {
    case 'active':
      return {
        bg: 'bg-gradient-to-br from-green-400/80 to-green-600/90 border-green-400',
        text: 'text-white',
      };
    case 'not-started':
      return {
        bg: 'bg-gradient-to-br from-gray-700 to-gray-900 border-gray-700',
        text: 'text-white',
      };
    case 'out-of-cadence':
      return {
        bg: 'bg-gradient-to-br from-orange-400/90 to-orange-600/90 border-orange-400',
        text: 'text-white',
      };
    case 'past-due':
      return {
        bg: 'bg-gradient-to-br from-purple-500/90 to-purple-700/90 border-purple-500',
        text: 'text-white',
      };

    default:
      return {
        bg: 'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-300',
        text: 'text-gray-900',
      };
  }
}

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

/**
 * Calculates the expected number of practice events that should have occurred
 * between the start date and either the due date or current time (whichever is earlier)
 * based on the goal's cadence and target count.
 * 
 * @param startDate - The start date of the goal
 * @param cadence - The practice cadence of the goal
 * @param targetCount - The target count per cadence period
 * @param dueDate - Optional due date of the goal
 * @returns The total number of practice events that should have occurred
 */
export const calculateExpectedPracticeEvents = (
  startDate: string | Date,
  cadence: Cadence,
  targetCount: number,
  dueDate?: string | Date | null
): number => {
  // Convert startDate to Date object if it's a string
  const start = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate);
  

  
  // Set start time to 12:01 AM on the start date
  const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 1, 0, 0);
  
  // Get current time
  const now = new Date();
  
  // Determine end date (due date at midnight or current time, whichever is earlier)
  let endTime = now;
  
  if (dueDate) {
    // Convert dueDate to Date object if it's a string
    const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : new Date(dueDate);
    
    // Set due date to end of day (11:59:59 PM)
    const endOfDueDay = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth(), dueDateObj.getDate(), 23, 59, 59, 999);
    
    // Use the earlier of now or due date
    if (endOfDueDay < now) {
      endTime = endOfDueDay;
    }
  }
  
  // If the start date is in the future, no events should have occurred
  if (startTime > endTime) {
    return 0;
  }
  
  // Calculate expected events based on cadence
  switch (cadence) {
    case 'hourly': {
      // Calculate minutes between start and end time
      const minutesDiff = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      // Calculate expected events (accurate to the minute)
      const expected = Math.floor(minutesDiff * (targetCount / 60));
      // Debug log
      console.log('[Hourly] Start:', startTime.toLocaleString(), 'End:', endTime.toLocaleString(), 'Minutes:', minutesDiff, 'Expected:', expected);
      return expected;
    }
    
    case 'daily': {
      // Calculate days between start and end time
      const daysDiff = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24);
      return Math.floor(daysDiff * targetCount);
    }
    
    case 'weekly': {
      // Calculate weeks between start and end time
      const weeksDiff = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24 * 7);
      return Math.floor(weeksDiff * targetCount);
    }
    
    case 'monthly': {
      // Calculate full months between dates
      let months = (endTime.getFullYear() - startTime.getFullYear()) * 12;
      months += endTime.getMonth() - startTime.getMonth();
      
      // Adjust for partial months based on day of month
      if (endTime.getDate() < startTime.getDate()) {
        months--;
      }
      
      return Math.max(0, months * targetCount);
    }
    
    default:
      return 0;
  }
};
