import React, { useState, useEffect } from 'react';
import { BookOpen, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  const { updatePassword, user } = useAuth();

  useEffect(() => {
    // Check if user is authenticated (came from reset link)
    if (user) {
      setIsValidSession(true);
    } else {
      // Check URL for session tokens
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        setIsValidSession(true);
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(password);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect to app after successful password reset
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-navy rounded-full mb-4">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-primary-navy mb-2">LearnDeck</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-primary-bg text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold text-primary-navy mb-2">Invalid Reset Link</h2>
            <p className="text-primary-text/80 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-primary-highlight text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-highlight/90 transition-all duration-200"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-navy rounded-full mb-4">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-primary-navy mb-2">LearnDeck</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-primary-bg text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-primary-navy mb-2">Password Updated!</h2>
            <p className="text-primary-text/80 mb-6">
              Your password has been successfully updated. You'll be redirected to the app shortly.
            </p>
            <div className="w-8 h-8 border-2 border-primary-highlight border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-navy rounded-full mb-4">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-primary-navy mb-2">LearnDeck</h1>
          <p className="text-primary-text">Set your new password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-primary-bg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-primary-navy mb-2">Reset Password</h2>
            <p className="text-primary-text/80">Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-text mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-text/50 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-primary-bg rounded-lg focus:ring-2 focus:ring-primary-highlight focus:border-primary-highlight transition-all duration-200 bg-primary-cream/30 text-primary-text placeholder-primary-text/50"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-text/50 hover:text-primary-text transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-text mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-text/50 h-5 w-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-primary-bg rounded-lg focus:ring-2 focus:ring-primary-highlight focus:border-primary-highlight transition-all duration-200 bg-primary-cream/30 text-primary-text placeholder-primary-text/50"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-text/50 hover:text-primary-text transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full bg-primary-highlight text-white py-3 rounded-lg font-medium hover:bg-primary-highlight/90 focus:outline-none focus:ring-2 focus:ring-primary-highlight disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="h-5 w-5 mr-2" />
                  Update Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};