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
  // Pull-to-refresh state
  const [pullStartY, setPullStartY] = useState<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshThreshold = 60; // px

  useEffect(() => {
    let touchMove = false;
    function onTouchStart(e: TouchEvent) {
      if (window.scrollY === 0 && e.touches.length === 1) {
        setPullStartY(e.touches[0].clientY);
        setPullDistance(0);
        touchMove = true;
      }
    }
    function onTouchMove(e: TouchEvent) {
      if (pullStartY !== null && touchMove) {
        const distance = e.touches[0].clientY - pullStartY;
        if (distance > 0) {
          setPullDistance(distance);
        }
      }
    }
    function onTouchEnd() {
      if (pullDistance > refreshThreshold && !isRefreshing) {
        setIsRefreshing(true);
        setTimeout(() => {
          window.location.reload();
        }, 150);
      } else {
        setPullDistance(0);
        setPullStartY(null);
        setIsRefreshing(false);
      }
      touchMove = false;
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [pullStartY, pullDistance, isRefreshing]);
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
              {/* Pull-to-refresh indicator */}
              {pullDistance > 0 && (
                <div style={{
                  height: pullDistance > 80 ? 80 : pullDistance,
                  transition: isRefreshing ? 'height 0.2s' : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  fontWeight: 600,
                  fontSize: 16,
                  position: 'sticky',
                  top: 0,
                  zIndex: 1000,
                  width: '100%',
                }}>
                  {isRefreshing ? 'Refreshing…' : pullDistance > refreshThreshold ? 'Release to refresh' : 'Pull down to refresh'}
                </div>
              )}
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
