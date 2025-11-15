import { Router } from 'express';
import {
  getLeaderboard,
  getAllLeaderboards,
  getMyRanks,
  getTopUsers,
  getNearbyUsers,
  updateLeaderboards,
} from '../controllers/leaderboardController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/leaderboards/:period/:category
 * @desc    Get leaderboard for specific period and category
 * @access  Private (requires JWT)
 * @params  period: daily | weekly | monthly | all_time
 *          category: xp | exploration | distance | detection
 */
router.get('/:period/:category', authenticate, getLeaderboard);

/**
 * @route   GET /api/leaderboards/all
 * @desc    Get all leaderboards (all periods and categories)
 * @access  Private (requires JWT)
 */
router.get('/all', authenticate, getAllLeaderboards);

/**
 * @route   GET /api/leaderboards/ranks/me
 * @desc    Get user's ranks across all categories
 * @access  Private (requires JWT)
 */
router.get('/ranks/me', authenticate, getMyRanks);

/**
 * @route   GET /api/leaderboards/top/:category
 * @desc    Get top N users for a category
 * @access  Private (requires JWT)
 * @params  category: xp | exploration | distance | detection
 * @query   limit: number (default 10)
 */
router.get('/top/:category', authenticate, getTopUsers);

/**
 * @route   GET /api/leaderboards/nearby/:category
 * @desc    Get users ranked near the current user
 * @access  Private (requires JWT)
 * @params  category: xp | exploration | distance | detection
 * @query   range: number (default 5)
 */
router.get('/nearby/:category', authenticate, getNearbyUsers);

/**
 * @route   POST /api/leaderboards/update
 * @desc    Manually trigger leaderboard update (admin only)
 * @access  Private (requires JWT, admin only)
 */
router.post('/update', authenticate, updateLeaderboards);

export default router;
