import express from 'express';
import { generateAIMission } from '../controllers/aiMissionController';

const router = express.Router();

// POST /api/ai-mission - Generate AI-optimized repair mission
router.post('/', generateAIMission);

export default router;
