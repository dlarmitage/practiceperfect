import { createClient } from '@supabase/supabase-js';
import type { Goal, Session } from '../types';
import { calculateExpectedPracticeEvents } from '../utils/goalUtils';
import type { SortMethod } from '../context/GoalContext';
import { authRateLimiter, signupRateLimiter, passwordResetRateLimiter } from '../utils/rateLimiter';

// Initialize Supabase client with extended session persistence
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Helper function to read cookies
const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

// Configure client with 365-day session persistence (increased from 60 days)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'practice-perfect-auth',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
    storage: {
      getItem: (key) => {
        try {
          // First try localStorage
          const localData = localStorage.getItem(key);
          if (localData) return localData;
          
          // If not in localStorage, try cookies (important for iOS PWA)
          const cookieData = getCookie(key);
          if (cookieData) {
            // If found in cookie but not localStorage, restore to localStorage
            try {
              localStorage.setItem(key, cookieData);
            } catch (e) {
              console.warn('Could not restore cookie data to localStorage', e);
            }
            return cookieData;
          }
          
          return null;
        } catch (error) {
          console.error('Error accessing storage:', error);
          // Fall back to cookies only
          return getCookie(key);
        }
      },
      setItem: (key, value) => {
        try {
          // Try to set in localStorage first
          localStorage.setItem(key, value);
          
          // Always set a cookie with a 365-day expiration for iOS PWA
          // This is critical for iOS PWA persistence
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 365); // Increased from 60 to 365 days
          
          // Use HttpOnly: false to ensure the cookie is accessible to JavaScript
          // Use SameSite=Lax to allow the cookie to be sent in same-site contexts
          document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;
          
          // For debugging
      
        } catch (error) {
          console.error('Error setting localStorage:', error);
          // If localStorage fails, still try to set the cookie
          try {
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 365);
            document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;
        
          } catch (cookieError) {
            console.error('Critical error: Could not save auth data to cookies:', cookieError);
          }
        }
      },
      removeItem: (key) => {
        try {
          // Remove from localStorage
          localStorage.removeItem(key);
          
          // Remove all cookies with this key by setting an expired date
          // Use multiple cookie settings to ensure all variations are removed
          document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
          document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax;`;
          document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict;`;
          document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure;`;
          
      
        } catch (error) {
          console.error('Error removing item from storage:', error);
          // Still try to remove cookies even if localStorage fails
          try {
            document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
            document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax;`;
            document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict;`;
            document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure;`;
          } catch (cookieError) {
            console.error('Error removing cookies:', cookieError);
          }
        }
      }
    }
  }
});

// Utility function to map database goal to Goal type
const mapDatabaseGoal = (data: any): Goal => ({
  id: data.id,
  user_id: data.user_id,
  name: data.name,
  description: data.description,
  count: data.count,
  targetCount: data.target_count,
  cadence: data.cadence,
  isActive: data.is_active,
  completed: data.completed ?? false,
  startDate: data.start_date,
  dueDate: data.due_date,
  link: data.link,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  lastClicked: data.last_clicked,
});

