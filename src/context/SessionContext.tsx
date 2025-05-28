import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '../types';
import { getSessions, getSessionsByGoal, createSession, updateSession, deleteSession } from '../services/supabase';

interface SessionContextType {
  sessions: Session[];
  activeGoalId: string | null;
  isLoading: boolean;
  error: Error | null;
  setActiveGoalId: (goalId: string | null) => void;
  createNewSession: (sessionData: Omit<Session, 'id' | 'created_at' | 'user_id'>) => Promise<Session>;
  updateExistingSession: (id: string, updates: Partial<Omit<Session, 'id' | 'user_id' | 'goal_id' | 'created_at'>>) => Promise<Session>;
  deleteExistingSession: (id: string) => Promise<boolean>;
  fetchSessionsByGoal: (goalId: string) => Promise<void>;
  fetchAllSessions: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  
  // Initial data load when component mounts
  useEffect(() => {
    const initialLoad = async () => {
      console.log('SessionContext: Initial data load');
      setIsLoading(true);
      try {
        const data = await getSessions();
        console.log('SessionContext: Initial sessions loaded:', data?.length || 0);
        setSessions(data || []);
      } catch (err) {
        console.error('SessionContext: Error during initial load:', err);
        setError(err instanceof Error ? err : new Error('Failed to load initial sessions'));
      } finally {
        setIsLoading(false);
        setInitialized(true);
      }
    };
    
    initialLoad();
  }, []);
  
  // Handle activeGoalId changes after initialization
  useEffect(() => {
    // Skip if not initialized or during initial render
    if (!initialized) return;
    
    console.log('SessionContext: activeGoalId changed to:', activeGoalId);
    
    if (activeGoalId) {
      fetchSessionsByGoal(activeGoalId);
    } else {
      fetchAllSessions();
    }
  }, [activeGoalId, initialized]);

  const fetchSessionsByGoal = async (goalId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSessionsByGoal(goalId);
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching sessions by goal:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch sessions'));
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllSessions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching all sessions...');
      const data = await getSessions();
      console.log('Sessions data received:', data);
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching all sessions:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch sessions'));
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSession = async (sessionData: Omit<Session, 'id' | 'created_at' | 'user_id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newSession = await createSession(sessionData);
      setSessions(prev => [newSession, ...prev]);
      return newSession;
    } catch (err) {
      console.error('Error creating session:', err);
      setError(err instanceof Error ? err : new Error('Failed to create session'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExistingSession = async (id: string, updates: Partial<Omit<Session, 'id' | 'user_id' | 'goal_id' | 'created_at'>>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedSession = await updateSession(id, updates);
      setSessions(prev => prev.map(session => 
        session.id === id ? updatedSession : session
      ));
      return updatedSession;
    } catch (err) {
      console.error('Error updating session:', err);
      setError(err instanceof Error ? err : new Error('Failed to update session'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExistingSession = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteSession(id);
      setSessions(prev => prev.filter(session => session.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting session:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete session'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    sessions,
    activeGoalId,
    isLoading,
    error,
    setActiveGoalId,
    createNewSession,
    updateExistingSession,
    deleteExistingSession,
    fetchSessionsByGoal,
    fetchAllSessions
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionContext;
