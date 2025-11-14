import express from 'express';
import { optimizeRoutes } from '../controllers/routeController';
import { requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/optimize', requireRole(['official', 'admin']), optimizeRoutes);

export default router;