// Authentication functions
export const signUp = async (email: string, password: string, firstName: string) => {
  // Check rate limiting
  if (!signupRateLimiter.isAllowed(email)) {
    const remainingTime = signupRateLimiter.getRemainingTime(email);
    const minutes = Math.ceil(remainingTime / (1000 * 60));
    throw new Error(`Too many sign-up attempts. Please try again in ${minutes} minutes.`);
  }

  try {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: firstName,
        },
      },
    });
    
    // Reset rate limiter on successful sign up
    if (!result.error) {
      signupRateLimiter.reset(email);
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  // Check rate limiting
  if (!authRateLimiter.isAllowed(email)) {
    const remainingTime = authRateLimiter.getRemainingTime(email);
    const minutes = Math.ceil(remainingTime / (1000 * 60));
    throw new Error(`Too many sign-in attempts. Please try again in ${minutes} minutes.`);
  }

  try {
    const result = await supabase.auth.signInWithPassword({ email, password });
    
    // Reset rate limiter on successful sign in
    if (!result.error) {
      authRateLimiter.reset(email);
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
  return true;
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async () => {
  return await supabase.auth.getUser();
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string) => {
  // Check rate limiting
  if (!passwordResetRateLimiter.isAllowed(email)) {
    const remainingTime = passwordResetRateLimiter.getRemainingTime(email);
    const minutes = Math.ceil(remainingTime / (1000 * 60));
    throw new Error(`Too many password reset attempts. Please try again in ${minutes} minutes.`);
  }

  try {
    const result = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    // Reset rate limiter on successful password reset request
    if (!result.error) {
      passwordResetRateLimiter.reset(email);
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile information
 */
export const updateProfile = async ({ firstName }: { firstName: string }) => {
  const { data, error } = await supabase.auth.updateUser({
    data: { display_name: firstName }
  });
  
  if (error) {
    console.error('Error updating profile:', error.message);
    throw error;
  }
  
  return data.user;
};

/**
 * Update user email address
 */
export const updateEmail = async ({ email, password }: { email: string; password: string }) => {
  // First verify the user's password
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    throw new Error('User not authenticated');
  }
  
  // Verify password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: userData.user.email || '',
    password
  });
  
  if (signInError) {
    console.error('Password verification failed:', signInError.message);
    throw new Error('Current password is incorrect');
  }
  
  // Update email
  const { data, error } = await supabase.auth.updateUser({ email });
  
  if (error) {
    console.error('Error updating email:', error.message);
    throw error;
  }
  
  return data.user;
};

/**
 * Update user password
 */
export const updatePassword = async ({ 
  currentPassword, 
  newPassword 
}: { 
  currentPassword: string; 
  newPassword: string 
}) => {
  // First verify the user's current password
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    throw new Error('User not authenticated');
  }
  
  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: userData.user.email || '',
    password: currentPassword
  });
  
  if (signInError) {
    console.error('Password verification failed:', signInError.message);
    throw new Error('Current password is incorrect');
  }
  
  // Update password
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  
  if (error) {
    console.error('Error updating password:', error.message);
    throw error;
  }
  
  return data.user;
};

/**
 * Delete user account
 * 
 * This function handles the deletion of a user account and all associated data.
 * Since we're having issues with the Edge Function, this implementation uses a more direct approach
 * that's known to work with Supabase.
 */
export const deleteAccount = async (password: string) => {
  try {
    // Get the current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error('User not authenticated');
    }
    
    // Verify the password first to ensure user authorization
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userData.user.email || '',
      password
    });

    if (signInError) {
      console.error('Password verification failed:', signInError);
      throw new Error('Password verification failed');
    }
    

    
    // Delete all user data first
    // 1. Delete sessions
    const { error: sessionsError } = await supabase
      .from('sessions')
      .delete()
      .eq('user_id', userData.user.id);
      
    if (sessionsError) {
      console.error('Error deleting user sessions:', sessionsError);
    } else {

    }

    // 2. Delete goals
    const { error: goalsError } = await supabase
      .from('goals')
      .delete()
      .eq('user_id', userData.user.id);

    if (goalsError) {
      console.error('Error deleting user goals:', goalsError);
    } else {

    }
    
    // 3. Use the most reliable method to delete the user from auth
    try {

      
      // This is a direct method that works with Supabase
      const { error } = await supabase.rpc('delete_user');
      
      if (error) {
        console.error('Error calling delete_user RPC:', error);
        throw error;
      }
      
      
      
      return {
        success: true,
        message: 'Your account has been successfully deleted.'
      };
    } catch (authDeleteError) {
      console.error('Error deleting user from auth:', authDeleteError);
      
      // If the RPC method fails, try the standard sign out
      await supabase.auth.signOut();
  
      
      return {
        success: true,
        message: 'Your account data has been deleted and you have been signed out. For complete account removal, please contact support.'
      };
    }
  } catch (error) {
    console.error('Error in deleteAccount:', error);
    throw error;
  }
};

// Sessions CRUD operations

/**
 * Create a new session
 */
export const createSession = async (sessionData: Omit<Session, 'id' | 'created_at' | 'user_id'>) => {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      ...sessionData,
      user_id: user.data.user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    throw error;
  }

  return data as Session;
};

