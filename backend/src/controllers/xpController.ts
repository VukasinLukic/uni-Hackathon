import { Request, Response } from 'express';
import { XPService } from '../services/xpService';

/**
 * POST /api/xp/award
 * Award XP to a user for an action
 * Requires authentication
 */
export const awardXP = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { action, metadata } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'Action is required',
      });
    }

    const validActions = ['drive_km', 'explore_cell', 'detect_pothole', 'verify_pothole', 'achievement'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error: `Invalid action. Valid actions: ${validActions.join(', ')}`,
      });
    }

    const result = await XPService.awardXPForAction(userId, action, metadata);

    res.json(result);
  } catch (error: any) {
    console.error('Award XP error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/xp/me
 * Get current user's XP and level information
 * Requires authentication
 */
export const getMyXP = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const xpInfo = await XPService.getUserXPInfo(userId);

    res.json({
      success: true,
      ...xpInfo,
    });
  } catch (error: any) {
    console.error('Get XP info error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
