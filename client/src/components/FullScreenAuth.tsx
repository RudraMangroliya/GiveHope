import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Sparkles, Loader, Gift, ArrowRight, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface FullScreenAuthProps {
  onSuccess: (userData: any, token: string) => void;
}

export default function FullScreenAuth({ onSuccess }: FullScreenAuthProps) {
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

    // Input Validations
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
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row overflow-hidden">
      
      {/* Visual Impact Left Column (Gradient & Floating branding panel) */}
      <div className="relative w-full md:w-[45%] bg-gradient-to-tr from-indigo-900 via-indigo-800 to-violet-800 p-4 min-[300px]:p-8 sm:p-12 md:p-16 flex flex-col justify-between text-white shrink-0 overflow-hidden min-h-[250px] min-[280px]:min-h-[320px] md:min-h-screen">
        
        {/* Animated Background Lights */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-2 min-[280px]:gap-3 relative z-10">
          <div className="h-8 w-8 min-[280px]:h-11 min-[280px]:w-11 rounded-xl min-[280px]:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <Gift className="h-4.5 w-4.5 min-[280px]:h-6 min-[280px]:w-6 text-white" />
          </div>
          <span className="font-extrabold text-lg min-[280px]:text-2xl tracking-tight">GiveHope</span>
        </div>

        {/* Marketing/Inspiring Text Block */}
        <div className="my-auto py-4 min-[280px]:py-8 relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-2 min-[280px]:space-y-4"
          >
            <div className="hidden min-[280px]:inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full text-xs font-bold text-indigo-200">
              <Sparkles className="h-3.5 w-3.5" />
              Empowering Community Giving
            </div>
            <h1 className="text-xl min-[280px]:text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-none">
              Make a Real <br className="hidden md:block"/>
              <span className="bg-gradient-to-r from-indigo-200 to-indigo-100 bg-clip-text text-transparent">Visual Difference</span>
            </h1>
            <p className="text-slate-200 text-xs min-[280px]:text-sm sm:text-base font-medium leading-relaxed">
              Join GiveHope to experience direct donation tracking, transparent campaign timelines, and beautiful progress interfaces today.
            </p>
          </motion.div>
        </div>

        {/* Brand Footer */}
        <div className="relative z-10 text-[10px] min-[280px]:text-xs text-slate-300 font-semibold tracking-wide">
          &copy; {new Date().getFullYear()} GiveHope Inc. All rights reserved.
        </div>
      </div>

      {/* Form Right Column */}
      <div className="flex-1 flex items-center justify-center p-2 min-[300px]:p-4 sm:p-8 md:p-12 bg-slate-50 min-h-[450px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-3 min-[300px]:p-6 sm:p-10 relative overflow-hidden"
        >
          {/* Inner Light Highlights */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-violet-50/50 rounded-full blur-3xl pointer-events-none" />

          {/* Form Title & Switch Tabs */}
          <div className="text-center mb-8 relative z-10">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              {isRegister ? 'Create your Account' : 'Sign in to GiveHope'}
            </h2>
            <p className="text-slate-400 text-sm font-semibold">
              {isRegister ? 'Register to start tracking and contributing' : 'Enter your credentials to manage your donations'}
            </p>

            {/* Sliding Switch Indicator */}
            <div className="mt-6 flex bg-slate-50 border border-slate-100 rounded-2xl p-1 relative">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError('');
                }}
                className={`flex-1 py-2 rounded-xl text-[10px] min-[280px]:text-xs font-bold transition-all duration-300 relative z-10 ${
                  !isRegister ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError('');
                }}
                className={`flex-1 py-2 rounded-xl text-[10px] min-[280px]:text-xs font-bold transition-all duration-300 relative z-10 ${
                  isRegister ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Sign Up
              </button>
              {/* Sliding Background */}
              <div
                className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white border border-slate-100 rounded-xl shadow-sm transition-transform duration-300 left-1 ${
                  isRegister ? 'translate-x-full' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs sm:text-sm font-bold relative z-10"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dynamic Form */}
          <form onSubmit={handleSubmit} className="space-y-4.5 relative z-10">
            {isRegister && (
              <div className="space-y-1.5">
                <label htmlFor="register-name" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    id="register-name"
                    name="name"
                    required
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
              <label htmlFor="auth-email" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  id="auth-email"
                  name="email"
                  required
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="auth-password" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="auth-password"
                  name="password"
                  required
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

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 mt-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm sm:text-base shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Processing request...</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? 'Sign Up' : 'Sign In'}</span>
                  <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
