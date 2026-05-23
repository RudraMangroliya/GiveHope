import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  title: string;
  description: string;
  category: string;
  goal: number;
  raised: number;
  image: string;
}

const CampaignSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  goal: { type: Number, required: true },
  raised: { type: Number, default: 0 },
  image: { type: String, required: true },
});

export default mongoose.model<ICampaign>('Campaign', CampaignSchema);
