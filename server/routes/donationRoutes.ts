import express from 'express';
import Donation from '../models/Donation';
import Campaign from '../models/Campaign';
import User from '../models/User';
import { protect, authorizeAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// POST a new donation (Public)
router.post('/', async (req, res) => {
  try {
    const { 
      campaignId, 
      donorName, 
      email, 
      amount, 
      message,
      donationType,
      itemCategory,
      quantity,
      quantityUnit,
      pickupType,
      pickupAddress,
      pickupPhone,
      pickupTime,
      recurringType
    } = req.body;
    
    // Set initial timeline for item tracking if it is an item donation
    const initialTimeline = donationType === 'item' ? [{
      status: 'pending',
      note: `Donation registered for ${pickupType === 'pickup' ? 'home pickup' : 'self drop-off'}.`,
      timestamp: new Date()
    }] : [];

    const donation = new Donation({
      campaignId,
      donorName,
      email,
      amount: donationType === 'item' ? 0 : (amount || 0),
      message,
      donationType: donationType || 'money',
      itemCategory,
      quantity,
      quantityUnit,
      pickupType,
      pickupAddress,
      pickupPhone,
      pickupTime,
      recurringType: recurringType || 'once',
      isActiveSubscription: recurringType && recurringType !== 'once' ? true : undefined,
      trackingTimeline: initialTimeline
    });

    await donation.save();
    
    // Update campaign raised amount (only for money donations)
    if (donation.donationType === 'money' && donation.amount > 0) {
      await Campaign.findByIdAndUpdate(campaignId, { $inc: { raised: donation.amount } });
    }

    res.status(201).json({ message: 'Donation successful', donation });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// GET dashboard stats (Protected, Admin-only)
router.get('/stats', protect, authorizeAdmin, async (req: AuthRequest, res) => {
  try {
    const totalCampaigns = await Campaign.countDocuments();
    const donations = await Donation.find();
    
    const totalRaised = donations
      .filter(d => d.donationType !== 'item')
      .reduce((sum, d) => sum + d.amount, 0);
    
    const totalItems = donations
      .filter(d => d.donationType === 'item')
      .reduce((sum, d) => sum + (d.quantity || 0), 0);
    
    // Category aggregation
    const campaigns = await Campaign.find();
    const categoryMap: { [cat: string]: number } = {};
    const categoryGoalMap: { [cat: string]: number } = {};
    campaigns.forEach(c => {
      categoryMap[c.category] = (categoryMap[c.category] || 0) + c.raised;
      categoryGoalMap[c.category] = (categoryGoalMap[c.category] || 0) + c.goal;
    });
    
    const categoryData = Object.keys(categoryMap).map(cat => ({
      category: cat,
      raised: categoryMap[cat],
      goal: categoryGoalMap[cat]
    }));
    
    // Monthly aggregation for last 6 months
    const monthlyData: { [month: string]: number } = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyData[label] = 0;
    }
    
    donations.forEach(d => {
      if (d.donationType !== 'item' && d.date) {
        const date = new Date(d.date);
        const label = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
        if (monthlyData[label] !== undefined) {
          monthlyData[label] += d.amount;
        }
      }
    });
    
    const monthlyChart = Object.keys(monthlyData).map(m => ({
      month: m,
      amount: monthlyData[m]
    }));
    
    res.json({
      totalCampaigns,
      totalDonations: donations.length,
      totalRaised,
      totalItems,
      categoryData,
      monthlyChart
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server/Stats Error', error: error.message });
  }
});

// GET leaderboard (Public/Registered)
router.get('/leaderboard', async (req, res) => {
  try {
    const donations = await Donation.find();
    
    // Group donations by email
    const userGroups: { [email: string]: { name: string, email: string, amount: number, items: number, campaigns: Set<string> } } = {};
    
    for (const d of donations) {
      const email = d.email.toLowerCase().trim();
      if (!userGroups[email]) {
        userGroups[email] = {
          name: d.donorName,
          email: email,
          amount: 0,
          items: 0,
          campaigns: new Set()
        };
      }
      
      if (d.donationType === 'item') {
        userGroups[email].items += (d.quantity || 0);
      } else {
        userGroups[email].amount += d.amount;
      }
      
      if (d.campaignId) {
        userGroups[email].campaigns.add(d.campaignId.toString());
      }
    }
    
    // Fetch privacy settings from User model
    const emailsList = Object.keys(userGroups);
    const dbUsers = await User.find({ email: { $in: emailsList } });
    const anonPreferences: { [email: string]: boolean } = {};
    
    dbUsers.forEach(u => {
      anonPreferences[u.email.toLowerCase()] = u.isAnonymous || false;
    });
    
    // Map groups to row summaries and compute badges
    const leaderboardData = Object.values(userGroups).map(g => {
      const isAnon = anonPreferences[g.email] || false;
      const badges: string[] = [];
      
      if (g.amount > 0) badges.push('Hope Starter 🌟');
      if (g.amount >= 1000 && g.amount < 10000) badges.push('Angel Donor 👼');
      if (g.amount >= 10000) badges.push('Philanthropist 👑');
      if (g.items > 0) badges.push('Generous Hands 🤝');
      if (g.campaigns.size >= 3) badges.push('Impact Champion 🏆');
      
      return {
        name: isAnon ? 'Anonymous Supporter' : g.name,
        amount: g.amount,
        items: g.items,
        campaignsCount: g.campaigns.size,
        badges
      };
    });
    
    // Sort by monetary contribution first, then item quantity
    leaderboardData.sort((a, b) => {
      if (b.amount !== a.amount) {
        return b.amount - a.amount;
      }
      return b.items - a.items;
    });
    
    res.json(leaderboardData.slice(0, 15));
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// GET user-specific donations (Supporter View)
router.get('/my-donations', protect, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const donations = await Donation.find({ email: user.email })
      .populate('campaignId', 'title image category')
      .sort({ date: -1 });

    res.json(donations);
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// GET all donations (Admin Only)
router.get('/', protect, authorizeAdmin, async (req: AuthRequest, res) => {
  try {
    const donations = await Donation.find()
      .populate('campaignId', 'title')
      .sort({ date: -1 });
    res.json(donations);
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// PUT cancel recurring donation (Protected, User-only)
router.put('/:id/cancel-recurring', protect, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.email.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(403).json({ message: 'You can only cancel your own subscription pledges' });
    }

    donation.isActiveSubscription = false;
    await donation.save();

    res.json({ message: 'Recurring pledge successfully cancelled', donation });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// PUT update donation status (Admin Only)
router.put('/:id/status', protect, authorizeAdmin, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'verified', 'approved', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value. Must be pending, verified, approved, or completed' });
    }

    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    donation.status = status;
    
    // Add tracking step automatically if it is an item donation
    if (donation.donationType === 'item') {
      if (!donation.trackingTimeline) donation.trackingTimeline = [];
      donation.trackingTimeline.push({
        status,
        note: `Donation status updated to ${status} by admin.`,
        timestamp: new Date()
      });
    }

    await donation.save();
    
    const populated = await Donation.findById(donation._id).populate('campaignId', 'title');
    res.json(populated);
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// PUT update courier and tracking (Protected, Admin-only)
router.put('/:id/tracking', protect, authorizeAdmin, async (req: AuthRequest, res) => {
  try {
    const { courierName, courierPhone, status, note } = req.body;
    
    const donation = await Donation.findById(req.params.id).populate('campaignId', 'title');
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (courierName !== undefined) donation.courierName = courierName;
    if (courierPhone !== undefined) donation.courierPhone = courierPhone;
    
    if (status) {
      if (['pending', 'verified', 'approved', 'completed'].includes(status)) {
        donation.status = status as any;
      }
      
      if (!donation.trackingTimeline) {
        donation.trackingTimeline = [];
      }
      donation.trackingTimeline.push({
        status,
        note: note || `Donation tracking milestone: ${status}`,
        timestamp: new Date()
      });
    }

    await donation.save();
    res.json({ message: 'Tracking details updated', donation });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;
