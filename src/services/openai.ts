import OpenAI from 'openai';
import type { Goal } from '../types';
import { calculateGoalStatus } from '../utils/goalUtils';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For client-side usage
});

/**
 * Generates a welcoming message based on the user's goals and name
 * 
 * @param goals - The user's goals
 * @param firstName - The user's first name (optional)
 * @returns A welcoming message
 */
export const generateWelcomeMessage = async (goals: Goal[], firstName?: string): Promise<string> => {
  if (goals.length === 0) {
    return firstName 
      ? `Welcome to PracticePerfect, ${firstName}! Create your first goal to start tracking your practice sessions.`
      : "Welcome to PracticePerfect! Create your first goal to start tracking your practice sessions.";
  }

  // Calculate status for each active goal
  
  // Count goals by status
  const activeGoals = goals.filter(goal => goal.isActive);
  
  // Calculate status for each goal
  const goalStatuses = activeGoals.map(goal => ({
    goal,
    status: calculateGoalStatus(goal)
  }));
  
  // Find goals that are out of cadence
  const outOfCadenceGoals = goalStatuses
    .filter(item => item.status === 'out-of-cadence')
    .map(item => item.goal);
    
  const completedGoals = goals.filter(goal => !goal.isActive && goal.dueDate && new Date(goal.dueDate) < new Date());
  
  // Find goals that are due soon (within the next 3 days)
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  
  const dueSoonGoals = activeGoals.filter(goal => 
    goal.dueDate && 
    new Date(goal.dueDate) <= threeDaysFromNow && 
    new Date(goal.dueDate) >= new Date()
  );

  // Create a prompt for OpenAI
  const prompt = `
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

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a motivational coach helping users achieve their practice goals." },
        { role: "user", content: prompt }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 
      "Welcome back to PracticePerfect! Keep up the great work with your practice sessions.";
  } catch (error) {
    console.error("Error generating welcome message:", error);
    return "Welcome back to PracticePerfect! Keep up the great work with your practice sessions.";
  }
};
