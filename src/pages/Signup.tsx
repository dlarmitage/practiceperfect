import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import { useAuth } from '../context/AuthContext';

/**
 * Signup page component
 */
const Signup: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (signUp) {
        await signUp(email, password, firstName);
        setSuccess(true);
      } else {
        throw new Error('Authentication service not available');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
          <div className="flex justify-center mb-6">
            <Link to="/">
              <img src="/Logo.webp" alt="PracticePerfect Logo" className="h-12 cursor-pointer" />
            </Link>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Check your email</h2>
          <p className="text-center text-gray-600 mb-4">
            We've sent you a confirmation email. Please check your inbox and follow the instructions to complete your registration.
          </p>
          
          {/* PWA Installation Prompt */}
          <PWAInstallPrompt />
          
          <div className="mt-6">
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-center mb-4">
          <Link to="/">
            <img src="/Logo.webp" alt="PracticePerfect Logo" className="h-10 cursor-pointer" />
          </Link>
        </div>
        <h2 className="text-xl font-bold text-center text-gray-900 mb-1">Create your account</h2>
        <p className="text-center text-gray-600 text-sm mb-4">
          Start tracking your practice goals today
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-2 rounded">
              <p className="text-red-700 text-xs">{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="first-name" className="block text-xs font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                id="first-name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="First name"
              />
            </div>
            
            <div>
              <label htmlFor="email-address" className="block text-xs font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Email"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
          
          <div className="text-center">
            <p className="text-xs text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