/**
 * Get all sessions for the authenticated user
 */
export const getSessions = async () => {
  try {
  
    const user = await supabase.auth.getUser();

    
    if (!user.data.user) {
      console.error('No authenticated user found');
      throw new Error('User not authenticated');
    }
    

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('session_date', { ascending: false });
    
    if (error) {
      console.error('Supabase error fetching sessions:', error);
      throw error;
    }
    

    return data || [];
  } catch (error) {
    console.error('Exception in getSessions:', error);
    return [];
  }
};

/**
 * Get all sessions for a specific goal
 */
export const getSessionsByGoal = async (goalId: string): Promise<Session[]> => {
  try {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('goal_id', goalId)
      .order('session_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching sessions by goal:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getSessionsByGoal:', error);
    return [];
  }
};

/**
 * Update a session
 */
export const updateSession = async (id: string, updates: Partial<Omit<Session, 'id' | 'user_id' | 'goal_id' | 'created_at'>>) => {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.data.user.id) // Security check
    .select()
    .single();

  if (error) {
    console.error('Error updating session:', error);
    throw error;
  }

  return data as Session;
};

/**
 * Delete a session
 */
export const deleteSession = async (id: string) => {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.data.user.id); // Security check

  if (error) {
    console.error('Error deleting session:', error);
    throw error;
  }

  return true;
};

// Goals CRUD operations
export const getGoals = async (sortMethod: SortMethod = 'newest'): Promise<Goal[]> => {
  // Get the current user to get their ID
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    throw new Error('User not authenticated');
  }
  
  let query = supabase
    .from('goals')
    .select('*')
    .eq('user_id', userData.user.id); // Filter by the current user's ID
    
  // Apply sorting based on the sort method
  if (sortMethod === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (sortMethod === 'oldest') {
    query = query.order('created_at', { ascending: true });
  } else if (sortMethod === 'custom') {
    query = query.order('sort_order', { ascending: true });
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }
  
  // Map database snake_case to TypeScript camelCase
  return (data || []).map(goal => ({
    id: goal.id,
    user_id: goal.user_id,
    name: goal.name,
    description: goal.description,
    count: goal.count,
    targetCount: goal.target_count,
    cadence: goal.cadence,
    isActive: goal.is_active,
    completed: goal.completed ?? false,
    startDate: goal.start_date,
    dueDate: goal.due_date,
    link: goal.link,
    createdAt: goal.created_at,
    updatedAt: goal.updated_at,
    lastClicked: goal.last_clicked,
    sortOrder: goal.sort_order || 0,
  }));
};

export const getGoalById = async (id: string): Promise<Goal> => {
  // Get the current user to get their ID
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('id', id)
    .eq('user_id', userData.user.id) // Ensure the goal belongs to the current user
    .single();
  
  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }
  
  // Map database snake_case to TypeScript camelCase
  return {
    id: data.id,
    user_id: data.user_id,
    name: data.name,
    description: data.description,
    count: data.count,
    targetCount: data.target_count,
    cadence: data.cadence,
    isActive: data.is_active,
    completed: data.completed ?? false,
    startDate: data.start_date,
    dueDate: data.due_date,
    link: data.link,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    lastClicked: data.last_clicked,
  };
};

export const createGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
  // Get the current user to get their ID
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    throw new Error('User not authenticated');
  }
  
  const now = new Date().toISOString();
  
  // Get the maximum sort_order to place new goal at the end
  const { data: maxOrderData } = await supabase
    .from('goals')
    .select('sort_order')
    .eq('user_id', userData.user.id)
    .order('sort_order', { ascending: false })
    .limit(1);
    
  const maxOrder = maxOrderData && maxOrderData.length > 0 ? (maxOrderData[0].sort_order || 0) : 0;
  
  const newGoal = {
    name: goal.name,
    description: goal.description,
    cadence: goal.cadence,
    start_date: goal.startDate,
    due_date: goal.dueDate,
    link: goal.link,
    is_active: goal.isActive,
    count: goal.count || 0,
    target_count: goal.targetCount,
    user_id: userData.user.id,
    created_at: now,
    updated_at: now,
    // No last_clicked - it should be null until the user clicks the goal
    sort_order: maxOrder + 1,
  };
  
  
  
  const { data, error } = await supabase
    .from('goals')
    .insert([newGoal])
    .select()
    .single();
  
  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }
  
  return data as Goal;
};

