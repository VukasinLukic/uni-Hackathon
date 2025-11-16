import express from 'express';
import { sendChatMessage, suggestRoute } from '../controllers/chatController';

const router = express.Router();

// POST /api/chat - General chat with AI
router.post('/', sendChatMessage);

// POST /api/chat/route-suggest - Get route suggestion
router.post('/route-suggest', suggestRoute);

export default router;
