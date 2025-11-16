import { Router } from 'express';
import {
  startDrive,
  updateDrive,
  endDrive,
  getActiveDrive,
  getDriveHistory,
  getDriveStats,
} from '../controllers/driveController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/drives/start
 * @desc    Start a new drive session
 * @access  Private (requires JWT)
 */
router.post('/start', authenticate, startDrive);

/**
 * @route   POST /api/drives/:sessionId/update
 * @desc    Update drive session with new location
 * @access  Private (requires JWT)
 */
router.post('/:sessionId/update', authenticate, updateDrive);

/**
 * @route   POST /api/drives/:sessionId/end
 * @desc    End drive session
 * @access  Private (requires JWT)
 */
router.post('/:sessionId/end', authenticate, endDrive);

/**
 * @route   GET /api/drives/active
 * @desc    Get user's active drive session
 * @access  Private (requires JWT)
 */
router.get('/active', authenticate, getActiveDrive);

/**
 * @route   GET /api/drives/history
 * @desc    Get user's drive history
 * @access  Private (requires JWT)
 */
router.get('/history', authenticate, getDriveHistory);

/**
 * @route   GET /api/drives/stats
 * @desc    Get drive statistics
 * @access  Private (requires JWT)
 */
router.get('/stats', authenticate, getDriveStats);

export default router;
