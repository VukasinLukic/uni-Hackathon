import express from 'express';
import { chatWithGemini } from '../controllers/geminiChatController';

const router = express.Router();

// POST /api/gemini-chat - Chat with Gemini AI assistant
router.post('/', chatWithGemini);

export default router;
