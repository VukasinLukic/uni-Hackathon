import { Router } from 'express';
import { awardXP, getMyXP } from '../controllers/xpController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/xp/award
 * @desc    Award XP to user for an action
 * @access  Private (requires JWT)
 */
router.post('/award', authenticate, awardXP);

/**
 * @route   GET /api/xp/me
 * @desc    Get current user's XP and level info
 * @access  Private (requires JWT)
 */
router.get('/me', authenticate, getMyXP);

export default router;
