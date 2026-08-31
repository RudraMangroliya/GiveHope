import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function OfflineState() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isChecking, setIsChecking] = useState(false);
  const [showRestoredToast, setShowRestoredToast] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setShowRestoredToast(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowRestoredToast(true);
      const timer = setTimeout(() => {
        setShowRestoredToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      // Attempt a lightweight fetch request to verify internet connectivity
      const response = await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store' });
      if (response.ok || response.status < 500) {
        setIsOffline(false);
        setShowRestoredToast(true);
        setTimeout(() => setShowRestoredToast(false), 4000);
      } else {
        setIsOffline(true);
      }
    } catch {
      setIsOffline(true);
    } finally {
      setTimeout(() => setIsChecking(false), 600);
    }
  };

  return (
    <>
      {/* Toast Notification when Connection is Restored */}
      <AnimatePresence>
        {showRestoredToast && !isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl shadow-emerald-500/20 border border-emerald-500 flex items-center gap-3 text-sm font-bold pointer-events-none"
          >
            <CheckCircle2 className="h-5 w-5 text-white shrink-0" />
            <span>Connection Restored! You are back online.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Custom Offline Overlay Page */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[99999] bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center p-4 min-[300px]:p-6 text-center font-sans overflow-y-auto select-none"
          >
            {/* Background Glow Highlights */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ duration: 0.4 }}
              className="relative z-10 max-w-md w-full bg-white rounded-3xl p-6 min-[320px]:p-8 sm:p-10 shadow-2xl border border-slate-100/20 text-slate-800 space-y-6"
            >
              {/* Animated Wifi Off Icon Badge */}
              <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24">
                <div className="absolute inset-0 bg-rose-100 rounded-3xl rotate-6 animate-pulse" />
                <div className="relative w-full h-full bg-rose-50 border border-rose-100 rounded-3xl flex items-center justify-center text-rose-600 shadow-inner">
                  <WifiOff className="h-10 w-10 sm:h-12 sm:w-12 stroke-[2.2]" />
                </div>
              </div>

              {/* Status Header & Description */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full text-xs font-bold text-rose-600 uppercase tracking-wider">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>No Network Connection</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  You're Currently Offline
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                  It looks like your internet connection was interrupted. Please check your Wi-Fi or cellular data settings to continue supporting GiveHope causes.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={isChecking}
                  className="w-full py-3.5 px-5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75"
                >
                  <RefreshCw className={`h-4.5 w-4.5 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>{isChecking ? 'Checking Connection...' : 'Try Reconnecting'}</span>
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  <span>Will automatically reconnect once online</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
