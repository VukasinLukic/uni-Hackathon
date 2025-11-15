import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaderboardEntry {
  userId: mongoose.Types.ObjectId;
  username: string;
  avatarUrl?: string;
  score: number;
  level: number;
  stats: {
    cellsExplored?: number;
    distanceDriven?: number;
    potholesDetected?: number;
    totalXP?: number;
  };
  rank: number;
}

export interface ILeaderboard extends Document {
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  category: 'xp' | 'exploration' | 'distance' | 'detection';
  startDate: Date;
  endDate?: Date;
  entries: ILeaderboardEntry[];
  lastUpdated: Date;
}

const LeaderboardEntrySchema = new Schema<ILeaderboardEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    avatarUrl: String,
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    stats: {
      cellsExplored: Number,
      distanceDriven: Number,
      potholesDetected: Number,
      totalXP: Number,
    },
    rank: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const LeaderboardSchema = new Schema<ILeaderboard>(
  {
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'all_time'],
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['xp', 'exploration', 'distance', 'detection'],
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: Date,
    entries: [LeaderboardEntrySchema],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for period + category queries
LeaderboardSchema.index({ period: 1, category: 1 }, { unique: true });

// Index for date-based queries
LeaderboardSchema.index({ period: 1, startDate: -1 });

export const Leaderboard = mongoose.model<ILeaderboard>(
  'Leaderboard',
  LeaderboardSchema
);
