import { Request, Response } from 'express';
import { LeaderboardService } from '../services/leaderboardService';

/**
 * GET /api/leaderboards/:period/:category
 * Get leaderboard for specific period and category
 */
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { period, category } = req.params;
    const userId = (req as any).userId;

    // Validate period
    if (!['daily', 'weekly', 'monthly', 'all_time'].includes(period)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid period. Must be: daily, weekly, monthly, or all_time',
      });
    }

    // Validate category
    if (!['xp', 'exploration', 'distance', 'detection'].includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category. Must be: xp, exploration, distance, or detection',
      });
    }

    const result = await LeaderboardService.getLeaderboard(
      period as any,
      category as any,
      userId
    );

    res.json({
      success: true,
      period,
      category,
      leaderboard: result.leaderboard?.entries || [],
      userPosition: result.userPosition,
      lastUpdated: result.leaderboard?.lastUpdated,
    });
  } catch (error: any) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/leaderboards/all
 * Get all leaderboards (all periods and categories)
 */
export const getAllLeaderboards = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const leaderboards = await LeaderboardService.getAllLeaderboards(userId);

    res.json({
      success: true,
      leaderboards,
    });
  } catch (error: any) {
    console.error('Get all leaderboards error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/leaderboards/ranks/me
 * Get user's ranks across all categories
 */
export const getMyRanks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const ranks = await LeaderboardService.getUserRanks(userId);

    res.json({
      success: true,
      ranks,
    });
  } catch (error: any) {
    console.error('Get user ranks error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/leaderboards/top/:category
 * Get top N users for a category
 */
export const getTopUsers = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    // Validate category
    if (!['xp', 'exploration', 'distance', 'detection'].includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category. Must be: xp, exploration, distance, or detection',
      });
    }

    const topUsers = await LeaderboardService.getTopUsers(category as any, limit);

    res.json({
      success: true,
      category,
      topUsers,
    });
  } catch (error: any) {
    console.error('Get top users error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/leaderboards/nearby/:category
 * Get users ranked near the current user
 */
export const getNearbyUsers = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const userId = (req as any).userId;
    const range = parseInt(req.query.range as string) || 5;

    // Validate category
    if (!['xp', 'exploration', 'distance', 'detection'].includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category. Must be: xp, exploration, distance, or detection',
      });
    }

    const nearbyUsers = await LeaderboardService.getNearbyUsers(
      userId,
      category as any,
      range
    );

    res.json({
      success: true,
      category,
      nearbyUsers,
    });
  } catch (error: any) {
    console.error('Get nearby users error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /api/leaderboards/update
 * Manually trigger leaderboard update (admin only)
 */
export const updateLeaderboards = async (req: Request, res: Response) => {
  try {
    await LeaderboardService.updateAllLeaderboards();

    res.json({
      success: true,
      message: 'All leaderboards updated successfully',
    });
  } catch (error: any) {
    console.error('Update leaderboards error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
