import React, { useState } from 'react';
import { KeyRound, Mail, Shield, UserCheck } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string, user: { id: string; email: string; fullName: string }) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function Login({ onLoginSuccess, addToast }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      addToast('Welcome back! Successfully logged in.', 'success');
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      addToast(err.message || 'Invalid credentials. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@company.com');
    setPassword('admin123');
    setErrors({});
    addToast('Credentials pre-filled! Click Sign In.', 'info');
  };

  return (
    <div id="login-container" className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            StaffPortal
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Enterprise Employee Management System
          </p>
        </div>

        <form id="login-form" className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border ${
                    errors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                  } rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm`}
                  placeholder="admin@company.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border ${
                    errors.password ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                  } rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
                  <span>{errors.password}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        {/* Evaluation Seed Credentials Help Panel */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/60 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Want to evaluate with preloaded database?
          </p>
          <button
            id="login-quickfill-btn"
            onClick={handleQuickFill}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-950/80 transition-colors border border-indigo-100 dark:border-indigo-900/30 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Auto-fill Admin Account
          </button>
        </div>

      </div>
    </div>
  );
}
