import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, ShieldCheck } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessages?: string[];
  height?: string;
  compact?: boolean;
}

const defaultSubMessages = [
  "Establishing secure connection...",
  "Retrieving verified records...",
  "Validating server responses...",
  "Rendering view layout...",
  "Finishing up, almost ready..."
];

export default function LoadingState({
  message = 'Loading...',
  subMessages,
  height = 'min-h-[50vh]',
  compact = false
}: LoadingStateProps) {
  // Construct the active message queue
  const messageQueue = subMessages && subMessages.length > 0
    ? subMessages
    : [message, ...defaultSubMessages.slice(1)];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Cycle messages sequentially
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messageQueue.length);
    }, 2200);

    return () => clearInterval(messageInterval);
  }, [messageQueue.length]);

  // Animate progress bar smoothly from 0 to 98%
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(progressInterval);
          return 98;
        }
        const increment = Math.max(1, Math.floor((100 - prev) / 8));
        return prev + increment;
      });
    }, 180);

    return () => clearInterval(progressInterval);
  }, []);

  const displayedMessage = messageQueue[currentMessageIndex] || message;

  return (
    <div className={`flex flex-col justify-center items-center ${height} w-full text-center px-3 sm:px-4 py-6 sm:py-10 relative overflow-hidden`}>
      {/* Background Soft Glow Auras */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`relative z-10 w-full max-w-[92vw] sm:max-w-sm ${
          compact ? 'p-4 sm:p-6' : 'p-6 sm:p-8'
        } rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50 flex flex-col items-center gap-5 sm:gap-6 overflow-hidden`}
      >
        {/* Ring & Icon Loader Container */}
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex items-center justify-center shrink-0">
          {/* Concentric Ripple Ring 1 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 2.0, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border border-indigo-400 bg-indigo-400/5 pointer-events-none"
          />

          {/* Concentric Ripple Ring 2 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2.4, delay: 0.8, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border border-violet-400 bg-violet-400/5 pointer-events-none"
          />

          {/* Concentric Ripple Ring 3 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.3, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2.4, delay: 1.6, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border border-indigo-300 bg-indigo-300/5 pointer-events-none"
          />

          {/* Outer Rotating Double Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-1.5 sm:inset-2 rounded-full border-[3px] border-slate-100 border-t-indigo-600 border-b-violet-600 shadow-inner"
          />

          {/* Inner Pulsing Brand Icon */}
          <motion.div
            animate={{ 
              scale: [0.95, 1.05, 0.95],
              boxShadow: [
                "0 4px 12px rgba(99, 102, 241, 0.15)",
                "0 8px 24px rgba(99, 102, 241, 0.3)",
                "0 4px 12px rgba(99, 102, 241, 0.15)"
              ]
            }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white"
          >
            <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            
            {/* Sparkle badge */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
              className="absolute -top-1 -right-1 h-3.5 w-3.5 sm:h-4 sm:w-4 bg-amber-400 rounded-full flex items-center justify-center text-white shadow-sm"
            >
              <Sparkles className="h-2 w-2" />
            </motion.div>
          </motion.div>
        </div>

        {/* Loading text with AnimatePresence for smooth transitions */}
        <div className="flex flex-col items-center gap-1.5 sm:gap-2 w-full">
          <div className="h-10 sm:h-12 flex items-center justify-center overflow-hidden w-full">
            <AnimatePresence mode="wait">
              <motion.span
                key={displayedMessage}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="font-extrabold text-xs sm:text-sm md:text-base text-slate-800 tracking-wide px-2 max-w-full text-center leading-snug truncate sm:whitespace-normal"
              >
                {displayedMessage}
              </motion.span>
            </AnimatePresence>
          </div>
          
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            Secure Connection Active
          </span>
        </div>

        {/* Premium Progress Bar */}
        <div className="w-full mt-1">
          <div className="flex justify-between items-center mb-1.5 px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
            <span className="text-[10px] font-extrabold text-indigo-600 tracking-wide">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden p-[1px] border border-slate-200/40">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.2 }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

