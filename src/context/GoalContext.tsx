import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  getGoals, 
  createGoal as createGoalService, 
  updateGoal as updateGoalService,
  incrementGoalCount as incrementGoalService,
  deleteGoal as deleteGoalService
} from '../services/supabase';
import { useAuth } from './AuthContext';
import type { Goal } from '../types';

// Define the GoalContextType interface
interface GoalContextType {
  goals: Goal[];
  loading: boolean;
  error: Error | null;
  createGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Goal>;
  updateGoal: (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt' | 'user_id'>>) => Promise<Goal>;
  incrementGoalCount: (id: string) => Promise<Goal>;
  deleteGoal: (id: string) => Promise<boolean>;
  showInactive: boolean;
  setShowInactive: (show: boolean) => void;
}

const GoalContext = createContext<GoalContextType>({
  goals: [],
  loading: true,
  error: null,
  createGoal: async () => {
    throw new Error('Not implemented');
  },
  updateGoal: async () => {
    throw new Error('Not implemented');
  },
  incrementGoalCount: async () => {
    throw new Error('Not implemented');
  },
  deleteGoal: async () => {
    throw new Error('Not implemented');
  },
  showInactive: false,
  setShowInactive: () => {}
});

export const useGoals = () => useContext(GoalContext);

interface GoalProviderProps {
  children: ReactNode;
}

export const GoalProvider: React.FC<GoalProviderProps> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const { user } = useAuth();

  const fetchGoals = async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const goalsData = await getGoals();
      setGoals(goalsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch goals'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const createGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> => {
    try {
      // Create the goal using the service
      const newGoal = await createGoalService(goal);
      
      // Update the local state with the new goal
      setGoals(prevGoals => {
        // Make sure we don't add duplicates
        const exists = prevGoals.some(g => g.id === newGoal.id);
        if (exists) {
          return prevGoals.map(g => g.id === newGoal.id ? newGoal : g);
        } else {
          return [...prevGoals, newGoal];
        }
      });
      
      // Fetch all goals to ensure we have the latest data
      fetchGoals();
      
      return newGoal;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create goal');
      console.error('Error creating goal:', err);
      setError(error);
      throw error;
    }
  };

  const updateGoal = async (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt' | 'user_id'>>): Promise<Goal> => {
    try {
      const updatedGoal = await updateGoalService(id, updates);
      setGoals(prevGoals => 
        prevGoals.map(goal => goal.id === id ? updatedGoal : goal)
      );
      return updatedGoal;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update goal');
      console.error('Error updating goal:', err);
      setError(error);
      throw error;
    }
  };

  const incrementGoalCount = async (id: string): Promise<Goal> => {
    try {
      const updatedGoal = await incrementGoalService(id);
      setGoals(prevGoals => 
        prevGoals.map(goal => goal.id === id ? updatedGoal : goal)
      );
      return updatedGoal;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to increment goal count');
      setError(error);
      throw error;
    }
  };

  const deleteGoal = async (id: string): Promise<boolean> => {
    try {
      console.log(`GoalContext: Attempting to delete goal with ID: ${id}`);
      const result = await deleteGoalService(id);
      
      if (result) {
        console.log(`GoalContext: Goal deleted successfully, updating state`);
        // Update the local state by filtering out the deleted goal
        setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
        
        // Also fetch goals to ensure our state is in sync with the database
        try {
          await fetchGoals();
          console.log('GoalContext: Goals refreshed after deletion');
        } catch (fetchErr) {
          console.warn('GoalContext: Failed to refresh goals after deletion', fetchErr);
          // Continue with the deletion process even if refresh fails
        }
        
        return true;
      } else {
        throw new Error('Goal deletion returned false');
      }
    } catch (err) {
      console.error('GoalContext: Error deleting goal:', err);
      const error = err instanceof Error ? err : new Error('Failed to delete goal');
      setError(error);
      throw error;
    }
  };

  return (
    <GoalContext.Provider 
      value={{ 
        goals, 
        loading, 
        error, 
        createGoal, 
        updateGoal, 
        incrementGoalCount, 
        deleteGoal,
        showInactive,
        setShowInactive
      }}
    >
      {children}
    </GoalContext.Provider>
  );
};
