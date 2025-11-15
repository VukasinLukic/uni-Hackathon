import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'distance' | 'reports' | 'exploration' | 'streak' | 'special';
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt: Date;
  progress?: {
    current: number;
    target: number;
  };
}

const AchievementSchema = new Schema<IAchievement>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['distance', 'reports', 'exploration', 'streak', 'special'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    xpReward: {
      type: Number,
      required: true,
      default: 100,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
    progress: {
      current: { type: Number },
      target: { type: Number },
    },
  },
  { timestamps: true }
);

// Index for efficient user achievement queries
AchievementSchema.index({ userId: 1, unlockedAt: -1 });
AchievementSchema.index({ userId: 1, type: 1 });

export const Achievement = mongoose.model<IAchievement>(
  'Achievement',
  AchievementSchema
);
