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
export function getGoalStatusColor(goal: Goal | string): { bg: string; text: string } {
  if (typeof goal === 'string') {
    // Accept status string directly
    switch (goal) {
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
      case 'completed':
        return {
          bg: 'bg-gradient-to-br from-blue-500/70 to-blue-700/80 border-blue-400',
          text: 'text-white',
        };
      case 'inactive':
        return {
          bg: 'bg-gradient-to-br from-gray-400/80 to-gray-600/90 border-gray-400',
          text: 'text-white',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-300',
          text: 'text-gray-900',
        };
    }
  }
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
  return getGoalStatusColor(status);
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
  // Parse dates properly accounting for timezone
  let startDateObj: Date;
  if (typeof startDate === 'string') {
    // Extract date parts from the string (assuming format YYYY-MM-DD or MM/DD/YYYY)
    const parts = startDate.includes('-') 
      ? startDate.split('T')[0].split('-') 
      : startDate.split('T')[0].split('/');
    
    // If MM/DD/YYYY format
    if (parts[0].length <= 2) {
      // Create date in local timezone (month is 0-indexed in JS Date)
      startDateObj = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
    } else {
      // YYYY-MM-DD format
      startDateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
  } else {
    startDateObj = new Date(startDate);
  }
  
  // Ensure we're using the start of the day in local timezone
  startDateObj.setHours(0, 0, 0, 0);
  
  // Get current time
  const now = new Date();
  
  // Determine end time (due date or current time, whichever is earlier)
  let endTime = now;
  if (dueDate) {
    let dueDateObj: Date;
    if (typeof dueDate === 'string') {
      // Extract date parts from the string (assuming format YYYY-MM-DD or MM/DD/YYYY)
      const parts = dueDate.includes('-') 
        ? dueDate.split('T')[0].split('-') 
        : dueDate.split('T')[0].split('/');
      
      // If MM/DD/YYYY format
      if (parts[0].length <= 2) {
        // Create date in local timezone (month is 0-indexed in JS Date)
        dueDateObj = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
      } else {
        // YYYY-MM-DD format
        dueDateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
    } else {
      dueDateObj = new Date(dueDate);
    }
    
    // Set to end of day
    dueDateObj.setHours(23, 59, 59, 999);
    
    if (dueDateObj < now) {
      endTime = dueDateObj;
    }
  }
  
  // If the start date is in the future, no events should have occurred
  if (startDateObj > endTime) {
    return 0;
  }
  
  // Simple calculation based on cadence as described by the user
  let expectedEvents = 0;
  
  switch (cadence) {
    case 'hourly': {
      // For hourly cadence: elapsed minutes / 60 * targetCount
      const elapsedMinutes = (endTime.getTime() - startDateObj.getTime()) / (1000 * 60);
      expectedEvents = Math.floor(elapsedMinutes / 60 * targetCount);
      

      break;
    }
    
    case 'daily': {
      // For daily cadence: elapsed hours / 24 * targetCount
      // Special case for targetCount=24 (hourly)
      if (targetCount === 24) {
        // Calculate hours since midnight of start date
        const elapsedHours = Math.floor((endTime.getTime() - startDateObj.getTime()) / (1000 * 60 * 60));
        expectedEvents = elapsedHours;
        

      } else {
        // For other daily targets
        const elapsedHours = (endTime.getTime() - startDateObj.getTime()) / (1000 * 60 * 60);
        expectedEvents = Math.floor(elapsedHours / 24 * targetCount);
        

      }
      break;
    }
    
    case 'weekly': {
      // For weekly cadence: elapsed days / 7 * targetCount
      const elapsedDays = (endTime.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24);
      expectedEvents = Math.floor(elapsedDays / 7 * targetCount);
      

      break;
    }
  }
  
  return expectedEvents;
};

