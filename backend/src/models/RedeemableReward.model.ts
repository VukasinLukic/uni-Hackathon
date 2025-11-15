import mongoose, { Schema, Document } from 'mongoose';

export interface IRedeemableReward extends Document {
  name: string;
  description: string;
  category: 'discount' | 'voucher' | 'merchandise' | 'premium';
  cost: {
    xpCost: number;
  };
  availability: {
    totalStock: number;
    remainingStock: number;
    unlimited: boolean;
  };
  partner?: {
    name: string;
    logo?: string;
  };
  redemptionInstructions: string;
  active: boolean;
  expiryDays: number; // Days until QR code expires after redemption
}

export interface IUserRedemption extends Document {
  userId: mongoose.Types.ObjectId;
  rewardId: mongoose.Types.ObjectId;
  qrCode: string; // JWT token
  status: 'active' | 'used' | 'expired';
  redeemedAt: Date;
  expiresAt: Date;
  usedAt?: Date;
  usedBy?: string; // Partner/merchant who scanned the QR
}

const RedeemableRewardSchema = new Schema<IRedeemableReward>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['discount', 'voucher', 'merchandise', 'premium'],
      required: true,
    },
    cost: {
      xpCost: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    availability: {
      totalStock: {
        type: Number,
        default: 0,
      },
      remainingStock: {
        type: Number,
        default: 0,
      },
      unlimited: {
        type: Boolean,
        default: false,
      },
    },
    partner: {
      name: String,
      logo: String,
    },
    redemptionInstructions: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiryDays: {
      type: Number,
      default: 30, // Default 30 days
    },
  },
  { timestamps: true }
);

const UserRedemptionSchema = new Schema<IUserRedemption>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rewardId: {
      type: Schema.Types.ObjectId,
      ref: 'RedeemableReward',
      required: true,
    },
    qrCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'used', 'expired'],
      default: 'active',
      index: true,
    },
    redeemedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    usedAt: Date,
    usedBy: String,
  },
  { timestamps: true }
);

// Indexes for queries
RedeemableRewardSchema.index({ active: 1, category: 1 });
RedeemableRewardSchema.index({ 'cost.xpCost': 1 });

UserRedemptionSchema.index({ userId: 1, status: 1 });
UserRedemptionSchema.index({ userId: 1, redeemedAt: -1 });

export const RedeemableReward = mongoose.model<IRedeemableReward>(
  'RedeemableReward',
  RedeemableRewardSchema
);

export const UserRedemption = mongoose.model<IUserRedemption>(
  'UserRedemption',
  UserRedemptionSchema
);
