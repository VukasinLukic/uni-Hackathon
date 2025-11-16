import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  auth0Id?: string; // Auth0 user ID (optional for backward compatibility)
  email: string;
  username: string;
  password?: string; // Optional for Auth0 users
  licensePlate?: string; // License plate as username (for mobile users)
  avatarUrl?: string;
  avatarNumber?: number; // 1-5 for predefined avatars
  name?: string;
  bio?: string;
  phone?: string;
  role: 'driver' | 'official' | 'admin';


  // Gamification fields
  level: number;
  currentXP: number;
  totalXP: number;

  stats: {
    distanceDriven: number; // in km
    potholesDetected: number;
    cellsExplored: number;
    explorationPercentage: number;
    totalReports: number;
    confirmedPotholes: number;
  };

  settings: {
    notifications: boolean;
    sensitivity: 'low' | 'medium' | 'high';
  };

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    auth0Id: { type: String, unique: true, sparse: true }, // Auth0 user ID
    email: { type: String, required: true, unique: true, lowercase: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, select: false }, // Not required for Auth0 users
    licensePlate: { type: String, uppercase: true }, // License plate as username
    avatarUrl: String,
    avatarNumber: { type: Number, min: 1, max: 5 }, // 1-5 predefined avatars
    name: String,
    bio: String,
    phone: String,
    role: {
      type: String,
      enum: ['driver', 'official', 'admin'],
      default: 'driver',
    },

    // Gamification
    level: { type: Number, default: 1 },
    currentXP: { type: Number, default: 0 },
    totalXP: { type: Number, default: 0 },

    stats: {
      distanceDriven: { type: Number, default: 0 },
      potholesDetected: { type: Number, default: 0 },
      cellsExplored: { type: Number, default: 0 },
      explorationPercentage: { type: Number, default: 0 },
      totalReports: { type: Number, default: 0 },
      confirmedPotholes: { type: Number, default: 0 },
    },

    settings: {
      notifications: { type: Boolean, default: true },
      sensitivity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving (only for non-Auth0 users)
UserSchema.pre('save', async function (next) {
  // Skip password hashing for Auth0 users
  if (!this.password || !this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  // If no password (Auth0 user), return false
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
