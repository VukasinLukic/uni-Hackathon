import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class AIVisionService {
  /**
   * Validate if image contains a pothole using Google Gemini Vision API
   * @param imageUrl - Public URL of the uploaded image
   * @returns Object with validation result and confidence score
   */
  static async validatePotholeImage(imageUrl: string): Promise<{
    isValid: boolean;
    confidence: number;
    reason?: string;
  }> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `Analyze this image and determine if it contains a pothole or road damage.

      A pothole is:
      - A depression or hole in the road surface
      - Damaged, cracked, or deteriorated pavement
      - Visible gaps or breaks in asphalt or concrete

      Respond in JSON format:
      {
        "isPothole": true/false,
        "confidence": 0-100,
        "description": "brief description of what you see"
      }

      Be strict: only mark as pothole if you clearly see road damage. Reject images of normal roads, sidewalks, or unrelated objects.`;

      // Fetch image as base64
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        { text: prompt },
      ]);

      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }

      const analysis = JSON.parse(jsonMatch[0]);

      return {
        isValid: analysis.isPothole === true,
        confidence: Math.min(Math.max(analysis.confidence, 0), 100),
        reason: analysis.description,
      };
    } catch (error: any) {
      console.error('L AI Vision error:', error);
      // If AI fails, default to manual verification (low confidence)
      return {
        isValid: false,
        confidence: 0,
        reason: 'AI validation failed: ' + error.message,
      };
    }
  }
}