// Special function just for updating goal sort order without changing the updated_at timestamp
export const updateGoalSortOrder = async (id: string, newSortOrder: number): Promise<Goal> => {
  // Get the current user to get their ID
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    throw new Error('User not authenticated');
  }
  
  
  
  // First get the current goal to preserve its data
  const { data: currentGoal, error: fetchError } = await supabase
    .from('goals')
    .select('*')
    .eq('id', id)
    .eq('user_id', userData.user.id)
    .single();
    
  if (fetchError) {
    console.error('Error fetching goal:', fetchError);
    throw fetchError;
  }
  
  
  
  // Now update only the sort_order field, keeping the original updated_at and last_clicked
  const { error } = await supabase
    .from('goals')
    .update({
      sort_order: newSortOrder,
      // Explicitly set updated_at and last_clicked to their current values to prevent auto-update
      updated_at: currentGoal.updated_at,
      last_clicked: currentGoal.last_clicked // Preserve the last_clicked timestamp
    })
    .eq('id', id)
    .eq('user_id', userData.user.id);
  
  if (error) {
    console.error('Error updating goal sort order:', error);
    throw error;
  }
  
  // Fetch the updated goal
  const { data: updatedGoal, error: getError } = await supabase
    .from('goals')
    .select('*')
    .eq('id', id)
    .eq('user_id', userData.user.id)
    .single();
    
  if (getError) {
    console.error('Error fetching updated goal:', getError);
    throw getError;
  }
  
  // Map database snake_case to TypeScript camelCase
  const result: Goal = mapDatabaseGoal(updatedGoal);
  
  // Add the sort order as any to avoid TypeScript errors
  (result as any).sortOrder = updatedGoal.sort_order || 0;
  
  return result;
};

