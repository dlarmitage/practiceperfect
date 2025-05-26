import React, { useState } from 'react';
import { resetPassword } from '../services/supabase';
import { Link } from 'react-router-dom';

/**
 * Forgot Password page component
 */
const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
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
            We've sent password reset instructions to your email.
          </p>
          <div className="auth-actions">
            <Link to="/login" className="auth-link-button">
              Back to Sign In
            </Link>
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
        <h2 className="auth-title">Reset your password</h2>
        <p className="auth-subtitle">
          Enter your email address and we'll send you instructions to reset your password.
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

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Sending...' : 'Send reset instructions'}
          </button>
          
          <div className="auth-links">
            <Link to="/login" className="auth-text-link">
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
