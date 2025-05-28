import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  supabase, 
  getCurrentUser, 
  signIn as supabaseSignIn, 
  signUp as supabaseSignUp, 
  signOut as supabaseSignOut,
  deleteAccount as supabaseDeleteAccount 
} from '../services/supabase';
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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  setUser: () => {},
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  deleteAccount: async () => ({ success: false, message: 'Not implemented' })
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
      const { error } = await supabaseSignUp(email, password, firstName);
      if (error) throw error;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to sign up');
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { error } = await supabaseSignIn(email, password);
      if (error) throw error;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to sign in');
    }
  };

  const handleSignOut = async () => {
    try {
      await supabaseSignOut();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to sign out');
    }
  };
  
  const handleDeleteAccount = async (password: string) => {
    try {
      return await supabaseDeleteAccount(password);
    } catch (err) {
      console.error('Error deleting account:', err);
      throw err instanceof Error ? err : new Error('Failed to delete account');
    }
  };

  useEffect(() => {
    // Fetch the current user on mount
    const fetchUser = async () => {
      try {
        const { data } = await getCurrentUser();
        if (data.user) {
          const userData: User = {
            id: data.user.id,
            email: data.user.email || '',
            user_metadata: data.user.user_metadata
          };
          setUser(userData);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            user_metadata: session.user.user_metadata
          };
          setUser(userData);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // Clean up the subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      setUser,
      signUp: handleSignUp,
      signIn: handleSignIn,
      signOut: handleSignOut,
      deleteAccount: handleDeleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};
