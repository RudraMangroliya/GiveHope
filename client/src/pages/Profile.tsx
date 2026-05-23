import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Key, Heart, 
  Eye, EyeOff, CheckCircle2, Circle, AlertCircle,
  Gift, Award
} from 'lucide-react';
import axios from 'axios';
import LoadingState from '../components/LoadingState';
import { API_BASE_URL } from '../config';

interface ProfileProps {
  user: {
    name: string;
    email: string;
    role: 'user' | 'admin';
    createdAt?: string;
  } | null;
  onProfileUpdate: (updatedUser: any) => void;
}

interface Donation {
  _id: string;
  campaignId: {
    _id: string;
    title: string;
    image: string;
  };
  donorName: string;
  email: string;
  amount: number;
  message?: string;
  status: 'pending' | 'verified' | 'approved' | 'completed';
  date: string;
  donationType: 'money' | 'item';
  itemCategory?: string;
  quantity?: number;
  quantityUnit?: string;
  pickupType?: 'dropoff' | 'pickup';
  pickupAddress?: string;
  pickupPhone?: string;
  pickupTime?: string;
}

export default function Profile({ user, onProfileUpdate }: ProfileProps) {
  const navigate = useNavigate();

  // If user is not authenticated, redirect to home
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;

  const [activeTab, setActiveTab] = useState<'history' | 'edit'>('history');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [expandedDonationId, setExpandedDonationId] = useState<string | null>(null);

  // Edit Profile form state
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email,
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Fetch user's donations
  useEffect(() => {
    const fetchMyDonations = async () => {
      try {
        setLoadingHistory(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/donations/my-donations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDonations(res.data);
      } catch (error) {
        console.error('Failed to fetch personal donations', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchMyDonations();
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'recently';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'recently';
    }
  };

  // Profile Edit Submit
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!editForm.name.trim() || !editForm.email.trim()) {
      setFormError('Name and Email are required.');
      return;
    }

    if (editForm.password && editForm.password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    if (editForm.password !== editForm.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE_URL}/auth/profile`, {
        name: editForm.name,
        email: editForm.email,
        password: editForm.password || undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update parent React state & storage
      onProfileUpdate(res.data);
      setFormSuccess('Profile updated successfully!');
      setEditForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (error: any) {
      console.error('Profile update failed', error);
      setFormError(error.response?.data?.message || 'Server error. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper to aggregate supporter stats
  const totalMoneyDonated = donations
    .filter(d => d.donationType === 'money')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalItemsDonated = donations
    .filter(d => d.donationType === 'item')
    .reduce((sum, d) => sum + (d.quantity || 0), 0);

  const uniqueCausesCount = new Set(donations.map(d => d.campaignId?._id)).size;

  const toggleExpandDonation = (id: string) => {
    setExpandedDonationId(prev => (prev === id ? null : id));
  };

  // Timeline render helpers
  const getTimelineSteps = (status: Donation['status'], dateStr: string) => {
    const isCompleted = status === 'completed';
    const isApproved = status === 'approved' || isCompleted;
    const isVerified = status === 'verified' || isApproved;
    
    return [
      {
        title: 'Donation Submitted',
        desc: `Registered on ${formatDate(dateStr)}`,
        active: true,
        done: true
      },
      {
        title: 'Verified by Team',
        desc: isVerified ? 'Verified and logged securely' : 'Pending verification review',
        active: isVerified,
        done: isVerified
      },
      {
        title: 'Allocated to Cause',
        desc: isApproved ? 'Funds/Items allocated for dispatch' : 'Awaiting resource assignment',
        active: isApproved,
        done: isApproved
      },
      {
        title: 'Delivered to Beneficiary',
        desc: isCompleted ? 'Successfully distributed in field' : 'Pending final field deployment',
        active: isCompleted,
        done: isCompleted
      }
    ];
  };

  return (
    <div className="max-w-6xl mx-auto py-2 sm:py-6 px-1 min-[285px]:px-2.5 sm:px-4 space-y-6 sm:space-y-8">
      {/* Profile Header Segment */}
      <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-slate-100 p-3 min-[285px]:p-6 sm:p-8 shadow-xl shadow-slate-100/50 flex flex-col md:flex-row justify-between items-center gap-6 profile-header-card">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-indigo-500/5 to-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10 text-center sm:text-left w-full md:w-auto">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-200 text-white font-extrabold text-2xl sm:text-3xl shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1 min-w-0 w-full">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight truncate max-w-[200px] min-[320px]:max-w-[280px] sm:max-w-none mx-auto sm:mx-0">{user.name}</h2>
            <p className="text-slate-500 font-semibold text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-1.5 truncate">
              <Mail className="h-4 w-4 text-indigo-500 shrink-0" />
              <span className="truncate">{user.email}</span>
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="flex items-center gap-1.5 px-3.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200/40 rounded-full text-[10px] font-bold shadow-sm">
                Joined {formatDate(user.createdAt)}
              </span>
              {user.role === 'admin' && (
                <span className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/40 rounded-full text-[10px] font-bold shadow-sm">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Supporter Dashboard Statistics Quick View */}
        <div className="grid grid-cols-1 min-[350px]:grid-cols-3 gap-2.5 sm:gap-4 w-full md:w-auto relative z-10 profile-stats-grid">
          <div className="bg-white hover:bg-slate-50 border border-slate-100 p-2.5 sm:p-4 rounded-2xl text-center shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center gap-1.5 sm:gap-2 relative group overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500" />
            <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600 transition-transform duration-300 group-hover:scale-110">
              <Heart className="h-4.5 w-4.5 sm:h-5 sm:w-5 fill-indigo-50/50" />
            </div>
            <div>
              <span className="text-[8px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Donated</span>
              <span className="text-xs sm:text-lg font-extrabold text-indigo-600 block mt-0.5 sm:mt-1 truncate">₹{totalMoneyDonated}</span>
            </div>
          </div>
          <div className="bg-white hover:bg-slate-50 border border-slate-100 p-2.5 sm:p-4 rounded-2xl text-center shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center gap-1.5 sm:gap-2 relative group overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-violet-500" />
            <div className="p-1.5 rounded-xl bg-violet-50 text-violet-600 transition-transform duration-300 group-hover:scale-110">
              <Gift className="h-4.5 w-4.5 sm:h-5 sm:w-5 fill-violet-50/50" />
            </div>
            <div>
              <span className="text-[8px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">Items Given</span>
              <span className="text-xs sm:text-lg font-extrabold text-indigo-600 block mt-0.5 sm:mt-1 truncate">{totalItemsDonated} items</span>
            </div>
          </div>
          <div className="bg-white hover:bg-slate-50 border border-slate-100 p-2.5 sm:p-4 rounded-2xl text-center shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center gap-1.5 sm:gap-2 relative group overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-110">
              <Award className="h-4.5 w-4.5 sm:h-5 sm:w-5 fill-emerald-50/50" />
            </div>
            <div>
              <span className="text-[8px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">Causes Assisted</span>
              <span className="text-xs sm:text-lg font-extrabold text-indigo-600 block mt-0.5 sm:mt-1 truncate">{uniqueCausesCount} causes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar Drawer */}
        <div className="bg-white rounded-2xl border border-slate-100 p-2 sm:p-3 shadow-sm flex flex-row lg:flex-col gap-2 lg:col-span-1 profile-tabs-container">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 lg:w-full text-center lg:text-left justify-center lg:justify-start px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm md:text-base transition-all duration-300 flex items-center gap-2 sm:gap-3 cursor-pointer border-b-2 lg:border-b-0 lg:border-l-4 ${
              activeTab === 'history'
                ? 'bg-indigo-50 text-indigo-600 shadow-sm border-indigo-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800 border-transparent lg:border-transparent'
            }`}
          >
            <Heart className="h-4.5 w-4.5 sm:h-5 sm:w-5 shrink-0" />
            <span>Donation History</span>
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 lg:w-full text-center lg:text-left justify-center lg:justify-start px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm md:text-base transition-all duration-300 flex items-center gap-2 sm:gap-3 cursor-pointer border-b-2 lg:border-b-0 lg:border-l-4 ${
              activeTab === 'edit'
                ? 'bg-indigo-50 text-indigo-600 shadow-sm border-indigo-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800 border-transparent lg:border-transparent'
            }`}
          >
            <User className="h-4.5 w-4.5 sm:h-5 sm:w-5 shrink-0" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Dynamic Display Panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'history' && (
              <motion.div
                key="history-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center mb-2 px-1 profile-overview-header">
                  <h3 className="text-xl font-extrabold text-slate-800 profile-overview-title">Support Overview</h3>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest profile-overview-count">{donations.length} records found</span>
                </div>

                {loadingHistory ? (
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <LoadingState message="Retrieving your donation files..." height="h-64" />
                  </div>
                ) : donations.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-4 shadow-sm flex flex-col items-center">
                    <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-300">
                      <Heart className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-slate-700">No donations registered yet</h4>
                      <p className="text-sm text-slate-400 max-w-sm">Your contributions help change lives. Join an active campaign and start supporting causes today!</p>
                    </div>
                    <button
                      onClick={() => navigate('/')}
                      className="mt-2 bg-indigo-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100 cursor-pointer"
                    >
                      Browse Active Campaigns
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {donations.map((donation) => {
                      const isExpanded = expandedDonationId === donation._id;
                      const dateFormatted = formatDate(donation.date);
                      const isItem = donation.donationType === 'item';

                      return (
                        <div 
                          key={donation._id}
                          className={`bg-white rounded-3xl border transition-all duration-300 shadow-sm overflow-hidden profile-donation-card ${
                            isExpanded ? 'border-indigo-200 ring-2 ring-indigo-500/5 shadow-md' : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          {/* Donation Summary Row */}
                          <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Left segment */}
                            <div className="flex items-center gap-3.5 w-full sm:w-auto">
                              <img 
                                src={donation.campaignId?.image || 'https://picsum.photos/seed/placeholder/200'} 
                                alt={donation.campaignId?.title || 'Campaign'} 
                                className="h-12 w-12 sm:h-14 sm:w-14 object-cover rounded-2xl shadow-inner border border-slate-100 shrink-0"
                              />
                              <div className="min-w-0">
                                <h4 className="font-extrabold text-sm sm:text-base text-slate-800 truncate max-w-[200px] min-[320px]:max-w-[260px] sm:max-w-[340px] leading-snug">
                                  {donation.campaignId?.title || 'Unknown Cause'}
                                </h4>
                                <span className="text-[10px] sm:text-xs text-slate-400 font-semibold block mt-0.5">{dateFormatted}</span>
                              </div>
                            </div>

                            {/* Right segment */}
                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-50 profile-donation-details">
                              <div className="text-left sm:text-right">
                                {isItem ? (
                                  <>
                                    <span className="text-xs sm:text-sm font-extrabold text-slate-800 block">
                                      {donation.quantity} {donation.quantityUnit}
                                    </span>
                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-2 py-0.5 rounded-full inline-block mt-0.5 uppercase tracking-wide">
                                      {donation.itemCategory} Donation
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-xs sm:text-sm font-extrabold text-slate-800 block">₹{donation.amount}</span>
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded-full inline-block mt-0.5 uppercase tracking-wide">
                                      Cash Gift
                                    </span>
                                  </>
                                )}
                              </div>

                              <div className="flex items-center gap-3">
                                {/* Status Indicator */}
                                <span className={`px-3 py-1 text-[10px] sm:text-xs font-extrabold rounded-full border shadow-sm ${
                                  donation.status === 'completed'
                                    ? 'bg-green-50 text-green-700 border-green-200/60'
                                    : donation.status === 'approved'
                                    ? 'bg-violet-50 text-violet-700 border-violet-200/60'
                                    : donation.status === 'verified'
                                    ? 'bg-sky-50 text-sky-700 border-sky-200/60'
                                    : 'bg-amber-50 text-amber-700 border-amber-200/60'
                                }`}>
                                  {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                </span>

                                <button
                                  onClick={() => toggleExpandDonation(donation._id)}
                                  className="p-1.5 rounded-xl border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 hover:border-slate-200 transition-all duration-300 cursor-pointer text-xs font-bold px-3 shrink-0"
                                >
                                  {isExpanded ? 'Hide Details' : 'Track'}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Expandable Timeline Track Drawer */}
                          {isExpanded && (
                            <div className="px-5 pb-6 border-t border-slate-100 bg-slate-50/40 animate-in fade-in duration-300">
                              {/* Details Segment */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 mb-4 border-b border-slate-100 text-slate-600 text-xs sm:text-sm">
                                <div className="space-y-1.5">
                                  {donation.message && (
                                    <p>💬 <strong>Support Message:</strong> "{donation.message}"</p>
                                  )}
                                  <p>🔑 <strong>Donation ID:</strong> <span className="font-mono text-slate-500 select-all">{donation._id}</span></p>
                                </div>
                                <div className="space-y-1.5 md:text-right">
                                  {isItem && (
                                    <>
                                      <p>🚚 <strong>Fulfillment Type:</strong> {donation.pickupType === 'pickup' ? 'Request Home Pickup' : 'Self Drop-off CP Center'}</p>
                                      {donation.pickupType === 'pickup' && donation.pickupAddress && (
                                        <p>📍 <strong>Pickup Spot:</strong> {donation.pickupAddress}</p>
                                      )}
                                      {donation.pickupPhone && (
                                        <p>📞 <strong>Contact Phone:</strong> {donation.pickupPhone}</p>
                                      )}
                                      {donation.pickupType === 'pickup' && donation.pickupTime && (
                                        <p>⏰ <strong>Time Preferred:</strong> {donation.pickupTime.toUpperCase()}</p>
                                      )}
                                    </>
                                  )}
                                  {!isItem && (
                                    <p>💳 <strong>Gateway Status:</strong> Verified Secure Transaction</p>
                                  )}
                                </div>
                              </div>

                              {/* Interactive Graphical Timeline tracker */}
                              <div className="pt-2">
                                <h5 className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-6 px-1">Donation Journey Tracking</h5>
                                <div className="relative">
                                  {/* Line Track */}
                                  <div className="absolute left-[17px] sm:left-1/2 top-0 bottom-0 sm:top-4 sm:bottom-auto w-0.5 sm:w-full sm:h-0.5 bg-slate-200 transform sm:-translate-x-1/2 -z-10"></div>
                                  
                                  {/* Line Progress Active Fill */}
                                  <div 
                                    className="absolute left-[17px] sm:left-0 top-0 sm:top-4 w-0.5 sm:h-0.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-500 transition-all duration-700 ease-in-out -z-10"
                                    style={{
                                      height: donation.status === 'completed' ? '100%' : donation.status === 'approved' ? '66%' : donation.status === 'verified' ? '33%' : '0%',
                                      width: window.innerWidth >= 640 ? (donation.status === 'completed' ? '100%' : donation.status === 'approved' ? '66%' : donation.status === 'verified' ? '33%' : '0%') : '0.5px'
                                    }}
                                  ></div>

                                  {/* Timeline Nodes */}
                                  <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-2">
                                    {getTimelineSteps(donation.status, donation.date).map((step, idx) => {
                                      return (
                                        <div key={idx} className="flex flex-row sm:flex-col items-start sm:items-center text-left sm:text-center w-full sm:w-1/4 gap-3 sm:gap-2">
                                          {/* Circle Node */}
                                          <div className={`h-9 w-9 rounded-full flex items-center justify-center border-4 bg-white transition-all duration-300 shrink-0 ${
                                            step.active 
                                              ? 'border-indigo-600 text-indigo-600 shadow-md shadow-indigo-100 scale-105' 
                                              : 'border-slate-200 text-slate-300'
                                          }`}>
                                            {step.done ? (
                                              <CheckCircle2 className="h-4 w-4 text-indigo-600 fill-indigo-50/50" />
                                            ) : (
                                              <Circle className="h-4 w-4 text-slate-300" />
                                            )}
                                          </div>
                                          
                                          {/* Text labels */}
                                          <div className="space-y-0.5">
                                            <span className={`text-xs font-bold block ${step.active ? 'text-slate-800' : 'text-slate-400'}`}>
                                              {step.title}
                                            </span>
                                            <span className="text-[10px] text-slate-400 block font-semibold leading-relaxed">
                                              {step.desc}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'edit' && (
              <motion.div
                key="edit-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="bg-white rounded-3xl border border-slate-100 p-2.5 px-3 min-[300px]:p-5 sm:p-8 shadow-sm space-y-4 sm:space-y-6 profile-edit-card"
              >
                <div className="space-y-1 px-1">
                  <h3 className="text-xl font-extrabold text-slate-800">Edit Profile Details</h3>
                  <p className="text-xs sm:text-sm text-slate-400 font-semibold">Keep your supporter credentials up to date.</p>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  {formError && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {formSuccess && (
                    <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{formSuccess}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label htmlFor="edit-name" className="block text-[11px] sm:text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 sm:top-3 h-4 sm:h-4.5 w-4 sm:w-4.5 text-slate-400 profile-edit-icon" />
                        <input
                          type="text"
                          id="edit-name"
                          name="name"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          disabled={isUpdating}
                          className="w-full pl-9 min-[285px]:pl-11 pr-3 py-2.5 sm:py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 profile-edit-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="edit-email" className="block text-[11px] sm:text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 sm:top-3 h-4 sm:h-4.5 w-4 sm:w-4.5 text-slate-400 profile-edit-icon" />
                        <input
                          type="email"
                          id="edit-email"
                          name="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          disabled={isUpdating}
                          className="w-full pl-9 min-[285px]:pl-11 pr-3 py-2.5 sm:py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 profile-edit-input"
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="my-2 border-slate-50" />

                    <div className="p-2.5 min-[285px]:p-4 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-3 sm:space-y-4 profile-password-card">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Change Password (Optional)</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label htmlFor="edit-password" className="block text-[11px] sm:text-sm font-bold text-slate-700 mb-1.5">New Password</label>
                          <div className="relative">
                            <Key className="absolute left-3 top-2.5 sm:top-3 h-4 sm:h-4.5 w-4 sm:w-4.5 text-slate-400 profile-edit-icon" />
                            <input
                              type={showPassword ? "text" : "password"}
                              id="edit-password"
                              name="password"
                              value={editForm.password}
                              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                              disabled={isUpdating}
                              placeholder="Min 6 characters"
                              className="w-full pl-9 min-[285px]:pl-11 pr-10 min-[285px]:pr-12 py-2.5 sm:py-3 bg-white border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 profile-edit-input"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-2.5 sm:top-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer profile-edit-eye"
                            >
                              {showPassword ? <EyeOff className="h-4 sm:h-4.5 w-4 sm:w-4.5" /> : <Eye className="h-4 sm:h-4.5 w-4 sm:w-4.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="edit-confirm-password" className="block text-[11px] sm:text-sm font-bold text-slate-700 mb-1.5">Confirm Password</label>
                          <div className="relative">
                            <Key className="absolute left-3 top-2.5 sm:top-3 h-4 sm:h-4.5 w-4 sm:w-4.5 text-slate-400 profile-edit-icon" />
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              id="edit-confirm-password"
                              name="confirmPassword"
                              value={editForm.confirmPassword}
                              onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                              disabled={isUpdating}
                              placeholder="Re-enter password"
                              className="w-full pl-9 min-[285px]:pl-11 pr-10 min-[285px]:pr-12 py-2.5 sm:py-3 bg-white border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 profile-edit-input"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3.5 top-2.5 sm:top-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer profile-edit-eye"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 sm:h-4.5 w-4 sm:w-4.5" /> : <Eye className="h-4 sm:h-4.5 w-4 sm:w-4.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full sm:w-auto bg-indigo-600 text-white font-bold text-sm sm:text-base px-8 py-3 rounded-2xl shadow-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:pointer-events-none"
                    >
                      {isUpdating ? 'Saving Changes...' : 'Save Profile Settings'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
