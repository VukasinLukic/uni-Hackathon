import express from 'express';
import { getStats, getTrends } from '../controllers/statsController';

const router = express.Router();

router.get('/', getStats);
router.get('/trends', getTrends);

export default router;
