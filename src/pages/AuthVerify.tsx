import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Auth verification page - handles magic link callback
 */
const AuthVerify: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const verifyToken = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setStatus('error');
                setError('No verification token provided');
                return;
            }

            try {
                const res = await fetch(`/api/auth/verify?token=${token}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Verification failed');
                }

                // Store token for persistence on iOS
                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                }

                // Refresh the auth context
                if (refreshUser) {
                    await refreshUser();
                }

                setStatus('success');

                // Redirect to home after a short delay
                setTimeout(() => {
                    navigate('/home');
                }, 1500);

            } catch (err) {
                setStatus('error');
                setError(err instanceof Error ? err.message : 'Verification failed');
            }
        };

        verifyToken();
    }, [searchParams, navigate, refreshUser]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 text-center">
                <div className="flex justify-center mb-4">
                    <img src="/Logo.webp" alt="PracticePerfect Logo" className="h-10" />
                </div>

                {status === 'loading' && (
                    <div>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Verifying your sign-in link...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <svg className="w-12 h-12 mx-auto text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <h2 className="text-lg font-semibold text-green-800 mb-1">You're signed in!</h2>
                        <p className="text-green-700 text-sm">Redirecting you to your goals...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <svg className="w-12 h-12 mx-auto text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <h2 className="text-lg font-semibold text-red-800 mb-1">Verification Failed</h2>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                        <Link
                            to="/login"
                            className="text-blue-600 hover:underline text-sm"
                        >
                            Try signing in again
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthVerify;
