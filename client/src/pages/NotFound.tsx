import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, ArrowRight } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[50vh] sm:min-h-[60vh] flex items-center justify-center px-2 py-8 sm:py-16 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
        className="max-w-md w-full bg-white border border-slate-100 shadow-xl shadow-slate-100/50 rounded-3xl p-4 min-[300px]:p-8 sm:p-10 relative overflow-hidden"
      >
        {/* Ambient background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-50/50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Animated Compass Icon */}
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="h-14 w-14 sm:h-20 sm:w-20 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-5 shadow-inner"
          >
            <Compass className="h-8 w-8 sm:h-12 sm:w-12 stroke-[1.5]" />
          </motion.div>

          {/* Huge Gradient 404 */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-indigo-600 tracking-tight leading-none mb-3">
            404
          </h1>

          {/* Title */}
          <h2 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight mb-2">
            Lost Your Way?
          </h2>

          {/* Subtitle */}
          <p className="text-slate-400 text-xs sm:text-sm font-semibold leading-relaxed mb-6 max-w-[240px] sm:max-w-sm">
            The page you are looking for doesn't exist, has been completed, or has moved to a new destination.
          </p>

          {/* Back Home Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs sm:text-base shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Back to Campaigns</span>
            <ArrowRight className="h-4 w-4 sm:h-4.5 sm:w-4.5 group-hover:translate-x-0.5 transition-transform duration-300" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