export const updateGoal = async (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt' | 'user_id'>>): Promise<Goal> => {
  // Get the current user to get their ID
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    throw new Error('User not authenticated');
  }
  
  // First convert any camelCase properties to snake_case for consistency in checking
  const normalizedUpdates: Record<string, any> = {};
  
  // Copy all properties, converting camelCase to snake_case
  if ('targetCount' in updates) normalizedUpdates.target_count = updates.targetCount;
  else if ('target_count' in updates) normalizedUpdates.target_count = updates.target_count;
  
  if ('isActive' in updates) normalizedUpdates.is_active = updates.isActive;
  else if ('is_active' in updates) normalizedUpdates.is_active = updates.is_active;
  
  if ('startDate' in updates) normalizedUpdates.start_date = updates.startDate;
  else if ('start_date' in updates) normalizedUpdates.start_date = updates.start_date;
  
  if ('dueDate' in updates) normalizedUpdates.due_date = updates.dueDate;
  else if ('due_date' in updates) normalizedUpdates.due_date = updates.due_date;
  
  if ('sortOrder' in updates) normalizedUpdates.sort_order = updates.sortOrder;
  else if ('sort_order' in updates) normalizedUpdates.sort_order = updates.sort_order;
  
  if ('lastClicked' in updates) normalizedUpdates.last_clicked = updates.lastClicked;
  else if ('last_clicked' in updates) normalizedUpdates.last_clicked = updates.last_clicked;
  
  // Track if any parameter affecting the expected count has changed
  const hasCountAffectingChanges = 
    'targetCount' in updates || 
    'target_count' in updates || 
    'startDate' in updates || 
    'start_date' in updates || 
    'dueDate' in updates || 
    'due_date' in updates || 
    'cadence' in updates;
  
  // Copy any other properties directly
  for (const key in updates) {
    if (!['targetCount', 'isActive', 'startDate', 'dueDate', 'sortOrder', 'lastClicked'].includes(key) && 
        !['target_count', 'is_active', 'start_date', 'due_date', 'sort_order', 'last_clicked'].includes(key)) {
      normalizedUpdates[key] = (updates as any)[key];
    }
  }
  
  // Check if this is only a sort order update (for drag and drop)
  const isSortOrderUpdateOnly = 
    Object.keys(normalizedUpdates).length === 1 && 
    ('sort_order' in normalizedUpdates);
  
  
  
  // Map normalized updates to database format
  const dbUpdates = { ...normalizedUpdates };
  
  // For sort order updates, we need to explicitly preserve the original timestamp
  if (isSortOrderUpdateOnly) {
    // For sort order updates, we'll explicitly keep the original timestamp
    
    
    // We'll remove any updated_at that might have been included
    if ('updated_at' in dbUpdates) {
      delete dbUpdates.updated_at;
    }
  } else {
    // For all other updates, set the timestamp to now
    dbUpdates.updated_at = new Date().toISOString();
    
  }
  
  // Field name mappings are already handled in the normalization step above
  
  // Log the final updates being sent to the database
  
  
  // Get the current goal to compare before/after
  const { data: currentGoal } = await supabase
    .from('goals')
    .select('*')
    .eq('id', id)
    .eq('user_id', userData.user.id)
    .single();
    
  
  
  // If parameters affecting the expected count have changed, recalculate the total cadence count
  if (hasCountAffectingChanges && currentGoal) {
    // Get the updated values or use current values if not being updated
    const startDate = normalizedUpdates.start_date || currentGoal.start_date;
    const dueDate = normalizedUpdates.due_date || currentGoal.due_date;
    const cadence = normalizedUpdates.cadence || currentGoal.cadence;
    const targetCount = normalizedUpdates.target_count || currentGoal.target_count;
    

    
    // We don't need to store this value in the database as it's calculated on-the-fly
    // when needed, but we calculate it for potential future use
    calculateExpectedPracticeEvents(
      startDate,
      cadence,
      targetCount,
      dueDate
    );
    

  }
  
  const { data, error } = await supabase
    .from('goals')
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', userData.user.id) // Ensure the goal belongs to the current user
    .select()
    .single();
    

  
  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }
  
  // Map the response back to the Goal type
  return mapDatabaseGoal(data);
};

export const incrementGoalCount = async (id: string): Promise<Goal> => {
  // Get the current user to get their ID
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    throw new Error('User not authenticated');
  }
  
  // First, get the current count
  const { data: currentGoal, error: fetchError } = await supabase
    .from('goals')
    .select('count')
    .eq('id', id)
    .eq('user_id', userData.user.id) // Ensure the goal belongs to the current user
    .single();
  
  if (fetchError) {
    console.error('Supabase error:', fetchError);
    throw fetchError;
  }
  
  if (!currentGoal) {
    throw new Error('Goal not found');
  }
  
  // Increment the count
  const newCount = (currentGoal.count || 0) + 1;
  const now = new Date().toISOString();
  
  // Update the count and last_clicked timestamp
  const { data, error } = await supabase
    .from('goals')
    .update({
      count: newCount,
      updated_at: now,
      last_clicked: now // Update the last_clicked timestamp
    })
    .eq('id', id)
    .eq('user_id', userData.user.id) // Ensure the goal belongs to the current user
    .select()
    .single();
  
  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }
  
  // Map the response back to the Goal type
  return mapDatabaseGoal(data);
};

export const deleteGoal = async (id: string) => {
  try {

    
    // Get the current user to get their ID
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error('User not authenticated');
    }
    

    
    // First verify the goal exists and belongs to the user
    const { data: goalData, error: fetchError } = await supabase
      .from('goals')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .single();
      
    if (fetchError) {
      console.error('Error verifying goal ownership:', fetchError);
      throw new Error(`Could not verify goal ownership: ${fetchError.message}`);
    }
    
    if (!goalData) {
      console.error('Goal not found or does not belong to user');
      throw new Error('Goal not found or does not belong to user');
    }
    
    
    
    // Now delete the goal
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userData.user.id);
    
    if (error) {
      console.error('Supabase error deleting goal:', error);
      throw error;
    }
    

    return true;
  } catch (err) {
    console.error('Error in deleteGoal function:', err);
    throw err;
  }
};
