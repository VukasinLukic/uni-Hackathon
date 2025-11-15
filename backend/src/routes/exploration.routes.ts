import { Router } from 'express';
import {
  getMyCells,
  getMyStats,
  getCellsGeoJSON,
  getHeatmap,
  exploreCell,
} from '../controllers/explorationController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/exploration/cells
 * @desc    Get user's explored cells
 * @access  Private (requires JWT)
 */
router.get('/cells', authenticate, getMyCells);

/**
 * @route   GET /api/exploration/stats
 * @desc    Get exploration statistics
 * @access  Private (requires JWT)
 */
router.get('/stats', authenticate, getMyStats);

/**
 * @route   GET /api/exploration/geojson
 * @desc    Get cells as GeoJSON for map overlay
 * @access  Private (requires JWT)
 */
router.get('/geojson', authenticate, getCellsGeoJSON);

/**
 * @route   GET /api/exploration/heatmap
 * @desc    Get heatmap data for visualization
 * @access  Private (requires JWT)
 */
router.get('/heatmap', authenticate, getHeatmap);

/**
 * @route   POST /api/exploration/explore
 * @desc    Manually record cell exploration (for testing)
 * @access  Private (requires JWT)
 */
router.post('/explore', authenticate, exploreCell);

export default router;
