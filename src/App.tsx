import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { GoalProvider } from './context/GoalContext';
import UpdateNotification from './components/UpdateNotification';
import { SessionProvider } from './context/SessionContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import LandingPage from './pages/LandingPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import TailwindDemo from './pages/TailwindDemo';
import LandingPageMockup from './pages/LandingPageMockup';

// Import the AuthenticatedRoutes component
import AuthenticatedRoutes from './components/AuthenticatedRoutes';

// Import the RootRedirect component for handling authentication at root route
import RootRedirect from './components/RootRedirect';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Check for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if the app is running as a PWA
    // This helps with proper routing for installed PWA users
    const checkIfPWA = () => {
      // iOS detection - need to use type assertion for standalone property
      const isIOSPWA = (window.navigator as any).standalone === true;
      
      // Android/Chrome detection
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Set PWA status
      setIsPWA(isIOSPWA || isStandalone);
      
      console.log('App is running as PWA:', isIOSPWA || isStandalone);
    };
    
    checkIfPWA();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Router>
      {!isOnline && (
        <div className="bg-yellow-500 text-white p-2 text-center">
          You are currently offline. Some features may be limited.
        </div>
      )}
      <AuthProvider>
        <GoalProvider>
          <SessionProvider>
            <div className="flex flex-col min-h-screen">
              <UpdateNotification />
              <Routes>
                {/* Root route with smart redirection */}
                <Route path="/" element={<RootRedirect isPWA={isPWA} landingPage={<LandingPage />} />} />
                
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/tailwind" element={<TailwindDemo />} />
                <Route path="/mockup" element={<LandingPageMockup />} />
                
                {/* Protected routes */}
                <Route path="/home" element={<AuthenticatedRoutes />} />
                <Route path="/sessions" element={<AuthenticatedRoutes />} />
                <Route path="/analysis" element={<AuthenticatedRoutes />} />
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </SessionProvider>
        </GoalProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
