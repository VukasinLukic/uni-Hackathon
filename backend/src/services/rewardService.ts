// @ts-nocheck
import {
  RedeemableReward,
  UserRedemption,
  IRedeemableReward,
  IUserRedemption,
} from '../models/RedeemableReward.model';
import { User } from '../models/User.model';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class RewardService {
  /**
   * Get all available rewards
   */
  static async getAvailableRewards(userId?: string): Promise<any[]> {
    const rewards = await RedeemableReward.find({ active: true }).sort({
      'cost.xpCost': 1,
    });

    // If user provided, check if they can afford each reward
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        return rewards.map((reward) => ({
          ...reward.toObject(),
          canAfford: user.totalXP >= reward.cost.xpCost,
          userXP: user.totalXP,
        }));
      }
    }

    return rewards.map((r) => r.toObject());
  }

  /**
   * Get rewards by category
   */
  static async getRewardsByCategory(
    category: 'discount' | 'voucher' | 'merchandise' | 'premium',
    userId?: string
  ): Promise<any[]> {
    const rewards = await RedeemableReward.find({
      active: true,
      category,
    }).sort({ 'cost.xpCost': 1 });

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        return rewards.map((reward) => ({
          ...reward.toObject(),
          canAfford: user.totalXP >= reward.cost.xpCost,
        }));
      }
    }

    return rewards.map((r) => r.toObject());
  }

  /**
   * Redeem a reward - generate QR code
   */
  static async redeemReward(
    userId: string | mongoose.Types.ObjectId,
    rewardId: string | mongoose.Types.ObjectId
  ): Promise<{
    success: boolean;
    redemption?: IUserRedemption;
    qrCodeData?: string;
    error?: string;
  }> {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const reward = await RedeemableReward.findById(rewardId);
    if (!reward) {
      return { success: false, error: 'Reward not found' };
    }

    if (!reward.active) {
      return { success: false, error: 'Reward is no longer available' };
    }

    // Check if user has enough XP
    if (user.totalXP < reward.cost.xpCost) {
      return {
        success: false,
        error: `Not enough XP. Required: ${reward.cost.xpCost}, You have: ${user.totalXP}`,
      };
    }

    // Check stock
    if (!reward.availability.unlimited && reward.availability.remainingStock <= 0) {
      return { success: false, error: 'Reward is out of stock' };
    }

    // Deduct XP from user
    user.totalXP -= reward.cost.xpCost;
    await user.save();

    // Update stock
    if (!reward.availability.unlimited) {
      reward.availability.remainingStock -= 1;
      await reward.save();
    }

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + reward.expiryDays);

    // Generate QR code (JWT token)
    const qrPayload = {
      redemptionId: new mongoose.Types.ObjectId().toString(),
      userId: (user._id as any).toString(),
      rewardId: (reward._id as any).toString(),
      rewardName: reward.name,
      redeemedAt: new Date(),
      expiresAt,
    };

    const qrCode = jwt.sign(qrPayload, JWT_SECRET, {
      expiresIn: `${reward.expiryDays}d`,
    });

    // Create redemption record
    const redemption = await UserRedemption.create({
      userId: user._id,
      rewardId: reward._id,
      qrCode,
      status: 'active',
      redeemedAt: new Date(),
      expiresAt,
    });

    return {
      success: true,
      redemption,
      qrCodeData: qrCode,
    };
  }

  /**
   * Verify and use QR code (for merchants/partners)
   */
  static async verifyAndUseQR(
    qrCode: string,
    merchantId?: string
  ): Promise<{
    success: boolean;
    redemption?: any;
    reward?: IRedeemableReward;
    error?: string;
  }> {
    try {
      // Verify JWT
      const decoded = jwt.verify(qrCode, JWT_SECRET) as any;

      // Find redemption
      const redemption = await UserRedemption.findOne({ qrCode }).populate(
        'rewardId userId'
      );

      if (!redemption) {
        return { success: false, error: 'Invalid QR code' };
      }

      // Check if already used
      if (redemption.status === 'used') {
        return {
          success: false,
          error: `QR code already used on ${redemption.usedAt}`,
        };
      }

      // Check if expired
      if (redemption.status === 'expired' || new Date() > redemption.expiresAt) {
        redemption.status = 'expired';
        await redemption.save();
        return { success: false, error: 'QR code has expired' };
      }

      // Mark as used
      redemption.status = 'used';
      redemption.usedAt = new Date();
      redemption.usedBy = merchantId || 'unknown';
      await redemption.save();

      const reward = await RedeemableReward.findById(redemption.rewardId);

      return {
        success: true,
        redemption: redemption.toObject(),
        reward: reward || undefined,
      };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return { success: false, error: 'QR code has expired' };
      }
      if (error.name === 'JsonWebTokenError') {
        return { success: false, error: 'Invalid QR code' };
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's redemptions
   */
  static async getUserRedemptions(
    userId: string | mongoose.Types.ObjectId,
    status?: 'active' | 'used' | 'expired'
  ): Promise<IUserRedemption[]> {
    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    return UserRedemption.find(query)
      .populate('rewardId')
      .sort({ redeemedAt: -1 });
  }

  /**
   * Get user's active (unused) redemptions
   */
  static async getActiveRedemptions(
    userId: string | mongoose.Types.ObjectId
  ): Promise<IUserRedemption[]> {
    // Update expired redemptions
    await UserRedemption.updateMany(
      {
        userId,
        status: 'active',
        expiresAt: { $lt: new Date() },
      },
      {
        $set: { status: 'expired' },
      }
    );

    return UserRedemption.find({
      userId,
      status: 'active',
    })
      .populate('rewardId')
      .sort({ expiresAt: 1 });
  }

  /**
   * Create a new redeemable reward (admin)
   */
  static async createReward(rewardData: Partial<IRedeemableReward>): Promise<IRedeemableReward> {
    return RedeemableReward.create(rewardData);
  }

  /**
   * Update reward (admin)
   */
  static async updateReward(
    rewardId: string | mongoose.Types.ObjectId,
    updates: Partial<IRedeemableReward>
  ): Promise<IRedeemableReward | null> {
    return RedeemableReward.findByIdAndUpdate(rewardId, updates, { new: true });
  }

  /**
   * Delete/deactivate reward (admin)
   */
  static async deactivateReward(
    rewardId: string | mongoose.Types.ObjectId
  ): Promise<IRedeemableReward | null> {
    return RedeemableReward.findByIdAndUpdate(
      rewardId,
      { active: false },
      { new: true }
    );
  }

  /**
   * Get redemption statistics
   */
  static async getRedemptionStats(
    userId: string | mongoose.Types.ObjectId
  ): Promise<{
    totalRedeemed: number;
    totalUsed: number;
    totalExpired: number;
    totalActive: number;
    totalXPSpent: number;
  }> {
    const redemptions = await UserRedemption.find({ userId }).populate('rewardId');

    const stats = {
      totalRedeemed: redemptions.length,
      totalUsed: redemptions.filter((r) => r.status === 'used').length,
      totalExpired: redemptions.filter((r) => r.status === 'expired').length,
      totalActive: redemptions.filter((r) => r.status === 'active').length,
      totalXPSpent: 0,
    };

    // Calculate total XP spent
    for (const redemption of redemptions) {
      const reward = redemption.rewardId as any;
      if (reward && reward.cost) {
        stats.totalXPSpent += reward.cost.xpCost;
      }
    }

    return stats;
  }
}
