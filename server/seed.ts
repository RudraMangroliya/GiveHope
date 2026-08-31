import mongoose from 'mongoose';
import Campaign from './models/Campaign';
import User from './models/User';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/donation_app';

const categories = ['Education', 'Health', 'Environment', 'Disaster Relief', 'Community', 'Animal Welfare'];
const adjectives = ['Global', 'Local', 'Urgent', 'Community', 'Empowering', 'Sustainable', 'Hope', 'Brighter', 'Action', 'Future'];
const nouns = ['Initiative', 'Fund', 'Project', 'Program', 'Alliance', 'Network', 'Movement', 'Drive', 'Mission'];

const generateTitle = (category: string, index: number) => {
  const adj = adjectives[index % adjectives.length];
  const noun = nouns[(index * 2) % nouns.length];
  return `${adj} ${category} ${noun}`;
};

const generateDescription = (category: string) => {
  return `Help us make a difference by supporting this vital ${category.toLowerCase()} cause. Your contribution directly impacts those in need and helps build a better future for everyone involved.`;
};

const categoryImages: Record<string, string[]> = {
  Education: [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
  ],
  Health: [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
  ],
  Environment: [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511497584788-8767611136f6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
  ],
  'Disaster Relief': [
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?auto=format&fit=crop&w=800&q=80',
  ],
  Community: [
    'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80',
  ],
  'Animal Welfare': [
    'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
  ],
};

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Seed Campaigns
    await Campaign.deleteMany({});
    console.log('Cleared existing campaigns');

    const campaigns = Array.from({ length: 30 }).map((_, index) => {
      const category = categories[index % categories.length];
      const goal = Math.floor(Math.random() * 90000) + 10000; // Between 10k and 100k
      const raised = Math.floor(Math.random() * goal); // Between 0 and goal
      
      const imgList = categoryImages[category] || [];
      const imageIndex = Math.floor(index / categories.length) % imgList.length;
      const image = imgList[imageIndex] || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80';

      return {
        title: generateTitle(category, index),
        description: generateDescription(category),
        category,
        goal,
        raised,
        image,
      };
    });

    await Campaign.insertMany(campaigns);
    console.log(`Successfully seeded ${campaigns.length} unique campaigns with unique images!`);

    // 2. Seed Default Admin
    await User.deleteMany({ email: 'admin@givehope.com' });
    
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash('admin123', salt);

    await User.create({
      name: 'GiveHope Admin',
      email: 'admin@givehope.com',
      password: hashedPassword,
      role: 'admin',
    });
    console.log('Successfully seeded default administrator user: admin@givehope.com');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
