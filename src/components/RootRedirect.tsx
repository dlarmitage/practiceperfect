import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Component that handles redirection at the root route
 * If user is authenticated, redirects to home
 * If not authenticated, shows the landing page
 */
interface RootRedirectProps {
  isPWA: boolean;
  landingPage: React.ReactNode;
}

const RootRedirect: React.FC<RootRedirectProps> = ({ isPWA, landingPage }) => {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Log authentication state for debugging
    if (!loading) {
      
    }
  }, [user, loading, isPWA]);

  // While auth is loading, don't redirect yet
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading your account...</span>
      </div>
    );
  }

  // If user is authenticated, redirect to home
  // This is especially important for PWA users who should go straight to their content
  if (user) {
    
    return <Navigate to="/home" replace />;
  }

  // If not authenticated, show the landing page
  return <>{landingPage}</>;
};

export default RootRedirect;
