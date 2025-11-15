import mongoose, { Schema, Document } from 'mongoose';

export interface IReward extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'milestone' | 'achievement' | 'streak' | 'daily' | 'special';
  title: string;
  description: string;
  xpAmount: number;
  earnedAt: Date;
  source?: string; // What triggered the reward (e.g., "10km_driven", "5_day_streak")
}

const RewardSchema = new Schema<IReward>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['milestone', 'achievement', 'streak', 'daily', 'special'],
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
    xpAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for efficient user reward queries
RewardSchema.index({ userId: 1, earnedAt: -1 });
RewardSchema.index({ userId: 1, type: 1 });

export const Reward = mongoose.model<IReward>('Reward', RewardSchema);
