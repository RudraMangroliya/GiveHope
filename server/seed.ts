import mongoose from 'mongoose';
import Campaign from './models/Campaign';
import User from './models/User';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/donation_app';

const categories = ['Education', 'Health', 'Environment', 'Disaster Relief', 'Community', 'Animal Welfare'];
const adjectives = ['Global', 'Local', 'Urgent', 'Community', 'Empowering', 'Sustainable', 'Hope', 'Brighter'];
const nouns = ['Initiative', 'Fund', 'Project', 'Program', 'Alliance', 'Network', 'Movement'];

const generateTitle = (category: string) => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${category} ${noun}`;
};

const generateDescription = (category: string) => {
  return `Help us make a difference by supporting this vital ${category.toLowerCase()} cause. Your contribution directly impacts those in need and helps build a better future for everyone involved.`;
};

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Seed Campaigns
    await Campaign.deleteMany({});
    console.log('Cleared existing campaigns');

    const campaigns = Array.from({ length: 30 }).map((_, index) => {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const goal = Math.floor(Math.random() * 90000) + 10000; // Between 10k and 100k
      const raised = Math.floor(Math.random() * goal); // Between 0 and goal
      
      return {
        title: generateTitle(category),
        description: generateDescription(category),
        category,
        goal,
        raised,
        image: `https://picsum.photos/seed/${index + 100}/600/400`,
      };
    });

    await Campaign.insertMany(campaigns);
    console.log(`Successfully seeded ${campaigns.length} campaigns!`);

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
