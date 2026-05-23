import express from 'express';
import Campaign from '../models/Campaign';
import { protect, authorizeAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET all campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET single campaign details by ID
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST a new campaign (Admin Only)
router.post('/', protect, authorizeAdmin, async (req: AuthRequest, res) => {
  try {
    const { title, description, category, goal, raised, image } = req.body;
    
    if (!title || !description || !category || !goal || !image) {
      return res.status(400).json({ message: 'Please provide all required campaign details' });
    }

    const campaign = new Campaign({
      title,
      description,
      category,
      goal,
      raised: raised || 0,
      image,
    });

    await campaign.save();
    res.status(201).json(campaign);
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// PUT (Update) a campaign details (Admin Only)
router.put('/:id', protect, authorizeAdmin, async (req: AuthRequest, res) => {
  try {
    const { title, description, category, goal, raised, image } = req.body;
    
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { title, description, category, goal, raised, image },
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// DELETE a campaign (Admin Only)
router.delete('/:id', protect, authorizeAdmin, async (req: AuthRequest, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;
