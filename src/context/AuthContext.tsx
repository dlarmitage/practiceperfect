import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  signIn as apiSignIn,
  signUp as apiSignUp,
  signOut as apiSignOut,
  getCurrentUser as apiGetCurrentUser
} from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  setUser: (user: User | null) => void;
  signUp?: (email: string, password: string, firstName: string) => Promise<void>;
  signIn?: (email: string, password: string) => Promise<void>;
  signOut?: () => Promise<void>;
  deleteAccount?: (password: string) => Promise<{ success: boolean; message: string }>;
  refreshUser?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  setUser: () => { },
  signUp: async () => { },
  signIn: async () => { },
  signOut: async () => { },
  deleteAccount: async () => ({ success: false, message: 'Not implemented' }),
  refreshUser: async () => { },
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Implement authentication functions
  const handleSignUp = async (email: string, password: string, firstName: string) => {
    try {
      const { data, error } = await apiSignUp(email, password, firstName);
      if (error) throw error;
      setUser(data.user);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to sign up');
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { data, error } = await apiSignIn(email, password);
      if (error) throw error;
      setUser(data.user);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to sign in');
    }
  };

  const handleSignOut = async () => {
    try {
      await apiSignOut();
      setUser(null);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to sign out');
    }
  };

  // Delete account not fully implemented in new backend yet
  const handleDeleteAccount = async (_password: string) => {
    return { success: false, message: 'Feature temporarily unavailable during migration.' };
  };

  useEffect(() => {
    // Fetch the current user on mount
    const fetchUser = async () => {
      try {
        const { data, error: _error } = await apiGetCurrentUser();
        if (data && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error in fetchUser:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Refresh user from API (used after magic link verification)
  const refreshUser = async () => {
    try {
      const { data } = await apiGetCurrentUser();
      if (data && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      setUser,
      signUp: handleSignUp,
      signIn: handleSignIn,
      signOut: handleSignOut,
      deleteAccount: handleDeleteAccount,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
