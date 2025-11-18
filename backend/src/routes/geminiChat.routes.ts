import express from 'express';
import { Request, Response } from 'express';
import { GeminiChatService } from '../services/geminiChatService';

const router = express.Router();

// POST /api/gemini-chat - Chat with Gemini AI assistant (with location support)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, userLocation } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('📩 Gemini Chat Request:', { message, hasLocation: !!userLocation });

    const result = await GeminiChatService.chat(message, userLocation);

    console.log('✅ Gemini Chat Response generated');

    res.json(result);
  } catch (error: any) {
    console.error('❌ Gemini chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat request',
      details: error.message,
    });
  }
});

export default router;
