import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, User, Mail, Shield, Calendar } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    role: 'user' | 'admin';
    createdAt?: string;
  } | null;
  onLogout: () => void;
}

export default function ProfileModal({ isOpen, onClose, user, onLogout }: ProfileModalProps) {
  if (!user) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Joined recently';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Joined recently';
    }
  };

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  const isAdmin = user.role === 'admin';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 min-[320px]:p-6 sm:p-8 overflow-hidden z-10"
          >
            {/* Background Glows */}
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-indigo-50 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-rose-50 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-xl font-bold text-slate-900">Your Profile</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 active:scale-95 transition-all duration-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-6 relative z-10">
              {/* Profile Avatar / Initial Badge */}
              <div className="flex flex-col items-center justify-center gap-3 py-4">
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-100 text-white font-extrabold text-3xl">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-bold text-slate-800">{user.name}</h4>
                  <div className="mt-1.5 inline-flex">
                    {isAdmin ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full text-xs font-bold shadow-sm">
                        <Shield className="h-3.5 w-3.5" />
                        Administrator
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-full text-xs font-bold shadow-sm">
                        <User className="h-3.5 w-3.5" />
                        Supporter
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Fields List */}
              <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-3 min-[320px]:p-4.5 space-y-4">
                <div className="flex flex-col min-[280px]:flex-row items-center min-[280px]:items-start gap-2.5 min-[280px]:gap-3 text-center min-[280px]:text-left">
                  <div className="p-1.5 min-[320px]:p-2 bg-white rounded-xl border border-slate-100 text-slate-400 shrink-0">
                    <Mail className="h-4.5 w-4.5 text-indigo-500" />
                  </div>
                  <div className="min-w-0 w-full">
                    <span className="text-[9px] min-[320px]:text-xs font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                    <span className="text-xs min-[320px]:text-sm font-semibold text-slate-700 block mt-0.5 break-all">{user.email}</span>
                  </div>
                </div>

                <div className="flex flex-col min-[280px]:flex-row items-center min-[280px]:items-start gap-2.5 min-[280px]:gap-3 text-center min-[280px]:text-left">
                  <div className="p-1.5 min-[320px]:p-2 bg-white rounded-xl border border-slate-100 text-slate-400 shrink-0">
                    <Calendar className="h-4.5 w-4.5 text-indigo-500" />
                  </div>
                  <div className="min-w-0 w-full">
                    <span className="text-[9px] min-[320px]:text-xs font-bold text-slate-400 uppercase tracking-wider block">Member Since</span>
                    <span className="text-xs min-[320px]:text-sm font-semibold text-slate-700 block mt-0.5 break-all">{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogoutClick}
                className="w-full py-3.5 px-4 mt-6 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-100 hover:border-rose-100 rounded-2xl font-bold text-sm sm:text-base active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <LogOut className="h-5 w-5 text-slate-400 group-hover:text-rose-500 transition-colors" />
                <span>Log Out</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
