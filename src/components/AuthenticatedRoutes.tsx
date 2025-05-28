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
  const { user } = useAuth();
  const location = useLocation();

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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <img src="/Logo.webp" alt="PracticePerfect Logo" className="h-10" />
          <Avatar size="md" />
        </div>
      </header>
      <div className="flex-grow">
        {renderComponent()}
      </div>
      <BottomNavigation />
    </>
  );
};

export default AuthenticatedRoutes;
