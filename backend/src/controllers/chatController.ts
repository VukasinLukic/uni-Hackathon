import { Request, Response } from 'express';
import { GeminiChatService } from '../services/geminiChatService';

/**
 * POST /api/chat
 * Chat with Gemini AI about routes and potholes
 */
export const sendChatMessage = async (req: Request, res: Response) => {
  try {
    const { message, location } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    // Optional: user's current location for better context
    const userLocation = location
      ? { lat: location.lat, lng: location.lng }
      : undefined;

    const result = await GeminiChatService.chat(message, userLocation);

    res.json({
      success: true,
      response: result.response,
      nearbyPotholes: result.potholes,
    });
  } catch (error: any) {
    console.error('❌ Chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /api/chat/route-suggest
 * Get AI route suggestion based on origin and destination
 */
export const suggestRoute = async (req: Request, res: Response) => {
  try {
    const { origin, destination } = req.body;

    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      return res.status(400).json({
        success: false,
        error: 'Origin and destination coordinates are required',
      });
    }

    const result = await GeminiChatService.suggestRoute(origin, destination);

    res.json({
      success: true,
      recommendation: result.recommendation,
      dangerousAreas: result.dangerousAreas,
    });
  } catch (error: any) {
    console.error('❌ Route suggestion error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
