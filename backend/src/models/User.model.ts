import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  avatarUrl?: string;
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
    email: { type: String, required: true, unique: true, lowercase: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    avatarUrl: String,
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

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
