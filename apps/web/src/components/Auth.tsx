import React, { useState } from 'react';
import { BookOpen, Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

type AuthView = 'signin' | 'signup' | 'forgot-password' | 'reset-sent';

interface AuthProps {
  onNavigate: (view: string) => void;
  onBack: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onNavigate, onBack }) => {
  const [currentView, setCurrentView] = useState<AuthView>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState('');

  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = currentView === 'signup' 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        setError(error.message);
      } else {
        setCurrentView('reset-sent');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderForgotPassword = () => (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-primary-bg">
      <div className="text-center mb-6">
        <button
          onClick={() => setCurrentView('signin')}
          className="flex items-center text-primary-text hover:text-primary-highlight transition-colors duration-200 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign In
        </button>
        <h2 className="text-2xl font-semibold text-primary-navy mb-2">
          Reset Password
        </h2>
        <p className="text-primary-text/80">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      <form onSubmit={handleForgotPassword} className="space-y-6">
        <div>
          <label htmlFor="reset-email" className="block text-sm font-medium text-primary-text mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-text/50 h-5 w-5" />
            <input
              type="email"
              id="reset-email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-primary-bg rounded-lg focus:ring-2 focus:ring-primary-highlight focus:border-primary-highlight transition-all duration-200 bg-primary-cream/30 text-primary-text placeholder-primary-text/50"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !resetEmail.trim()}
          className="w-full bg-primary-highlight text-white py-3 rounded-lg font-medium hover:bg-primary-highlight/90 focus:outline-none focus:ring-2 focus:ring-primary-highlight disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Mail className="h-5 w-5 mr-2" />
              Send Reset Link
            </>
          )}
        </button>
      </form>
    </div>
  );

  const renderResetSent = () => (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-primary-bg">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-primary-navy mb-2">
          Check Your Email
        </h2>
        <p className="text-primary-text/80 mb-6">
          We've sent a password reset link to <strong>{resetEmail}</strong>
        </p>
        <div className="bg-primary-cream/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-primary-text/70">
            Didn't receive the email? Check your spam folder or try again in a few minutes.
          </p>
        </div>
        <button
          onClick={() => {
            setCurrentView('signin');
            setResetEmail('');
            setError(null);
          }}
          className="text-primary-navy font-medium hover:text-primary-highlight transition-colors duration-200"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );

  const renderMainAuth = () => (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-primary-bg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-primary-navy mb-2">
          {currentView === 'signup' ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-primary-text/80">
          {currentView === 'signup' 
            ? 'Start your learning journey today' 
            : 'Continue your vocabulary mastery'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-primary-text mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-text/50 h-5 w-5" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-primary-bg rounded-lg focus:ring-2 focus:ring-primary-highlight focus:border-primary-highlight transition-all duration-200 bg-primary-cream/30 text-primary-text placeholder-primary-text/50"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-primary-text mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-text/50 h-5 w-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-primary-bg rounded-lg focus:ring-2 focus:ring-primary-highlight focus:border-primary-highlight transition-all duration-200 bg-primary-cream/30 text-primary-text placeholder-primary-text/50"
              placeholder="Enter your password"
              required
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

        {currentView === 'signin' && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => setCurrentView('forgot-password')}
              className="text-sm text-primary-navy hover:text-primary-highlight transition-colors duration-200"
            >
              Forgot your password?
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-highlight text-white py-3 rounded-lg font-medium hover:bg-primary-highlight/90 focus:outline-none focus:ring-2 focus:ring-primary-highlight disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <User className="h-5 w-5 mr-2" />
              {currentView === 'signup' ? 'Create Account' : 'Sign In'}
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-primary-text/80">
          {currentView === 'signup' ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => {
              setCurrentView(currentView === 'signup' ? 'signin' : 'signup');
              setError(null);
            }}
            className="ml-2 text-primary-navy font-medium hover:text-primary-highlight transition-colors duration-200"
          >
            {currentView === 'signup' ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="relative z-50 bg-white/80 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-primary-highlight transition-colors duration-200 p-2 rounded-lg hover:bg-white/50"
                title="Back to Landing Page"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                onClick={onBack}
                className="flex items-center hover:opacity-80 transition-opacity duration-200"
              >
                <img src="/logo-horizontal.png" alt="LearnDeck Logo" className="h-16" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('about')}
                className="text-gray-600 hover:text-primary-highlight transition-colors duration-200"
              >
                About
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Content */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <img src="/logo-horizontal.png" alt="LearnDeck Logo" className="h-20 mx-auto mb-6" />
            <p className="text-primary-text">
              Master vocabulary with intelligent spaced repetition
            </p>
          </div>

          {currentView === 'forgot-password' && renderForgotPassword()}
          {currentView === 'reset-sent' && renderResetSent()}
          {(currentView === 'signin' || currentView === 'signup') && renderMainAuth()}
        </div>
      </div>
    </div>
  );
};