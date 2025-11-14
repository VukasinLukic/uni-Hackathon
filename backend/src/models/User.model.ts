import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  auth0Id: string;
  email: string;
  name?: string;
  role: 'driver' | 'official' | 'admin';
  stats: {
    totalReports: number;
    confirmedPotholes: number;
    points: number;
  };
}

const UserSchema = new Schema<IUser>(
  {
    auth0Id: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: String,
    role: {
      type: String,
      enum: ['driver', 'official', 'admin'],
      default: 'driver',
    },
    stats: {
      totalReports: { type: Number, default: 0 },
      confirmedPotholes: { type: Number, default: 0 },
      points: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
