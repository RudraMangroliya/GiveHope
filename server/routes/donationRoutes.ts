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
      pickupTime
    } = req.body;
    
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
      pickupTime
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

// GET user-specific donations (Supporter View)
router.get('/my-donations', protect, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Retrieve user's email from the DB using user ID from protected request context
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const donations = await Donation.find({ email: user.email })
      .populate('campaignId', 'title image')
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

// PUT update donation status (Admin Only)
router.put('/:id/status', protect, authorizeAdmin, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'verified', 'approved', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value. Must be pending, verified, approved, or completed' });
    }

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('campaignId', 'title');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.json(donation);
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;
