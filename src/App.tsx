import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { GoalProvider } from './context/GoalContext';
import { SessionProvider } from './context/SessionContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Sessions from './pages/Sessions';
import Analysis from './pages/Analysis';
import TailwindDemo from './pages/TailwindDemo';
import BottomNavigation from './components/BottomNavigation';

// PWA registration will be implemented after setting up the proper dependencies

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Check for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

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
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/tailwind" element={<TailwindDemo />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            {/* Bottom Navigation - only show on authenticated routes */}
            <Routes>
              <Route path="/" element={<BottomNavigation />} />
              <Route path="/sessions" element={<BottomNavigation />} />
              <Route path="/analysis" element={<BottomNavigation />} />
            </Routes>
          </SessionProvider>
        </GoalProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
