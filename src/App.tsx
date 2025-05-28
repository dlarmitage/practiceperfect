import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { GoalProvider } from './context/GoalContext';
import { SessionProvider } from './context/SessionContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import LandingPage from './pages/LandingPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import TailwindDemo from './pages/TailwindDemo';
import { isRunningAsPWA } from './utils/deviceDetection';

// PWA registration will be implemented after setting up the proper dependencies

// Import the AuthenticatedRoutes component
import AuthenticatedRoutes from './components/AuthenticatedRoutes';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Check for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if app is running as PWA
    setIsPWA(isRunningAsPWA());

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
              <Routes>
                {/* Public routes */}
                <Route path="/" element={isPWA ? <Navigate to="/home" /> : <LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/tailwind" element={<TailwindDemo />} />
                
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
