import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Heart, Gift, ShieldAlert, Sparkles, Trophy, HelpCircle, HeartHandshake, Coins } from 'lucide-react';
import axios from 'axios';
import LoadingState from '../components/LoadingState';
import { API_BASE_URL } from '../config';

interface Supporter {
  name: string;
  amount: number;
  items: number;
  campaignsCount: number;
  badges: string[];
}

export default function Leaderboard() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/donations/leaderboard`);
        setSupporters(res.data);
      } catch (err: any) {
        console.error(err);
        setError('Unable to fetch Honour Roll stats. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const BADGE_CONFIGS: Record<string, {
    name: string;
    desc: string;
    icon: React.ComponentType<any>;
    bgClass: string;
    iconClass: string;
  }> = {
    'Hope Starter': {
      name: 'Hope Starter',
      desc: 'Granted for making a first donation.',
      icon: Sparkles,
      bgClass: 'bg-emerald-50 border-emerald-200/80 text-emerald-700',
      iconClass: 'text-emerald-600'
    },
    'Angel Donor': {
      name: 'Angel Donor',
      desc: 'Granted for total financial contributions exceeding ₹1,000.',
      icon: Heart,
      bgClass: 'bg-blue-50 border-blue-200/80 text-blue-700',
      iconClass: 'text-blue-600'
    },
    'Philanthropist': {
      name: 'Philanthropist',
      desc: 'Granted for total financial contributions exceeding ₹10,000.',
      icon: Award,
      bgClass: 'bg-amber-50 border-amber-250/70 text-amber-800',
      iconClass: 'text-amber-600'
    },
    'Generous Hands': {
      name: 'Generous Hands',
      desc: 'Granted for physical item donations.',
      icon: HeartHandshake,
      bgClass: 'bg-purple-50 border-purple-200/80 text-purple-800',
      iconClass: 'text-purple-600'
    },
    'Impact Champion': {
      name: 'Impact Champion',
      desc: 'Granted for supporting three or more distinct campaign causes.',
      icon: Trophy,
      bgClass: 'bg-rose-50 border-rose-200/80 text-rose-700',
      iconClass: 'text-rose-600'
    }
  };

  const renderBadgeIcon = (rawBadgeName: string) => {
    // Strip suffix emojis and extract alphabetic name
    const cleanName = rawBadgeName.replace(/[^a-zA-Z ]/g, '').trim();
    const config = BADGE_CONFIGS[cleanName];
    if (!config) return <span className="text-[10px] font-extrabold">{rawBadgeName}</span>;
    
    const IconComponent = config.icon;
    return (
      <span 
        key={rawBadgeName}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold border uppercase tracking-wider ${config.bgClass}`}
        title={config.desc}
      >
        <IconComponent className="h-3 w-3 shrink-0" />
        <span>{config.name}</span>
      </span>
    );
  };

  if (loading) {
    return <LoadingState message="Retrieving Supporter Honour Roll..." height="h-96" />;
  }

  return (
    <div className="py-2 sm:py-6 max-w-5xl mx-auto px-1 min-[280px]:px-2 min-h-screen">
      {/* Title Header */}
      <div className="text-center mb-8 sm:mb-12 mt-2 sm:mt-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center p-2 rounded-2xl bg-blue-50 text-blue-600 mb-3 border border-blue-150/40"
        >
          <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg min-[280px]:text-xl min-[360px]:text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight px-1"
        >
          GiveHope Honour Roll
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-[10px] min-[280px]:text-xs sm:text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed font-semibold px-2"
        >
          Celebrating the remarkable supporters who fuel our mission and bring hope to communities worldwide.
        </motion.p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-250/50 rounded-2xl text-amber-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        {/* Leaderboard Table List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-extrabold text-slate-800 text-xs sm:text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <span>Top Supporters Rankings</span>
            </h3>
            <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-wider">
              Updated Live
            </span>
          </div>

          {supporters.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-slate-400 font-semibold space-y-2 shadow-sm">
              <Heart className="h-10 w-10 mx-auto text-slate-200 animate-pulse" />
              <p className="text-xs sm:text-sm">The honour roll is currently vacant. Start a campaign and be the first to appear here!</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {supporters.map((supporter, index) => {
                const isTopThree = index < 3;
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={index} 
                    className={`p-3 min-[280px]:p-4 sm:p-5 flex flex-col min-[350px]:flex-row items-start min-[350px]:items-center justify-between gap-2.5 min-[350px]:gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md border rounded-2xl ${
                      isTopThree
                        ? index === 0 ? 'bg-amber-50/5 border-amber-200/50 shadow-[0_4px_16px_-4px_rgba(245,158,11,0.08)]' :
                          index === 1 ? 'bg-slate-50/5 border-slate-200/60 shadow-[0_4px_16px_-4px_rgba(100,116,139,0.08)]' :
                          'bg-orange-50/5 border-orange-200/50 shadow-[0_4px_16px_-4px_rgba(224,96,26,0.08)]'
                        : 'bg-white border-slate-100 shadow-sm'
                    }`}
                  >
                    {/* Left: Position & Name */}
                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 w-full min-[350px]:w-auto">
                      <span className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs sm:text-sm shrink-0 border shadow-sm ${
                        index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white border-amber-300/40' :
                        index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500 text-white border-slate-350/40' :
                        index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white border-amber-550/40' :
                        'bg-slate-50 border-slate-200/50 text-slate-500 font-bold'
                      }`}>
                        {index + 1}
                      </span>
                      
                      <div className="min-w-0 flex-1">
                        <h4 className={`font-black text-sm min-[320px]:text-base sm:text-lg tracking-tight mb-1 truncate ${
                          supporter.name === 'Anonymous Supporter' ? 'text-slate-400 italic font-semibold' : 'text-slate-800'
                        }`}>
                          {supporter.name}
                        </h4>
                        
                        {/* Render Earned Badges inline */}
                        {supporter.badges.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {supporter.badges.map(b => renderBadgeIcon(b))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Contributions Summary */}
                    <div className="flex items-center gap-4 text-left min-[350px]:text-right shrink-0 pl-10.5 min-[350px]:pl-0 w-full min-[350px]:w-auto">
                      <div className="space-y-0.5 w-full min-[350px]:w-auto">
                        {supporter.amount > 0 && (
                          <div className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1 justify-start min-[350px]:justify-end">
                            <Coins className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>₹{supporter.amount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {supporter.items > 0 && (
                          <div className="text-[10px] sm:text-xs font-extrabold text-indigo-600 flex items-center gap-1 justify-start min-[350px]:justify-end">
                            <Gift className="h-3 w-3 text-indigo-500 shrink-0" />
                            <span>{supporter.items} item{supporter.items > 1 ? 's' : ''}</span>
                          </div>
                        )}
                        <span className="text-[9px] text-slate-400 block font-semibold">
                          Assisted {supporter.campaignsCount} cause{supporter.campaignsCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Badge Glossary Card */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-xs sm:text-base flex items-center gap-2 mb-4">
              <Award className="h-4 sm:h-5 w-4 sm:w-5 text-blue-500" />
              <span>Milestone Badges</span>
            </h3>
            
            <div className="space-y-4">
              {Object.values(BADGE_CONFIGS).map((b) => {
                const IconComponent = b.icon;
                return (
                  <div key={b.name} className="flex gap-3 text-xs leading-relaxed border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className={`h-8 w-8 rounded-xl border flex items-center justify-center shrink-0 ${b.bgClass}`}>
                      <IconComponent className={`h-4.5 w-4.5 ${b.iconClass}`} />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-slate-800 text-xs">{b.name}</h5>
                      <p className="text-slate-450 font-semibold text-[10px] mt-0.5">{b.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="bg-slate-50 border border-slate-150/40 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-[10px] min-[280px]:text-xs text-slate-500 space-y-2 leading-relaxed font-semibold">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <HelpCircle className="h-4 w-4 text-indigo-500" />
              <span>Supporter Privacy Policy</span>
            </div>
            <p>
              Your recognition is optional. If you wish to hide your name on this leaderboard, go to your <strong>Profile Dashboard ➔ Edit Settings</strong> and toggle <em>"Keep my support anonymous"</em>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
