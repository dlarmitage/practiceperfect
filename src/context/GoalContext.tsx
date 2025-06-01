import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  getGoals, 
  createGoal as createGoalService, 
  updateGoal as updateGoalService,
  updateGoalSortOrder as updateGoalSortOrderService,
  incrementGoalCount as incrementGoalService,
  deleteGoal as deleteGoalService
} from '../services/supabase';
import { useAuth } from './AuthContext';
import type { Goal } from '../types';

export type SortMethod = 'newest' | 'oldest' | 'custom';

// Define the GoalContextType interface
interface GoalContextType {
  goals: Goal[];
  loading: boolean;
  error: Error | null;
  createGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Goal>;
  updateGoal: (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt' | 'user_id'>>) => Promise<Goal>;
  incrementGoalCount: (id: string) => Promise<Goal>;
  decrementGoalCount: (id: string) => Promise<Goal>;
  deleteGoal: (id: string) => Promise<boolean>;
  showInactive: boolean;
  setShowInactive: (show: boolean) => void;
  sortMethod: SortMethod;
  setSortMethod: (method: SortMethod) => void;
  updateGoalOrder: (goalId: string, newOrder: number) => Promise<void>;
  fetchGoals: (showLoadingIndicator?: boolean) => Promise<void>;
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
  decrementGoalCount: async () => {
    throw new Error('Not implemented');
  },
  deleteGoal: async () => {
    throw new Error('Not implemented');
  },
  showInactive: false,
  setShowInactive: () => {},
  sortMethod: 'newest',
  setSortMethod: () => {},
  updateGoalOrder: async () => {
    throw new Error('Not implemented');
  },
  fetchGoals: async () => {
    throw new Error('Not implemented');
  }
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
  const [sortMethod, setSortMethod] = useState<SortMethod>('newest');
  const { user } = useAuth();

  // Track if goals have been loaded at least once
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);

  const fetchGoals = async (showLoadingIndicator = true) => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      // Only show loading indicator if explicitly requested
      if (showLoadingIndicator) {
        setLoading(true);
      }
      
      const goalsData = await getGoals(sortMethod);
      setGoals(goalsData);
      setInitialLoadComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch goals'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Always fetch when user changes
    if (user) {
      // Show loading indicator only on initial load
      fetchGoals(!initialLoadComplete);
    } else {
      setGoals([]);
      setLoading(false);
    }
  }, [user]);
  
  // When sort method changes, fetch without showing loading indicator
  useEffect(() => {
    if (user && initialLoadComplete) {
      fetchGoals(false);
    }
  }, [sortMethod]);

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
      
      // Fetch all goals to ensure we have the latest data, but don't show loading indicator
      fetchGoals(false);
      
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
      // Find the current goal to get its data
      const currentGoal = goals.find(goal => goal.id === id);
      if (!currentGoal) {
        throw new Error('Goal not found');
      }
      
      // Create an optimistically updated version of the goal
      const optimisticGoal = {
        ...currentGoal,
        count: currentGoal.count + 1,
        updatedAt: new Date().toISOString(),
        lastClicked: new Date().toISOString()
      };
      
      // Update the UI immediately with the optimistic update
      setGoals(prevGoals => 
        prevGoals.map(goal => goal.id === id ? optimisticGoal : goal)
      );
      
      // Then perform the actual database update in the background
      const updatedGoal = await incrementGoalService(id);
      
      // Update the UI again with the actual data from the server (if needed)
      setGoals(prevGoals => 
        prevGoals.map(goal => goal.id === id ? updatedGoal : goal)
      );
      
      return updatedGoal;
    } catch (err) {
      // If there's an error, revert the optimistic update
      const currentGoal = goals.find(goal => goal.id === id);
      if (currentGoal) {
        setGoals(prevGoals => 
          prevGoals.map(goal => goal.id === id ? currentGoal : goal)
        );
      }
      
      const error = err instanceof Error ? err : new Error('Failed to increment goal count');
      console.error('Error incrementing goal count:', error);
      setError(error);
      throw error;
    }
  };
  
  const decrementGoalCount = async (id: string): Promise<Goal> => {
    try {
      // Find the current goal to get its data
      const currentGoal = goals.find(goal => goal.id === id);
      if (!currentGoal) {
        throw new Error('Goal not found');
      }
      
      // Don't allow negative counts
      if (currentGoal.count <= 0) {
        return currentGoal;
      }
      
      // Create an optimistically updated version of the goal
      const optimisticGoal = {
        ...currentGoal,
        count: Math.max(0, currentGoal.count - 1), // Ensure count doesn't go below 0
        updatedAt: new Date().toISOString(),
        lastClicked: new Date().toISOString()
      };
      
      // Update the UI immediately with the optimistic update
      setGoals(prevGoals => 
        prevGoals.map(goal => goal.id === id ? optimisticGoal : goal)
      );
      
      // Then perform the actual database update in the background
      // We'll need to implement this service function
      const updatedGoal = await updateGoal(id, { count: optimisticGoal.count });
      
      // Update the UI again with the actual data from the server (if needed)
      setGoals(prevGoals => 
        prevGoals.map(goal => goal.id === id ? updatedGoal : goal)
      );
      
      return updatedGoal;
    } catch (err) {
      // If there's an error, revert the optimistic update
      const currentGoal = goals.find(goal => goal.id === id);
      if (currentGoal) {
        setGoals(prevGoals => 
          prevGoals.map(goal => goal.id === id ? currentGoal : goal)
        );
      }
      
      const error = err instanceof Error ? err : new Error('Failed to decrement goal count');
      console.error('Error decrementing goal count:', error);
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
        
        // Also fetch goals to ensure our state is in sync with the database, but don't show loading indicator
        try {
          await fetchGoals(false);
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

  // Function to update goal order
  const updateGoalOrder = async (goalId: string, newOrder: number): Promise<void> => {
    try {
      console.log('GoalContext: updateGoalOrder called with:', { goalId, newOrder });
      
      // Use the special updateGoalSortOrder function that preserves timestamps
      await updateGoalSortOrderService(goalId, newOrder);
      
      // Refresh goals after updating order, but don't show loading indicator
      fetchGoals(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update goal order');
      console.error('Error updating goal order:', err);
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
        decrementGoalCount,
        deleteGoal,
        showInactive,
        setShowInactive,
        sortMethod,
        setSortMethod,
        updateGoalOrder,
        fetchGoals
      }}
    >
      {children}
    </GoalContext.Provider>
  );
};
