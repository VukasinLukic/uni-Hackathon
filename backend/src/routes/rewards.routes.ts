import { Router } from 'express';
import {
  getRewards,
  redeemReward,
  verifyQR,
  getMyRedemptions,
  getActiveRedemptions,
  getRedemptionStats,
  createReward,
  updateReward,
  deactivateReward,
} from '../controllers/rewardController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/rewards
 * @desc    Get all available rewards
 * @access  Private (requires JWT)
 * @query   category: discount | voucher | merchandise | premium (optional)
 */
router.get('/', authenticate, getRewards);

/**
 * @route   POST /api/rewards/:rewardId/redeem
 * @desc    Redeem a reward and get QR code
 * @access  Private (requires JWT)
 */
router.post('/:rewardId/redeem', authenticate, redeemReward);

/**
 * @route   POST /api/rewards/verify-qr
 * @desc    Verify and use QR code (for merchants/partners)
 * @access  Public (merchants can verify without auth)
 */
router.post('/verify-qr', verifyQR);

/**
 * @route   GET /api/rewards/my-redemptions
 * @desc    Get user's redemption history
 * @access  Private (requires JWT)
 * @query   status: active | used | expired (optional)
 */
router.get('/my-redemptions', authenticate, getMyRedemptions);

/**
 * @route   GET /api/rewards/active
 * @desc    Get user's active (unused) redemptions
 * @access  Private (requires JWT)
 */
router.get('/active', authenticate, getActiveRedemptions);

/**
 * @route   GET /api/rewards/stats
 * @desc    Get user's redemption statistics
 * @access  Private (requires JWT)
 */
router.get('/stats', authenticate, getRedemptionStats);

/**
 * @route   POST /api/rewards
 * @desc    Create a new redeemable reward (admin only)
 * @access  Private (requires JWT, admin only)
 */
router.post('/', authenticate, createReward);

/**
 * @route   PUT /api/rewards/:rewardId
 * @desc    Update a reward (admin only)
 * @access  Private (requires JWT, admin only)
 */
router.put('/:rewardId', authenticate, updateReward);

/**
 * @route   DELETE /api/rewards/:rewardId
 * @desc    Deactivate a reward (admin only)
 * @access  Private (requires JWT, admin only)
 */
router.delete('/:rewardId', authenticate, deactivateReward);

export default router;
