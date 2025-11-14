import express from 'express';
import {
  getAllPotholes,
  getPotholeById,
  updatePotholeStatus,
  getPotholesNearby,
} from '../controllers/potholeController';
import { requireRole } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/potholes - Get all potholes
router.get('/', getAllPotholes);

// GET /api/potholes/nearby - Get nearby potholes
router.get('/nearby', getPotholesNearby);

// GET /api/potholes/:id - Get single pothole
router.get('/:id', getPotholeById);

// PATCH /api/potholes/:id - Update pothole (officials only)
router.patch('/:id', requireRole(['official', 'admin']), updatePotholeStatus);

export default router;
