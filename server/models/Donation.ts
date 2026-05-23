import mongoose, { Schema, Document } from 'mongoose';

export interface IDonation extends Document {
  campaignId: mongoose.Types.ObjectId;
  donorName: string;
  email: string;
  amount: number;
  message?: string;
  status: 'pending' | 'verified' | 'approved' | 'completed';
  date: Date;
  // Item Donation Support
  donationType: 'money' | 'item';
  itemCategory?: string;
  quantity?: number;
  quantityUnit?: string;
  pickupType?: 'dropoff' | 'pickup';
  pickupAddress?: string;
  pickupPhone?: string;
  pickupTime?: string;
}

const DonationSchema: Schema = new Schema({
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  donorName: { type: String, required: true },
  email: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
  message: { type: String },
  status: { type: String, enum: ['pending', 'verified', 'approved', 'completed'], default: 'pending' },
  date: { type: Date, default: Date.now },
  // Item fields
  donationType: { type: String, enum: ['money', 'item'], default: 'money' },
  itemCategory: { type: String },
  quantity: { type: Number },
  quantityUnit: { type: String },
  pickupType: { type: String, enum: ['dropoff', 'pickup'] },
  pickupAddress: { type: String },
  pickupPhone: { type: String },
  pickupTime: { type: String },
});

export default mongoose.model<IDonation>('Donation', DonationSchema);
