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
            className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 z-[99999] bg-emerald-600 text-white px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl shadow-emerald-500/20 border border-emerald-500 flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold w-[calc(100%-1.25rem)] max-w-md sm:w-auto text-center pointer-events-none"
          >
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white shrink-0" />
            <span className="leading-tight break-words">Connection Restored! You are back online.</span>
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
            className="fixed inset-0 z-[99999] bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center p-2.5 min-[320px]:p-4 sm:p-6 text-center font-sans overflow-y-auto select-none min-h-screen"
          >
            {/* Background Glow Highlights */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-indigo-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-violet-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ duration: 0.4 }}
              className="relative z-10 w-[calc(100%-0.5rem)] max-w-md bg-white rounded-2xl min-[320px]:rounded-3xl p-4 min-[320px]:p-6 sm:p-10 shadow-2xl border border-slate-100/20 text-slate-800 space-y-4 sm:space-y-6 my-auto"
            >
              {/* Animated Wifi Off Icon Badge */}
              <div className="relative mx-auto w-14 h-14 min-[320px]:w-20 min-[320px]:h-20 sm:w-24 sm:h-24">
                <div className="absolute inset-0 bg-rose-100 rounded-2xl min-[320px]:rounded-3xl rotate-6 animate-pulse" />
                <div className="relative w-full h-full bg-rose-50 border border-rose-100 rounded-2xl min-[320px]:rounded-3xl flex items-center justify-center text-rose-600 shadow-inner">
                  <WifiOff className="h-7 w-7 min-[320px]:h-10 min-[320px]:w-10 sm:h-12 sm:w-12 stroke-[2.2]" />
                </div>
              </div>

              {/* Status Header & Description */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1 min-[320px]:gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-100 rounded-full text-[10px] min-[320px]:text-xs font-bold text-rose-600 uppercase tracking-wider max-w-full">
                  <ShieldAlert className="h-3 w-3 min-[320px]:h-3.5 min-[320px]:w-3.5 shrink-0" />
                  <span className="truncate">No Network Connection</span>
                </div>
                <h2 className="text-base min-[280px]:text-lg min-[360px]:text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  You're Currently Offline
                </h2>
                <p className="text-[11px] min-[280px]:text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                  It looks like your internet connection was interrupted. Please check your Wi-Fi or cellular data settings to continue supporting GiveHope causes.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={isChecking}
                  className="w-full py-2.5 min-[320px]:py-3.5 px-3.5 min-[320px]:px-5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs min-[320px]:text-sm rounded-xl min-[320px]:rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 min-[320px]:gap-2.5 cursor-pointer disabled:opacity-75"
                >
                  <RefreshCw className={`h-4 w-4 min-[320px]:h-4.5 min-[320px]:w-4.5 shrink-0 ${isChecking ? 'animate-spin' : ''}`} />
                  <span className="truncate">{isChecking ? 'Checking Connection...' : 'Try Reconnecting'}</span>
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] min-[320px]:text-[11px] font-semibold text-slate-400 flex-wrap">
                  <AlertTriangle className="h-3 w-3 min-[320px]:h-3.5 min-[320px]:w-3.5 text-amber-500 shrink-0" />
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
