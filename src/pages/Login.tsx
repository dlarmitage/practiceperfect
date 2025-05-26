import React, { useState } from 'react';
import { signIn } from '../services/supabase';
import { useNavigate, Link } from 'react-router-dom';

/**
 * Login page component
 */
const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/Logo.webp" alt="PracticePerfect Logo" />
        </div>
        <h2 className="auth-title">Sign in to your account</h2>
        <p className="auth-subtitle">
          Track your practice goals and improve your skills
        </p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              <p>{error}</p>
            </div>
          )}
          
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
            <div className="auth-label-row">
              <label htmlFor="password" className="auth-label">
                Password
              </label>
              <Link to="/forgot-password" className="auth-text-link auth-forgot-link">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          
          <div className="auth-links">
            <p className="auth-link-text">
              Don't have an account?{' '}
              <Link to="/signup" className="auth-text-link">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
