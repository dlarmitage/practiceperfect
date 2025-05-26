import { createClient } from '@supabase/supabase-js';
import type { Goal } from '../types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication functions
export const signUp = async (email: string, password: string, firstName?: string) => {
  return await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        display_name: firstName
      }
    }
  });
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
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
 */
export const deleteAccount = async ({ password }: { password: string }) => {
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
    throw new Error('Password is incorrect');
  }
  
  // Delete all user goals first
  const { error: deleteGoalsError } = await supabase
    .from('goals')
    .delete()
    .eq('user_id', userData.user.id);
  
  if (deleteGoalsError) {
    console.error('Error deleting user goals:', deleteGoalsError);
    throw deleteGoalsError;
  }
  
  // Delete the user account
  const { error } = await supabase.auth.admin.deleteUser(userData.user.id);
  
  if (error) {
    console.error('Error deleting account:', error.message);
    throw error;
  }
  
  return true;
};

export const getCurrentUser = async () => {
  return await supabase.auth.getUser();
};

export const resetPassword = async (email: string) => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
};

// Goals CRUD operations
export const getGoals = async (): Promise<Goal[]> => {
  // Get the current user to get their ID
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userData.user.id) // Filter by the current user's ID
    .order('created_at', { ascending: false });
  
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
    startDate: goal.start_date,
    dueDate: goal.due_date,
    link: goal.link,
    createdAt: goal.created_at,
    updatedAt: goal.updated_at,
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
    startDate: data.start_date,
    dueDate: data.due_date,
    link: data.link,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const createGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
  // Get the current user to get their ID
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    throw new Error('User not authenticated');
  }
  
  const now = new Date().toISOString();
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
  };
  
  console.log('Creating goal with data:', newGoal);
  
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

export const updateGoal = async (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt' | 'user_id'>>): Promise<Goal> => {
  // Get the current user to get their ID
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    throw new Error('User not authenticated');
  }
  
  // Map camelCase updates to snake_case for the database
  const dbUpdates: Record<string, any> = {
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  // Handle any field name mappings
  if ('targetCount' in updates) {
    dbUpdates.target_count = updates.targetCount;
    delete dbUpdates.targetCount;
  }
  if ('isActive' in updates) {
    dbUpdates.is_active = updates.isActive;
    delete dbUpdates.isActive;
  }
  if ('startDate' in updates) {
    dbUpdates.start_date = updates.startDate;
    delete dbUpdates.startDate;
  }
  if ('dueDate' in updates) {
    dbUpdates.due_date = updates.dueDate;
    delete dbUpdates.dueDate;
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
  return {
    id: data.id,
    user_id: data.user_id,
    name: data.name,
    description: data.description,
    count: data.count,
    targetCount: data.target_count,
    cadence: data.cadence,
    isActive: data.is_active,
    startDate: data.start_date,
    dueDate: data.due_date,
    link: data.link,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
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
  
  // Update the count
  const { data, error } = await supabase
    .from('goals')
    .update({
      count: newCount,
      updated_at: new Date().toISOString(),
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
  return {
    id: data.id,
    user_id: data.user_id,
    name: data.name,
    description: data.description,
    count: data.count,
    targetCount: data.target_count,
    cadence: data.cadence,
    isActive: data.is_active,
    startDate: data.start_date,
    dueDate: data.due_date,
    link: data.link,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const deleteGoal = async (id: string) => {
  try {
    console.log(`Attempting to delete goal with ID: ${id}`);
    
    // Get the current user to get their ID
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error('User not authenticated');
    }
    
    console.log(`Authenticated user ID: ${userData.user.id}`);
    
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
    
    console.log('Goal found and verified, proceeding with deletion');
    
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
    
    console.log(`Successfully deleted goal with ID: ${id}`);
    return true;
  } catch (err) {
    console.error('Error in deleteGoal function:', err);
    throw err;
  }
};
