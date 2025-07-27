import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Password strength validation
const validatePassword = (password: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  if (password.length < minLength) {
    errors.push(`At least ${minLength} characters`);
  }
  if (!hasUpperCase) {
    errors.push('One uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('One lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('One number');
  }
  if (!hasSpecialChar) {
    errors.push('One special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: Math.max(0, 5 - errors.length) // 0-5 scale
  };
};

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
  const { signUp } = useAuth();

  const passwordValidation = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!passwordValidation.isValid) {
      setError('Password does not meet requirements');
      setLoading(false);
      return;
    }

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

  const getStrengthColor = (strength: number) => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 1) return 'Very Weak';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-center mb-4">
            <img src="/Logo.webp" alt="PracticePerfect Logo" className="h-10" />
          </div>
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Account created successfully!</h2>
          <p className="text-center text-gray-600 text-sm mb-4">
            Please check your email to verify your account before signing in.
          </p>
          <Link 
            to="/login" 
            className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Sign In
          </Link>
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
              minLength={8}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Password"
            />
            
            {/* Password strength indicator */}
            {password && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Password strength:</span>
                  <span className={`font-medium ${passwordValidation.isValid ? 'text-green-600' : 'text-gray-600'}`}>
                    {getStrengthText(passwordValidation.strength)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${getStrengthColor(passwordValidation.strength)}`}
                    style={{ width: `${(passwordValidation.strength / 5) * 100}%` }}
                  ></div>
                </div>
                
                {/* Password requirements */}
                <div className="text-xs text-gray-600 space-y-0.5">
                  <div className="font-medium">Requirements:</div>
                  {passwordValidation.errors.map((error, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-red-500 mr-1">✗</span>
                      {error}
                    </div>
                  ))}
                  {passwordValidation.isValid && (
                    <div className="flex items-center text-green-600">
                      <span className="mr-1">✓</span>
                      All requirements met
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !passwordValidation.isValid}
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
