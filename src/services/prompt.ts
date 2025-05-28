import type { Goal } from '../types';

/**
 * Generates a prompt for OpenAI to create a welcome message
 * 
 * @param goals - The user's goals
 * @param firstName - The user's first name (optional)
 * @returns A prompt string for OpenAI
 */
export const generateWelcomePrompt = (
  activeGoals: Goal[], 
  completedGoals: Goal[], 
  dueSoonGoals: Goal[], 
  outOfCadenceGoals: Goal[],
  firstName?: string
): string => {
  return `
    Generate an encouraging and motivational welcome message for a user of a practice tracking app.
    
    User information:
    ${firstName ? `- First name: ${firstName}` : ''}
    - Active goals: ${activeGoals.length}
    - Completed goals: ${completedGoals.length}
    - Goals due soon: ${dueSoonGoals.length}
    - Goals out of cadence: ${outOfCadenceGoals.length}
    
    ${dueSoonGoals.length > 0 ? `Goals due soon: ${dueSoonGoals.map(g => g.name).join(', ')}` : ''}
    ${outOfCadenceGoals.length > 0 ? `Goals that need attention: ${outOfCadenceGoals.map(g => g.name).join(', ')}` : ''}
    
    ${outOfCadenceGoals.length > 0 ? 'Please emphasize the importance of keeping up with practice frequency for the goals that need attention.' : ''}
    
    The message should be positive, encouraging, and motivate the user to continue practicing.
    Keep it concise (max 2-3 sentences) and personalized based on their progress.
    ${firstName ? `Address the user by their first name (${firstName}).` : ''}
  `;
};
