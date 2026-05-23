import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, Check, Clock, Shield, AlertCircle, 
  TrendingUp, Heart, Award, RefreshCw, X, Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import LoadingState from '../components/LoadingState';
import { API_BASE_URL } from '../config';

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
  status: 'pending' | 'verified' | 'approved' | 'completed';
  date: string;
  donationType?: 'money' | 'item';
  itemCategory?: string;
  quantity?: number;
  quantityUnit?: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'donations'>('campaigns');
  
  // Data States
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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
    <div className="py-2 sm:py-6 max-w-7xl mx-auto px-2 min-[280px]:px-4">
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

      {/* Tabs Layout Switcher */}
      <div className="border-b border-slate-100 flex flex-col min-[340px]:flex-row items-stretch min-[340px]:items-center gap-1 min-[340px]:gap-4 mb-6 sm:mb-8">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`py-2 min-[340px]:py-3 font-bold text-xs min-[280px]:text-sm sm:text-base border-b-2 text-center transition-all duration-300 ${
            activeTab === 'campaigns'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Manage Campaigns
        </button>
        <button
          onClick={() => setActiveTab('donations')}
          className={`py-2 min-[340px]:py-3 font-bold text-xs min-[280px]:text-sm sm:text-base border-b-2 text-center transition-all duration-300 ${
            activeTab === 'donations'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Donations Status Tracker
        </button>
      </div>

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
        <div className="bg-white border border-slate-100 rounded-2xl min-[280px]:rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">Donation Ledger</h3>
          </div>
          
          {/* Hybrid Layout: Mobile Cards vs Desktop Table */}
          
          {/* 1. Mobile Cards view (shown under sm: 640px viewport) */}
          <div className="block sm:hidden divide-y divide-slate-100">
            {donations.length === 0 ? (
              <div className="py-10 text-center text-slate-400 font-semibold text-xs min-[280px]:text-sm">
                No donations registered in giving records.
              </div>
            ) : (
              donations.map((d) => (
                <div key={d._id} className="p-3.5 min-[280px]:p-4 space-y-3">
                  {/* Donor details block */}
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Donor</span>
                    <div className="font-bold text-slate-800 text-sm">{d.donorName}</div>
                    <div className="text-[10px] min-[280px]:text-xs text-slate-400 font-semibold break-all">{d.email}</div>
                    {d.message && (
                      <div className="text-[10px] min-[280px]:text-xs italic text-slate-400 mt-1 pl-2 border-l-2 border-slate-150">
                        "{d.message}"
                      </div>
                    )}
                  </div>

                  {/* Campaign details block */}
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Campaign</span>
                    <div className="font-bold text-slate-700 text-xs line-clamp-2">
                      {d.campaignId ? d.campaignId.title : <span className="text-rose-500 font-bold italic">Deleted Campaign</span>}
                    </div>
                  </div>

                  {/* Amount & Status side-by-side flex */}
                  <div className="flex justify-between items-center gap-2 pt-1">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Contribution</span>
                      <div className="font-black text-slate-900 text-xs sm:text-sm">
                        {d.donationType === 'item' ? (
                          <span className="text-indigo-600 font-extrabold uppercase text-[10px] tracking-wide block">
                            {d.quantity} {d.quantityUnit} ({d.itemCategory})
                          </span>
                        ) : (
                          `₹${d.amount.toLocaleString()}`
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 text-right">Status</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${
                        d.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        d.status === 'approved' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                        d.status === 'verified' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        <span>{d.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Selector */}
                  <div className="pt-2.5 border-t border-slate-100">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Update Status Timeline</label>
                    <select
                      value={d.status}
                      disabled={updatingDonationIds.includes(d._id)}
                      onChange={(e) => handleStatusChange(d._id, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer disabled:opacity-60"
                    >
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="approved">Approved</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 2. Desktop Table view (shown from sm: 640px viewport onwards) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6">Donor Details</th>
                  <th className="py-4 px-6">Campaign</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status Badge</th>
                  <th className="py-4 px-6 text-center">Manage Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400 font-semibold">
                      No donations registered in giving records.
                    </td>
                  </tr>
                ) : (
                  donations.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 min-w-[200px]">
                        <div className="font-bold text-slate-800">{d.donorName}</div>
                        <div className="text-xs text-slate-400 font-semibold">{d.email}</div>
                        {d.message && (
                          <div className="text-xs italic text-slate-400 mt-1 max-w-[250px] truncate" title={d.message}>
                            "{d.message}"
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-700 min-w-[180px]">
                        {d.campaignId ? d.campaignId.title : <span className="text-rose-500 font-bold italic">Deleted Campaign</span>}
                      </td>
                      <td className="py-4 px-6 font-extrabold text-slate-900">
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
                          `₹${d.amount.toLocaleString()}`
                        )}
                      </td>
                      <td className="py-4 px-6">
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
                      <td className="py-4 px-6 text-center min-w-[220px]">
                        <div className="flex items-center justify-center gap-1.5">
                          <select
                            value={d.status}
                            disabled={updatingDonationIds.includes(d._id)}
                            onChange={(e) => handleStatusChange(d._id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-3 rounded-xl font-semibold text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer disabled:opacity-60"
                          >
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="approved">Approved</option>
                            <option value="completed">Completed</option>
                          </select>
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
    </div>
  );
}
