import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

/**
 * Login page component - Magic Link + OTP version
 */
const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  // const { refreshUser } = useAuth(); // Commented out as currently unused

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send magic link');
      }

      setShowOtp(true);
      // Determine if we need to focus the first input
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.every(char => /^\d$/.test(char))) {
      const newOtp = [...otp];
      pastedData.forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);
      // Blur to simulate completion or focus last filled
      otpRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      // Successful login
      navigate('/home');
      // Force a refresh of the auth state if needed, though navigation usually triggers re-check
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
      setLoading(false);
    }
  };

  if (showOtp) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-800 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
              {/* Initials or Logo Icon */}
              P
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-600 mb-8">
            We sent a magic link to {email}
          </p>

          <div className="bg-emerald-50 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Click the link in your email, or enter the 6-digit code below.
          </p>

          <p className="text-sm font-semibold text-gray-700 mb-4">Verification Code</p>

          <form onSubmit={handleOtpSubmit}>
            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-14 text-center text-2xl border border-gray-300 rounded-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors bg-gray-50"
                  inputMode="numeric"
                />
              ))}
            </div>

            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-3 px-4 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>

          <button
            onClick={handleEmailSubmit}
            disabled={loading}
            className="text-sm text-emerald-700 font-medium mb-2 hover:text-emerald-800 hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Resend code'}
          </button>
          <button
            onClick={() => setShowOtp(false)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Use a different email
          </button>
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
        <h2 className="text-xl font-bold text-center text-gray-900 mb-1">Sign in to PracticePerfect</h2>
        <p className="text-center text-gray-600 text-sm mb-4">
          Enter your email and we'll send you a magic link
        </p>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-2 rounded">
              <p className="text-red-700 text-xs">{error}</p>
            </div>
          )}

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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
