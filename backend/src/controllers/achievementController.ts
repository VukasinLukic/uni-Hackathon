import { Request, Response } from 'express';
import { AchievementService } from '../services/achievementService';

/**
 * GET /api/achievements
 * Get all available achievements with locked/unlocked status
 * Requires authentication
 */
export const getAllAchievements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const achievements = await AchievementService.getAllAchievements(userId);

    res.json({
      success: true,
      achievements,
    });
  } catch (error: any) {
    console.error('Get all achievements error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/achievements/me
 * Get user's unlocked achievements
 * Requires authentication
 */
export const getMyAchievements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const achievements = await AchievementService.getUserAchievements(userId);

    res.json({
      success: true,
      count: achievements.length,
      achievements,
    });
  } catch (error: any) {
    console.error('Get my achievements error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/achievements/progress
 * Get progress toward all achievements
 * Requires authentication
 */
export const getAchievementProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const progress = await AchievementService.getAchievementProgress(userId);

    res.json({
      success: true,
      progress,
    });
  } catch (error: any) {
    console.error('Get achievement progress error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /api/achievements/check
 * Manually trigger achievement check
 * Useful after completing actions that might unlock achievements
 * Requires authentication
 */
export const checkAchievements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const newlyUnlocked = await AchievementService.checkAndUnlockAchievements(userId);

    res.json({
      success: true,
      newlyUnlocked: newlyUnlocked.length,
      achievements: newlyUnlocked,
    });
  } catch (error: any) {
    console.error('Check achievements error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
