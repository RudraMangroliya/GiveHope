import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, X, Filter } from 'lucide-react';
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

const Home = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/campaigns`);
        setCampaigns(res.data);
      } catch (error) {
        console.error('Failed to fetch campaigns', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const categories = ['All', 'Education', 'Health', 'Environment', 'Disaster Relief', 'Community', 'Animal Welfare'];

  // Real-time Filtering logic
  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = 
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'All' || 
      campaign.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  if (loading) {
    return <LoadingState message="Loading active campaigns..." height="h-64" />;
  }

  return (
    <div className="py-2 sm:py-6">
      
      {/* Title Header Banner */}
      <div className="text-center mb-8 sm:mb-12 mt-2 sm:mt-6 px-2">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight"
        >
          Make a Difference Today
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-3 text-base sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
        >
          Choose a campaign below and help us bring hope to those who need it most.
        </motion.p>
      </div>

      {/* Dynamic Search & Filtering Panel */}
      <div className="max-w-4xl mx-auto mb-10 px-4 space-y-6">
        
        {/* Search input bar */}
        <div className="relative flex items-center bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300">
          <Search className="absolute left-4.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            id="campaign-search"
            name="campaign-search"
            placeholder="Search campaigns by cause or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 bg-transparent rounded-2xl text-sm outline-none text-slate-800 placeholder-slate-400 font-semibold"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Pills Slider */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter by Category</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {categories.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`py-2 px-4 rounded-full text-xs font-bold transition-all duration-300 active:scale-95 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-100 hover:bg-slate-50/50'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

      </div>
 
      {/* Campaigns Listing Grid */}
      <AnimatePresence mode="popLayout">
        {filteredCampaigns.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center py-16 bg-white border border-slate-100 rounded-3xl max-w-lg mx-auto shadow-sm px-6"
          >
            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto mb-4 border border-slate-100">
              <Search className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-lg mb-1.5">No Campaigns Found</h4>
            <p className="text-slate-400 text-sm font-semibold mb-6">
              We couldn't find any campaigns matching your query or selected filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="py-2.5 px-5 bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-100 text-indigo-600 font-bold text-xs rounded-xl active:scale-95 transition-all"
            >
              Clear All Filters
            </button>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8"
          >
            {filteredCampaigns.map((campaign) => {
              const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);
              
              return (
                <motion.div
                  layout
                  key={campaign._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.01,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                    transition: { duration: 0.2 } 
                  }}
                  className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col h-full"
                >
                  <div className="relative h-40 sm:h-48 overflow-hidden group">
                    <img 
                      src={campaign.image} 
                      alt={campaign.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-indigo-600">
                      {campaign.category}
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6 flex-1 flex flex-col">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">{campaign.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 flex-1 mb-4 sm:mb-6 line-clamp-3 leading-relaxed">{campaign.description}</p>
                    
                    <div className="mb-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 text-xs sm:text-sm mb-2">
                        <span className="font-semibold text-gray-700">₹{campaign.raised.toLocaleString()} raised</span>
                        <span className="text-gray-400 font-medium">of ₹{campaign.goal.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/donate/${campaign._id}`)}
                      className="w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 relative overflow-hidden group"
                    >
                      <span className="relative z-10">Donate Now</span>
                      <div className="absolute inset-0 h-full w-full bg-indigo-700 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out z-0"></div>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
