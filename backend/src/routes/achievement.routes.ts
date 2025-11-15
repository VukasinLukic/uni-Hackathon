import { Router } from 'express';
import {
  getAllAchievements,
  getMyAchievements,
  getAchievementProgress,
  checkAchievements,
} from '../controllers/achievementController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/achievements
 * @desc    Get all available achievements
 * @access  Private (requires JWT)
 */
router.get('/', authenticate, getAllAchievements);

/**
 * @route   GET /api/achievements/me
 * @desc    Get user's unlocked achievements
 * @access  Private (requires JWT)
 */
router.get('/me', authenticate, getMyAchievements);

/**
 * @route   GET /api/achievements/progress
 * @desc    Get progress toward all achievements
 * @access  Private (requires JWT)
 */
router.get('/progress', authenticate, getAchievementProgress);

/**
 * @route   POST /api/achievements/check
 * @desc    Manually check and unlock achievements
 * @access  Private (requires JWT)
 */
router.post('/check', authenticate, checkAchievements);

export default router;
