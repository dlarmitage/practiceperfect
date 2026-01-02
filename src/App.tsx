import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GoalProvider } from './context/GoalContext';
import { SessionProvider } from './context/SessionContext';
import UpdateNotification from './components/UpdateNotification';
import RootRedirect from './components/RootRedirect';
import AuthenticatedRoutes from './components/AuthenticatedRoutes';

// Lazy load pages for code splitting
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Login = React.lazy(() => import('./pages/Login'));
const AuthVerify = React.lazy(() => import('./pages/AuthVerify'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));
const TailwindDemo = React.lazy(() => import('./pages/TailwindDemo'));
const LandingPageMockup = React.lazy(() => import('./pages/LandingPageMockup'));

// Loading component for lazy-loaded pages
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-gray-600">Loading...</span>
  </div>
);

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
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Check if the app is running as a PWA
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInPWA = (window.navigator as any).standalone === true;
      setIsPWA(isStandalone || isInPWA);
    };

    checkPWA();

    // Listen for changes in display mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkPWA);

    return () => mediaQuery.removeEventListener('change', checkPWA);
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
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Root route with smart redirection */}
                  <Route path="/" element={<RootRedirect isPWA={isPWA} landingPage={<LandingPage />} />} />

                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/verify" element={<AuthVerify />} />
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
              </Suspense>
            </div>
          </SessionProvider>
        </GoalProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
