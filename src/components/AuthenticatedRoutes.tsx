import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Home from '../pages/Home';
import Sessions from '../pages/Sessions';
import Analysis from '../pages/Analysis';
import BottomNavigation from './BottomNavigation';
import Avatar from './Avatar';

/**
 * Component that handles authenticated routes
 * Redirects to login if user is not authenticated
 */
const AuthenticatedRoutes: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  // This prevents immediate redirection to login when refreshing the page
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Only redirect to login if we're sure the user is not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Determine which component to render based on the current path
  const renderComponent = () => {
    const path = location.pathname;
    
    if (path.startsWith('/home')) {
      return <Home />;
    } else if (path.startsWith('/sessions')) {
      return <Sessions />;
    } else if (path.startsWith('/analysis')) {
      return <Analysis />;
    } else {
      return <Navigate to="/home" />;
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <img src="/Logo.webp" alt="PracticePerfect Logo" className="h-10" />
          <Avatar size="md" />
        </div>
      </header>
      <div className="flex-grow pb-16">
        {renderComponent()}
      </div>
      <BottomNavigation />
    </>
  );
};

export default AuthenticatedRoutes;
