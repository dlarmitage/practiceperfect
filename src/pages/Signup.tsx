import React, { useState } from 'react';
import { signUp } from '../services/supabase';
import { useNavigate, Link } from 'react-router-dom';

/**
 * Signup page component
 */
const Signup: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password, firstName);
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <img src="/Logo.webp" alt="PracticePerfect Logo" />
          </div>
          <h2 className="auth-title">Check your email</h2>
          <p className="auth-subtitle">
            We've sent you a confirmation email. Please check your inbox and follow the instructions to complete your registration.
          </p>
          <div className="auth-actions">
            <button
              onClick={() => navigate('/login')}
              className="auth-button"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/Logo.webp" alt="PracticePerfect Logo" />
        </div>
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">
          Start tracking your practice goals today
        </p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              <p>{error}</p>
            </div>
          )}
          
          <div className="auth-field">
            <label htmlFor="first-name" className="auth-label">
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
              className="auth-input"
              placeholder="Enter your first name"
            />
          </div>
          
          <div className="auth-field">
            <label htmlFor="email-address" className="auth-label">
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
              className="auth-input"
              placeholder="Enter your email"
            />
          </div>
          
          <div className="auth-field">
            <label htmlFor="password" className="auth-label">
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
              className="auth-input"
              placeholder="Create a password"
            />
          </div>
          
          <div className="auth-field">
            <label htmlFor="confirm-password" className="auth-label">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
          
          <div className="auth-links">
            <p className="auth-link-text">
              Already have an account?{' '}
              <Link to="/login" className="auth-text-link">
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
