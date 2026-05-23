import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Sparkles, Loader, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: any, token: string) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (isRegister && !name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isRegister ? '/register' : '/login';
      const payload = isRegister ? { name, email, password } : { email, password };
      
      const response = await axios.post(`${API_BASE_URL}/auth${endpoint}`, payload);
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
        }));
        
        onSuccess(response.data, response.data.token);
        
        // Reset state
        setName('');
        setEmail('');
        setPassword('');
        setShowPassword(false);
        setError('');
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 min-[300px]:p-4 overflow-x-hidden overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-3 min-[300px]:p-6 sm:p-8 overflow-hidden z-10"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-indigo-50 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-violet-50 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isRegister ? 'Create Account' : 'Welcome Back'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 active:scale-95 transition-all duration-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-semibold relative z-10"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {isRegister && (
                <div className="space-y-1.5">
                  <label htmlFor="modal-register-name" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      id="modal-register-name"
                      name="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="modal-auth-email" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    id="modal-auth-email"
                    name="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="modal-auth-password" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="modal-auth-password"
                    name="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 mt-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm sm:text-base shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{isRegister ? 'Sign Up' : 'Sign In'}</span>
                )}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 text-center text-sm font-semibold text-slate-500 relative z-10">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                  setShowPassword(false);
                }}
                className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors duration-300"
              >
                {isRegister ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
