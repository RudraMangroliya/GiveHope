import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, Check, Clock, Shield, AlertCircle, 
  TrendingUp, Heart, Award, RefreshCw, X, Image as ImageIcon,
  FolderKanban, HeartHandshake, Search, Download, Filter
} from 'lucide-react';
import axios from 'axios';
import LoadingState from '../components/LoadingState';
import { API_BASE_URL } from '../config';
import { generate80GReceipt } from '../utils/generateReceipt';

interface Campaign {
  _id: string;
  title: string;
  description: string;
  category: string;
  goal: number;
  raised: number;
  image: string;
}

interface Donation {
  _id: string;
  campaignId: {
    _id: string;
    title: string;
  } | null;
  donorName: string;
  email: string;
  amount: number;
  message?: string;
  status: 'pending' | 'verified' | 'approved' | 'completed' | 'dispatched' | 'picked_up' | 'received';
  date: string;
  donationType?: 'money' | 'item';
  itemCategory?: string;
  quantity?: number;
  quantityUnit?: string;
  courierName?: string;
  courierPhone?: string;
  trackingTimeline?: Array<{
    status: string;
    note: string;
    timestamp: string;
  }>;
}

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'donations' | 'analytics'>('campaigns');
  
  // Data States
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'approved' | 'completed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'money' | 'item'>('all');


    
  // Stats Analytics States
  const [stats, setStats] = useState<{
    totalCampaigns: number,
    totalDonations: number,
    totalRaised: number,
    totalItems: number,
    categoryData: Array<{ category: string, raised: number, goal: number }>,
    monthlyChart: Array<{ month: string, amount: number }>
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Logistics tracking states
  const [isLogisticsModalOpen, setIsLogisticsModalOpen] = useState(false);
  const [selectedDonationForTracking, setSelectedDonationForTracking] = useState<Donation | null>(null);
  const [courierName, setCourierName] = useState('');
  const [courierPhone, setCourierPhone] = useState('');
  const [trackingStatus, setTrackingStatus] = useState('pending');
  const [trackingNote, setTrackingNote] = useState('');
  const [trackingSubmitting, setTrackingSubmitting] = useState(false);
  
  // Campaign Form Modal States
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [campaignCategory, setCampaignCategory] = useState('Education');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [campaignImage, setCampaignImage] = useState('');
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [updatingDonationIds, setUpdatingDonationIds] = useState<string[]>([]);

  // Filtered Donations computation
  const filteredDonations = donations.filter(d => {
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = !query || 
      d.donorName.toLowerCase().includes(query) ||
      d.email.toLowerCase().includes(query) ||
      (d.campaignId && d.campaignId.title.toLowerCase().includes(query));
    
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'money' && d.donationType !== 'item') ||
      (typeFilter === 'item' && d.donationType === 'item');

    return matchesQuery && matchesStatus && matchesType;
  });

  // Auth check
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
      return;
    }
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.role !== 'admin') {
        navigate('/');
      }
    } catch {
      navigate('/');
    }
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    try {
      const [campaignsRes, donationsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/campaigns`),
        axios.get(`${API_BASE_URL}/donations`, config)
      ]);
      setCampaigns(campaignsRes.data);
      setDonations(donationsRes.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch admin dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch stats when Analytics tab becomes active
  useEffect(() => {
    if (activeTab === 'analytics') {
      const fetchStats = async () => {
        try {
          setLoadingStats(true);
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_BASE_URL}/donations/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setStats(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingStats(false);
        }
      };
      fetchStats();
    }
  }, [activeTab]);

  const handleTrackingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonationForTracking) return;
    setTrackingSubmitting(true);
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };
    try {
      const res = await axios.put(`${API_BASE_URL}/donations/${selectedDonationForTracking._id}/tracking`, {
        courierName,
        courierPhone,
        status: trackingStatus,
        note: trackingNote
      }, config);
      
      setDonations(prev => prev.map(d => d._id === selectedDonationForTracking._id ? {
        ...d,
        courierName: res.data.donation.courierName,
        courierPhone: res.data.donation.courierPhone,
        status: res.data.donation.status,
        trackingTimeline: res.data.donation.trackingTimeline
      } : d));
      
      setIsLogisticsModalOpen(false);
      alert('Logistics tracking updated successfully!');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update tracking details');
    } finally {
      setTrackingSubmitting(false);
    }
  };

  // Helper to calculate monthly chart coordinates
  const getMonthlyChartData = () => {
    if (!stats || !stats.monthlyChart || stats.monthlyChart.length === 0) {
      return null;
    }
    const maxAmount = Math.max(...stats.monthlyChart.map(m => m.amount), 1000);
    const points = stats.monthlyChart.map((m, idx) => {
      const x = 40 + (idx * 80);
      const y = 160 - (m.amount / maxAmount * 125);
      return { x, y, label: m.month, amount: m.amount };
    });

    const pathD = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
    const areaD = `${pathD} L ${points[points.length - 1].x} 160 L ${points[0].x} 160 Z`;

    return { points, pathD, areaD };
  };

  const chartData = getMonthlyChartData();

  // Stats computation
  const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalDonationsCount = donations.length;
  const pendingDonationsCount = donations.filter(d => d.status === 'pending').length;
  const activeCampaignsCount = campaigns.length;

  const handleOpenCreateModal = () => {
    setModalType('create');
    setSelectedCampaignId(null);
    setCampaignTitle('');
    setCampaignDescription('');
    setCampaignCategory('Education');
    setCampaignGoal('');
    setCampaignImage('');
    setFormError('');
    setIsCampaignModalOpen(true);
  };

  const handleOpenEditModal = (campaign: Campaign) => {
    setModalType('edit');
    setSelectedCampaignId(campaign._id);
    setCampaignTitle(campaign.title);
    setCampaignDescription(campaign.description);
    setCampaignCategory(campaign.category);
    setCampaignGoal(campaign.goal.toString());
    setCampaignImage(campaign.image);
    setFormError('');
    setIsCampaignModalOpen(true);
  };

  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!campaignTitle.trim() || !campaignDescription.trim() || !campaignGoal || !campaignImage.trim()) {
      setFormError('Please fill in all fields');
      return;
    }

    const goalNum = Number(campaignGoal);
    if (isNaN(goalNum) || goalNum <= 0) {
      setFormError('Please enter a valid positive number for goal');
      return;
    }

    setFormSubmitting(true);
    const token = localStorage.getItem('token');
    const config = {
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      }
    };

    const payload = {
      title: campaignTitle.trim(),
      description: campaignDescription.trim(),
      category: campaignCategory,
      goal: goalNum,
      image: campaignImage.trim()
    };

    try {
      if (modalType === 'create') {
        await axios.post(`${API_BASE_URL}/campaigns`, payload, config);
      } else {
        await axios.put(`${API_BASE_URL}/campaigns/${selectedCampaignId}`, payload, config);
      }
      setIsCampaignModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'An error occurred processing the campaign request.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteCampaign = async (id: string, title: string) => {
    if (deletingIds.includes(id)) return;
    if (!window.confirm(`Are you sure you want to delete campaign "${title}"?`)) {
      return;
    }

    setDeletingIds(prev => [...prev, id]);
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    try {
      await axios.delete(`${API_BASE_URL}/campaigns/${id}`, config);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete campaign');
    } finally {
      setDeletingIds(prev => prev.filter(x => x !== id));
    }
  };

  const handleStatusChange = async (donationId: string, newStatus: string) => {
    if (updatingDonationIds.includes(donationId)) return;
    setUpdatingDonationIds(prev => [...prev, donationId]);
    const token = localStorage.getItem('token');
    const config = {
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      }
    };

    try {
      await axios.put(`${API_BASE_URL}/donations/${donationId}/status`, { status: newStatus }, config);
      
      // Update local state without full reload for instant feedback
      setDonations(prev => prev.map(d => {
        if (d._id === donationId) {
          return { ...d, status: newStatus as any };
        }
        return d;
      }));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update donation status');
    } finally {
      setUpdatingDonationIds(prev => prev.filter(x => x !== donationId));
    }
  };

  const categoriesList = ['Education', 'Health', 'Environment', 'Disaster Relief', 'Community', 'Animal Welfare'];

  if (loading && campaigns.length === 0) {
    return <LoadingState message="Loading Admin Dashboard..." height="h-[60vh]" />;
  }

  return (
    <div className="py-2 sm:py-6 max-w-7xl mx-auto px-2 min-[280px]:px-4 w-full max-w-full min-w-0">
      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-1.5 text-indigo-600 font-extrabold text-[10px] min-[280px]:text-xs sm:text-sm mb-1 uppercase tracking-wider">
            <Shield className="h-4 w-4" />
            <span>Administrator Control Center</span>
          </div>
          <h2 className="text-lg min-[280px]:text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Dashboard Overview
          </h2>
        </div>
        <button 
          onClick={fetchData}
          className="w-full min-[320px]:w-auto flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-xs min-[280px]:text-sm shadow-sm hover:bg-slate-50 active:scale-95 transition-all duration-300"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Aggregate Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-10">
        
        {/* Stat Card 1 */}
        <div className="bg-white border border-slate-100 p-3.5 min-[280px]:p-5 sm:p-6 rounded-2xl min-[280px]:rounded-3xl shadow-sm flex flex-col min-[280px]:flex-row items-center text-center min-[280px]:text-left gap-3 sm:gap-4.5">
          <div className="h-10 w-10 min-[280px]:h-12 min-[280px]:w-12 rounded-xl min-[280px]:rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <TrendingUp className="h-5 w-5 min-[280px]:h-6 min-[280px]:w-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] min-[280px]:text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Raised</span>
            <span className="text-base min-[280px]:text-lg sm:text-xl md:text-2xl font-black text-slate-800 truncate block">₹{totalRaised.toLocaleString()}</span>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white border border-slate-100 p-3.5 min-[280px]:p-5 sm:p-6 rounded-2xl min-[280px]:rounded-3xl shadow-sm flex flex-col min-[280px]:flex-row items-center text-center min-[280px]:text-left gap-3 sm:gap-4.5">
          <div className="h-10 w-10 min-[280px]:h-12 min-[280px]:w-12 rounded-xl min-[280px]:rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Heart className="h-5 w-5 min-[280px]:h-6 min-[280px]:w-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] min-[280px]:text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Donations</span>
            <span className="text-base min-[280px]:text-lg sm:text-xl md:text-2xl font-black text-slate-800 truncate block">{totalDonationsCount}</span>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white border border-slate-100 p-3.5 min-[280px]:p-5 sm:p-6 rounded-2xl min-[280px]:rounded-3xl shadow-sm flex flex-col min-[280px]:flex-row items-center text-center min-[280px]:text-left gap-3 sm:gap-4.5">
          <div className="h-10 w-10 min-[280px]:h-12 min-[280px]:w-12 rounded-xl min-[280px]:rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
            <Award className="h-5 w-5 min-[280px]:h-6 min-[280px]:w-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] min-[280px]:text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Causes</span>
            <span className="text-base min-[280px]:text-lg sm:text-xl md:text-2xl font-black text-slate-800 truncate block">{activeCampaignsCount}</span>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white border border-slate-100 p-3.5 min-[280px]:p-5 sm:p-6 rounded-2xl min-[280px]:rounded-3xl shadow-sm flex flex-col min-[280px]:flex-row items-center text-center min-[280px]:text-left gap-3 sm:gap-4.5">
          <div className="h-10 w-10 min-[280px]:h-12 min-[280px]:w-12 rounded-xl min-[280px]:rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="h-5 w-5 min-[280px]:h-6 min-[280px]:w-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] min-[280px]:text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Review</span>
            <span className="text-base min-[280px]:text-lg sm:text-xl md:text-2xl font-black text-slate-800 truncate block">{pendingDonationsCount}</span>
          </div>
        </div>
      </div>

      {/* Premium Segmented Control Tab Buttons */}
      <div className="bg-slate-100/90 p-1 sm:p-2.5 rounded-2xl flex flex-col min-[680px]:flex-row items-stretch min-[680px]:items-center gap-1.5 border border-slate-200/80 shadow-inner mb-6 sm:mb-8 w-full min-[680px]:w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('campaigns')}
          className={`w-full min-[680px]:w-auto flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 min-[680px]:py-2.5 rounded-xl text-[10px] min-[280px]:text-xs sm:text-base transition-all duration-300 cursor-pointer ${
            activeTab === 'campaigns'
              ? 'bg-white text-indigo-700 shadow-md shadow-indigo-500/10 border border-indigo-300/80 font-extrabold scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent font-bold'
          }`}
        >
          <FolderKanban className="h-4 sm:h-5 w-4 sm:w-5" />
          <span>Manage Campaigns</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('donations')}
          className={`w-full min-[680px]:w-auto flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 min-[680px]:py-2.5 rounded-xl text-[10px] min-[280px]:text-xs sm:text-base transition-all duration-300 cursor-pointer ${
            activeTab === 'donations'
              ? 'bg-white text-indigo-700 shadow-md shadow-indigo-500/10 border border-indigo-300/80 font-extrabold scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent font-bold'
          }`}
        >
          <HeartHandshake className="h-4 sm:h-5 w-4 sm:w-5" />
          <span>Manage Donations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`w-full min-[680px]:w-auto flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 min-[680px]:py-2.5 rounded-xl text-[10px] min-[280px]:text-xs sm:text-base transition-all duration-300 cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-white text-indigo-700 shadow-md shadow-indigo-500/10 border border-indigo-300/80 font-extrabold scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent font-bold'
          }`}
        >
          <TrendingUp className="h-4 sm:h-5 w-4 sm:w-5" />
          <span>Analytics Hub</span>
        </button>
      </div>

      {/* Analytics Panel */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
          {loadingStats ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
              <LoadingState message="Calculating donation algorithms & monthly curves..." height="h-64" />
            </div>
          ) : !stats ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center text-slate-400 font-semibold shadow-sm">
              Failed to load analytics data. Please try refreshing.
            </div>
          ) : (
            <>
              {/* Top stats panels */}
              <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Money Raised</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-800 block mt-1.5">₹{stats.totalRaised.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Physical Items Handled</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-800 block mt-1.5">{stats.totalItems.toLocaleString()} items</span>
                </div>
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-violet-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Transactions</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-800 block mt-1.5">{stats.totalDonations} ledger records</span>
                </div>
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-amber-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Average Contribution</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-800 block mt-1.5">
                    ₹{stats.totalDonations > 0 ? Math.round(stats.totalRaised / stats.totalDonations).toLocaleString('en-IN') : 0}
                  </span>
                </div>
              </div>

              {/* Graphs Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* 1. SVG Monthly curve line chart */}
                <div className="bg-white border border-slate-100 rounded-3xl p-3 min-[280px]:p-5 sm:p-6 shadow-sm">
                  <h4 className="font-extrabold text-slate-800 text-sm sm:text-base mb-4">Monthly Giving Curve</h4>
                  <div className="relative h-44 min-[375px]:h-52 sm:h-60 w-full flex items-center justify-center bg-slate-50/50 rounded-2xl border border-slate-100">
                    {stats.monthlyChart && stats.monthlyChart.length > 0 && chartData ? (
                      <svg className="w-full h-full" viewBox="0 0 500 220" preserveAspectRatio="none">
                        {/* Gradients */}
                        <defs>
                          <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25"/>
                            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.00"/>
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="40" y1="90" x2="480" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="40" y1="160" x2="480" y2="160" stroke="#cbd5e1" strokeWidth="1" />

                        {/* Shaded Area */}
                        <path d={chartData.areaD} fill="url(#chart-grad)" />
                        {/* Spline Path */}
                        <path d={chartData.pathD} fill="none" stroke="#4f46e5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                        
                        {/* Grid labels & Data values */}
                        {chartData.points.map((p, idx) => (
                          <g key={idx} className="group/dot cursor-pointer">
                            {/* Dot */}
                            <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" className="transition-all group-hover/dot:r-7 animate-pulse" />
                            
                            {/* X Label */}
                            <text x={p.x} y="194" textAnchor="middle" fill="#334155" fontSize="12" className="font-bold">{p.label.split(' ')[0]}</text>
                            
                            {/* Tooltip Hover Value */}
                            <text x={p.x} y={p.y - 12} textAnchor="middle" fill="#4f46e5" fontSize="10" className="font-extrabold opacity-0 group-hover/dot:opacity-100 transition-opacity">
                              ₹{p.amount.toLocaleString('en-IN')}
                            </text>
                          </g>
                        ))}
                      </svg>
                    ) : (
                      <span className="text-slate-400 text-xs font-semibold">No monthly curves logged.</span>
                    )}
                  </div>
                </div>

                {/* 2. SVG Category division donut gauge list */}
                <div className="bg-white border border-slate-100 rounded-3xl p-3 min-[280px]:p-5 sm:p-6 shadow-sm space-y-4">
                  <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">Division by Category</h4>
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                    {stats.categoryData.map((cat) => {
                      const percentage = cat.goal > 0 ? Math.min(Math.round((cat.raised / cat.goal) * 100), 100) : 0;
                      return (
                        <div key={cat.category} className="space-y-1 bg-slate-50/50 p-2 min-[280px]:p-2.5 sm:p-3 rounded-2xl border border-slate-100/50">
                          <div className="flex flex-col min-[350px]:flex-row justify-between items-start min-[350px]:items-baseline text-[10px] min-[280px]:text-xs font-bold gap-1">
                            <span className="text-slate-700">{cat.category}</span>
                            <span className="text-indigo-600">₹{cat.raised.toLocaleString('en-IN')} raised ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-200/50 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="text-[9px] text-slate-400 font-bold block text-right">Target Goal: ₹{cat.goal.toLocaleString('en-IN')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB CONTENT: CAMPAIGNS */}
      {activeTab === 'campaigns' && (
        <div>
          {/* Header row inside Campaigns Tab */}
          <div className="flex flex-col min-[380px]:flex-row min-[380px]:items-center justify-between gap-3 mb-6">
            <h3 className="text-base min-[280px]:text-lg sm:text-xl font-extrabold text-slate-900 text-center min-[380px]:text-left">Campaign Entries</h3>
            <button
              onClick={handleOpenCreateModal}
              className="w-full min-[380px]:w-auto flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-100 active:scale-95 text-white font-bold text-xs min-[280px]:text-sm rounded-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4" />
              <span>Create Campaign</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.length === 0 ? (
              <div className="col-span-full bg-white border border-dashed border-slate-200 rounded-3xl py-12 text-center text-slate-400 font-semibold">
                No campaigns seeded in database. Click Create Campaign to start.
              </div>
            ) : (
              campaigns.map((c) => {
                const progress = Math.min((c.raised / c.goal) * 100, 100);
                return (
                  <div key={c._id} className="bg-white border border-slate-100 rounded-2xl min-[280px]:rounded-3xl shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                    {/* Cover image */}
                    <div className="h-40 relative">
                      <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 rounded-full text-[10px] font-extrabold text-indigo-600 uppercase tracking-wide">
                        {c.category}
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="p-3.5 min-[280px]:p-5 flex-1 flex flex-col">
                      <h4 className="font-bold text-slate-900 text-sm min-[280px]:text-base sm:text-lg mb-2 line-clamp-1">{c.title}</h4>
                      <p className="text-[10px] min-[280px]:text-xs text-slate-400 font-semibold mb-4 leading-relaxed line-clamp-3 flex-1">{c.description}</p>
                      
                      <div className="mb-5">
                        <div className="flex justify-between items-baseline text-[10px] min-[280px]:text-xs mb-1.5 font-bold">
                          <span className="text-indigo-600">₹{c.raised.toLocaleString()} raised</span>
                          <span className="text-slate-400">of ₹{c.goal.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-55 rounded-full h-1.5 bg-slate-50 border border-slate-100">
                          <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>

                      {/* Campaign actions */}
                      <div className="flex flex-col min-[280px]:flex-row items-stretch min-[280px]:items-center gap-2 border-t border-slate-100 pt-4 mt-auto">
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          disabled={deletingIds.includes(c._id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 text-slate-600 font-bold text-[10px] min-[280px]:text-xs rounded-xl transition-all duration-300 disabled:opacity-50"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(c._id, c.title)}
                          disabled={deletingIds.includes(c._id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-100 text-slate-600 font-bold text-[10px] min-[280px]:text-xs rounded-xl transition-all duration-300 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: DONATIONS */}
      {activeTab === 'donations' && (
        <div className="bg-white border border-slate-100 rounded-2xl min-[280px]:rounded-3xl shadow-sm overflow-hidden w-full max-w-full">
          
          {/* Header & Ultra-Responsive Search/Filter Toolbar (down to 200px) */}
          <div className="p-2.5 min-[280px]:p-4 sm:p-6 border-b border-slate-100 space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm min-[280px]:text-base sm:text-lg">
                  Donation Ledger
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] min-[280px]:text-[10px] sm:text-xs font-bold border border-slate-200/80 shrink-0">
                  Live Status
                </span>
              </div>
              <p className="text-[10px] min-[280px]:text-xs text-slate-400 font-semibold">Showing {filteredDonations.length} of {donations.length} total records</p>
            </div>

            {/* Controls Bar: Lightest Professional Slate Gray Container */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2 min-[280px]:p-3 sm:p-3.5 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 sm:gap-3">
              {/* Search Box */}
              <div className="relative w-full lg:flex-1 min-w-0">
                <Search className="absolute left-3 top-2.5 sm:top-3 h-3.5 sm:h-4 w-3.5 sm:w-4 text-slate-500 font-bold" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search donor, email..."
                  className="w-full pl-8 min-[280px]:pl-9 sm:pl-11 pr-8 py-1.5 sm:py-2 bg-white border border-slate-300/80 rounded-xl text-slate-800 placeholder-slate-400 text-[10px] min-[280px]:text-xs sm:text-sm focus:ring-2 focus:ring-slate-400/20 focus:border-slate-600 outline-none transition-all shadow-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 sm:top-2.5 text-slate-400 hover:text-slate-700 p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Controls Row - Responsive for 200px to 680px+ */}
              <div className="flex flex-col min-[680px]:flex-row flex-wrap items-stretch min-[680px]:items-center gap-1.5 sm:gap-2 w-full lg:w-auto">
                
                {/* 1. Mobile & Small Screen Dual Dropdowns (shown under 680px viewport) */}
                <div className="flex flex-col min-[480px]:flex-row min-[680px]:hidden items-stretch min-[480px]:items-center gap-1.5 w-full">
                  {/* Type Filter Dropdown */}
                  <div className="w-full min-[480px]:flex-1 flex items-center justify-between gap-2 bg-white border border-slate-300/80 rounded-xl px-3 py-2 shadow-sm min-w-0">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Filter className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-400">Type:</span>
                    </div>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as any)}
                      className="bg-transparent text-slate-800 font-extrabold text-xs outline-none cursor-pointer text-right w-full min-w-0"
                    >
                      <option value="all">All Types</option>
                      <option value="money">Monetary (₹)</option>
                      <option value="item">Items</option>
                    </select>
                  </div>

                  {/* Status Filter Dropdown */}
                  <div className="w-full min-[480px]:flex-1 flex items-center justify-between gap-2 bg-white border border-slate-300/80 rounded-xl px-3 py-2 shadow-sm min-w-0">
                    <span className="text-xs font-bold text-slate-400 shrink-0">Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="bg-transparent text-slate-800 font-extrabold text-xs outline-none cursor-pointer text-right capitalize w-full min-w-0"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="approved">Approved</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* 2. Desktop/Tablet Filter Controls (shown from 680px viewport onwards) */}
                <div className="hidden min-[680px]:flex items-center gap-2 w-full min-[680px]:w-auto">
                  {/* Type Filter Dropdown */}
                  <div className="flex items-center gap-1 bg-white border border-slate-300/80 rounded-xl px-2.5 py-1.5 shrink-0 shadow-sm">
                    <Filter className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as any)}
                      className="bg-transparent text-slate-800 font-bold text-xs outline-none cursor-pointer"
                    >
                      <option value="all">All Types</option>
                      <option value="money">Monetary (₹)</option>
                      <option value="item">Items</option>
                    </select>
                  </div>

                  {/* Status Filter Segmented Pills Container */}
                  <div className="flex items-center gap-1 bg-slate-200/70 border border-slate-300/60 p-1 rounded-xl shrink-0 shadow-inner">
                    {(['all', 'pending', 'verified', 'approved', 'completed'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`px-2 min-[720px]:px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                          statusFilter === st
                            ? 'bg-slate-800 text-white shadow-sm font-extrabold scale-[1.02]'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
          
          {/* Hybrid Layout: Responsive Cards (<1024px) vs Desktop Table (>=1024px) */}
          
          {/* 1. Mobile & Tablet Cards view (shown under lg: 1024px viewport) */}
          <div className="block lg:hidden bg-slate-50/70 p-2 min-[280px]:p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
            {filteredDonations.length === 0 ? (
              <div className="py-10 text-center text-slate-400 font-semibold text-xs bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm md:col-span-2">
                No matching donations found. Try resetting search/filters.
              </div>
            ) : (
              filteredDonations.map((d) => (
                <div 
                  key={d._id} 
                  className="bg-white rounded-2xl border border-slate-200/90 p-2.5 min-[280px]:p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5 sm:space-y-3">
                    {/* Header Row: Donor Info & Status Badge */}
                    <div className="flex flex-wrap items-start justify-between gap-1.5 min-[320px]:gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Donor</span>
                        <div className="font-extrabold text-slate-900 text-xs min-[280px]:text-sm leading-tight truncate">{d.donorName}</div>
                        <div className="text-[9px] min-[280px]:text-[10px] text-slate-400 font-semibold break-all mt-0.5 leading-tight">{d.email}</div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] min-[280px]:text-[9px] font-extrabold border uppercase tracking-wider shrink-0 ${
                        d.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' :
                        d.status === 'approved' ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80' :
                        d.status === 'verified' ? 'bg-cyan-50 text-cyan-700 border-cyan-200/80' :
                        'bg-amber-50 text-amber-700 border-amber-200/80'
                      }`}>
                        <span>{d.status}</span>
                      </span>
                    </div>

                    {/* Campaign Supported */}
                    <div className="bg-slate-50/80 rounded-xl p-2 min-[280px]:p-2.5 border border-slate-200/60 space-y-1">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Campaign Supported</span>
                        <div className="font-bold text-slate-800 text-[10px] min-[280px]:text-xs line-clamp-2">
                          {d.campaignId ? d.campaignId.title : <span className="text-rose-500 font-bold italic">Deleted Campaign</span>}
                        </div>
                      </div>

                      {d.message && (
                        <div className="text-[9px] min-[280px]:text-[10px] italic text-slate-500 pt-1 border-t border-slate-200/60">
                          💬 "{d.message}"
                        </div>
                      )}
                    </div>

                    {/* Contribution Value Badge */}
                    <div className="flex flex-col min-[350px]:flex-row items-start min-[350px]:items-center justify-between gap-1 pt-0.5">
                      <span className="text-[9px] min-[280px]:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contribution</span>
                      <div className="font-black text-slate-900 text-xs sm:text-sm">
                        {d.donationType === 'item' ? (
                          <span className="text-indigo-600 font-extrabold text-[10px] min-[280px]:text-xs bg-indigo-50 px-2 py-0.5 min-[280px]:px-2.5 min-[280px]:py-1 rounded-lg border border-indigo-100">
                            {d.quantity} {d.quantityUnit} ({d.itemCategory})
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-black text-xs sm:text-sm bg-emerald-50 px-2 py-0.5 min-[280px]:px-2.5 min-[280px]:py-1 rounded-lg border border-emerald-100">
                            ₹{d.amount.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Selector & PDF Receipt Footer */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5 mt-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Update Status & Receipt</label>
                    <div className="flex flex-col gap-2">
                      <select
                        value={d.status}
                        disabled={updatingDonationIds.includes(d._id)}
                        onChange={(e) => handleStatusChange(d._id, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-1.5 px-3 rounded-xl font-bold text-[10px] min-[280px]:text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer disabled:opacity-60 shadow-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="approved">Approved</option>
                        <option value="completed">Completed</option>
                      </select>

                      <div className="flex items-center gap-1.5 w-full">
                        {d.donationType === 'item' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDonationForTracking(d);
                              setCourierName(d.courierName || '');
                              setCourierPhone(d.courierPhone || '');
                              setTrackingStatus(d.status);
                              setTrackingNote('');
                              setIsLogisticsModalOpen(true);
                            }}
                            className="flex-1 py-1.5 px-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 font-bold text-[10px] min-[280px]:text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shrink-0 shadow-sm"
                            title="Update courier pickup tracking notes"
                          >
                            <span>Logistics</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => generate80GReceipt(d, d.campaignId ? d.campaignId.title : 'GiveHope Cause')}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 font-bold text-[10px] min-[280px]:text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shrink-0 shadow-sm"
                          title="Download 80G PDF Receipt"
                        >
                          <Download className="h-3 w-3 min-[280px]:h-3.5 min-[280px]:w-3.5" />
                          <span>80G Receipt</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 2. Desktop Table view (shown from lg: 1024px viewport onwards) */}
          <div className="hidden lg:block w-full max-w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-5">Donor Details</th>
                  <th className="py-4 px-5">Campaign</th>
                  <th className="py-4 px-5">Amount</th>
                  <th className="py-4 px-5">Status Badge</th>
                  <th className="py-4 px-5 text-center">Manage & Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400 font-semibold">
                      No matching donations found in giving records. Try clearing search or status filters.
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-5 min-w-[200px]">
                        <div className="font-bold text-slate-800">{d.donorName}</div>
                        <div className="text-xs text-slate-400 font-semibold">{d.email}</div>
                        {d.message && (
                          <div className="text-xs italic text-slate-400 mt-1 max-w-[240px] truncate" title={d.message}>
                            "{d.message}"
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-5 font-semibold text-slate-700 min-w-[180px]">
                        {d.campaignId ? d.campaignId.title : <span className="text-rose-500 font-bold italic">Deleted Campaign</span>}
                      </td>
                      <td className="py-4 px-5 font-extrabold text-slate-900 whitespace-nowrap">
                        {d.donationType === 'item' ? (
                          <div className="flex flex-col">
                            <span className="text-indigo-600 font-extrabold uppercase text-[11px] tracking-wider leading-none mb-1">
                              {d.quantity} {d.quantityUnit}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                              {d.itemCategory} Donation
                            </span>
                          </div>
                        ) : (
                          `₹${d.amount.toLocaleString('en-IN')}`
                        )}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                          d.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          d.status === 'approved' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                          d.status === 'verified' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {d.status === 'completed' && <Check className="h-3.5 w-3.5" />}
                          {d.status === 'pending' && <Clock className="h-3.5 w-3.5" />}
                          <span>{d.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-5 text-center min-w-[160px] min-[1280px]:min-w-[280px]">
                        <div className="flex flex-col min-[1280px]:flex-row items-stretch min-[1280px]:items-center justify-center gap-1.5 max-w-[280px] min-[1280px]:max-w-none mx-auto">
                          <select
                            value={d.status}
                            disabled={updatingDonationIds.includes(d._id)}
                            onChange={(e) => handleStatusChange(d._id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-3 rounded-xl font-semibold text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer disabled:opacity-60 w-full min-[1280px]:w-auto text-center"
                          >
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="approved">Approved</option>
                            <option value="completed">Completed</option>
                          </select>

                          <div className="flex items-center gap-1.5 w-full min-[1280px]:w-auto justify-center">
                            {d.donationType === 'item' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDonationForTracking(d);
                                  setCourierName(d.courierName || '');
                                  setCourierPhone(d.courierPhone || '');
                                  setTrackingStatus(d.status);
                                  setTrackingNote('');
                                  setIsLogisticsModalOpen(true);
                                }}
                                className="flex-1 min-[1280px]:flex-none p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shrink-0"
                                title="Manage Logistics Tracking"
                              >
                                <span>Logistics</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => generate80GReceipt(d, d.campaignId ? d.campaignId.title : 'GiveHope Cause')}
                              className="flex-1 min-[1280px]:flex-none p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shrink-0"
                              title="Download 80G Tax Exemption PDF Receipt"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>80G Receipt</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CAMPAIGN CRUD DIALOG MODAL */}
      <AnimatePresence>
        {isCampaignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-2 min-[300px]:p-4 bg-slate-950/40 backdrop-blur-sm">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCampaignModalOpen(false)}
              className="absolute inset-0"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 }}
              className="bg-white border border-slate-100 w-full max-w-xl rounded-2xl min-[280px]:rounded-3xl shadow-xl shadow-slate-955/5 p-3 min-[300px]:p-6 sm:p-8 relative z-10 overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg min-[280px]:text-xl font-extrabold text-slate-900">
                  {modalType === 'create' ? 'Create New Cause' : 'Edit Campaign Details'}
                </h4>
                <button
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4.5 p-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs sm:text-sm font-bold flex items-center gap-1.5">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCampaignSubmit} className="space-y-4">
                
                {/* Title */}
                <div className="space-y-1.5">
                  <label htmlFor="campaign-title" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Campaign Title</label>
                  <input
                    type="text"
                    id="campaign-title"
                    name="title"
                    required
                    disabled={formSubmitting}
                    placeholder="e.g. Clean Drinking Water for Rural Schools"
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl min-[280px]:rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300"
                  />
                </div>

                {/* Grid Category & Goal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label htmlFor="campaign-category" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</label>
                    <select
                      id="campaign-category"
                      name="category"
                      value={campaignCategory}
                      onChange={(e) => setCampaignCategory(e.target.value)}
                      disabled={formSubmitting}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl min-[280px]:rounded-2xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 cursor-pointer"
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Goal */}
                  <div className="space-y-1.5">
                    <label htmlFor="campaign-goal" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Funding Goal (₹)</label>
                    <input
                      type="number"
                      id="campaign-goal"
                      name="goal"
                      required
                      min="1"
                      disabled={formSubmitting}
                      placeholder="e.g. 15000"
                      value={campaignGoal}
                      onChange={(e) => setCampaignGoal(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl min-[280px]:rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300"
                    />
                  </div>

                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label htmlFor="campaign-description" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</label>
                  <textarea
                    required
                    id="campaign-description"
                    name="description"
                    rows={4}
                    disabled={formSubmitting}
                    placeholder="Provide a detailed summary describing this campaign cause..."
                    value={campaignDescription}
                    onChange={(e) => setCampaignDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl min-[280px]:rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 resize-none"
                  />
                </div>

                {/* Image URL */}
                <div className="space-y-1.5">
                  <label htmlFor="campaign-image" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cover Image URL</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-3 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="url"
                      id="campaign-image"
                      name="image"
                      required
                      disabled={formSubmitting}
                      placeholder="https://images.unsplash.com/photo-..."
                      value={campaignImage}
                      onChange={(e) => setCampaignImage(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl min-[280px]:rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsCampaignModalOpen(false)}
                    disabled={formSubmitting}
                    className="py-2 px-4 bg-slate-100 hover:bg-slate-200/80 active:scale-95 text-slate-700 font-bold text-xs min-[280px]:text-sm rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="py-2 px-4.5 bg-indigo-600 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-100 active:scale-95 text-white font-bold text-xs min-[280px]:text-sm rounded-xl transition-all duration-300 disabled:opacity-80"
                  >
                    {formSubmitting ? 'Saving...' : modalType === 'create' ? 'Create' : 'Save'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOGISTICS TRACKING MODAL */}
      <AnimatePresence>
        {isLogisticsModalOpen && selectedDonationForTracking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-2 bg-slate-955/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogisticsModalOpen(false)}
              className="absolute inset-0"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 }}
              className="bg-white border border-slate-100 w-full max-w-md rounded-3xl shadow-xl p-6 relative z-10 overflow-hidden flex flex-col animate-in fade-in duration-350"
            >
              <div className="flex justify-between items-center mb-5">
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Update Logistics Tracking
                </h4>
                <button
                  type="button"
                  onClick={() => setIsLogisticsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleTrackingSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="courier-name" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Courier Agent Name</label>
                  <input
                    type="text"
                    id="courier-name"
                    required
                    disabled={trackingSubmitting}
                    placeholder="e.g. FedEx Agent John"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="courier-phone" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Courier Agent Phone</label>
                  <input
                    type="tel"
                    id="courier-phone"
                    required
                    maxLength={10}
                    disabled={trackingSubmitting}
                    placeholder="e.g. 9876543210"
                    value={courierPhone}
                    onChange={(e) => setCourierPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="tracking-status" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tracking Step Status</label>
                  <select
                    id="tracking-status"
                    value={trackingStatus}
                    onChange={(e) => setTrackingStatus(e.target.value)}
                    disabled={trackingSubmitting}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 cursor-pointer"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="verified">Verified</option>
                    <option value="approved">Approved & Scheduled</option>
                    <option value="dispatched">Dispatched for Pickup</option>
                    <option value="picked_up">Picked Up from Address</option>
                    <option value="received">Received at WareHouse</option>
                    <option value="completed">Delivered & Complete</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="tracking-note" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tracking Milestone Note</label>
                  <textarea
                    id="tracking-note"
                    rows={3}
                    disabled={trackingSubmitting}
                    placeholder="e.g. Driver John is dispatched to pickup address."
                    value={trackingNote}
                    onChange={(e) => setTrackingNote(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-300 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsLogisticsModalOpen(false)}
                    disabled={trackingSubmitting}
                    className="py-2 px-4 bg-slate-100 hover:bg-slate-200/80 active:scale-95 text-slate-700 font-bold text-xs rounded-xl transition-all duration-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={trackingSubmitting}
                    className="py-2 px-4.5 bg-indigo-600 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-100 active:scale-95 text-white font-bold text-xs rounded-xl transition-all duration-300 disabled:opacity-80 cursor-pointer"
                  >
                    {trackingSubmitting ? 'Updating...' : 'Update Details'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
