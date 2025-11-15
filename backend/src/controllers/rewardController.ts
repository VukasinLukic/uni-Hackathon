import { Request, Response } from 'express';
import { RewardService } from '../services/rewardService';

/**
 * GET /api/rewards
 * Get all available rewards
 */
export const getRewards = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const category = req.query.category as string | undefined;

    let rewards;
    if (category) {
      rewards = await RewardService.getRewardsByCategory(category as any, userId);
    } else {
      rewards = await RewardService.getAvailableRewards(userId);
    }

    res.json({
      success: true,
      count: rewards.length,
      rewards,
    });
  } catch (error: any) {
    console.error('Get rewards error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /api/rewards/:rewardId/redeem
 * Redeem a reward and get QR code
 */
export const redeemReward = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { rewardId } = req.params;

    const result = await RewardService.redeemReward(userId, rewardId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      message: 'Reward redeemed successfully',
      redemption: {
        id: result.redemption?._id,
        qrCode: result.qrCodeData,
        expiresAt: result.redemption?.expiresAt,
        status: result.redemption?.status,
      },
    });
  } catch (error: any) {
    console.error('Redeem reward error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /api/rewards/verify-qr
 * Verify and use QR code (for merchants)
 */
export const verifyQR = async (req: Request, res: Response) => {
  try {
    const { qrCode, merchantId } = req.body;

    if (!qrCode) {
      return res.status(400).json({
        success: false,
        error: 'QR code is required',
      });
    }

    const result = await RewardService.verifyAndUseQR(qrCode, merchantId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      message: 'QR code verified and marked as used',
      redemption: result.redemption,
      reward: result.reward,
    });
  } catch (error: any) {
    console.error('Verify QR error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/rewards/my-redemptions
 * Get user's redemption history
 */
export const getMyRedemptions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const status = req.query.status as string | undefined;

    const redemptions = await RewardService.getUserRedemptions(
      userId,
      status as any
    );

    res.json({
      success: true,
      count: redemptions.length,
      redemptions,
    });
  } catch (error: any) {
    console.error('Get redemptions error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/rewards/active
 * Get user's active (unused) redemptions
 */
export const getActiveRedemptions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const redemptions = await RewardService.getActiveRedemptions(userId);

    res.json({
      success: true,
      count: redemptions.length,
      redemptions,
    });
  } catch (error: any) {
    console.error('Get active redemptions error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/rewards/stats
 * Get user's redemption statistics
 */
export const getRedemptionStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const stats = await RewardService.getRedemptionStats(userId);

    res.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('Get redemption stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /api/rewards (Admin only)
 * Create a new redeemable reward
 */
export const createReward = async (req: Request, res: Response) => {
  try {
    const rewardData = req.body;

    const reward = await RewardService.createReward(rewardData);

    res.status(201).json({
      success: true,
      reward,
    });
  } catch (error: any) {
    console.error('Create reward error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * PUT /api/rewards/:rewardId (Admin only)
 * Update a reward
 */
export const updateReward = async (req: Request, res: Response) => {
  try {
    const { rewardId } = req.params;
    const updates = req.body;

    const reward = await RewardService.updateReward(rewardId, updates);

    if (!reward) {
      return res.status(404).json({
        success: false,
        error: 'Reward not found',
      });
    }

    res.json({
      success: true,
      reward,
    });
  } catch (error: any) {
    console.error('Update reward error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * DELETE /api/rewards/:rewardId (Admin only)
 * Deactivate a reward
 */
export const deactivateReward = async (req: Request, res: Response) => {
  try {
    const { rewardId } = req.params;

    const reward = await RewardService.deactivateReward(rewardId);

    if (!reward) {
      return res.status(404).json({
        success: false,
        error: 'Reward not found',
      });
    }

    res.json({
      success: true,
      message: 'Reward deactivated successfully',
      reward,
    });
  } catch (error: any) {
    console.error('Deactivate reward error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
