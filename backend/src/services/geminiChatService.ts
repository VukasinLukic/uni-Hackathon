import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pothole } from '../models/Pothole.model';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class GeminiChatService {
  /**
   * Chat with Gemini AI about routes and potholes
   * Gemini has context about all active potholes in the database
   */
  static async chat(userMessage: string, userLocation?: {
    lat: number;
    lng: number;
  }): Promise<{
    response: string;
    potholes?: any[];
  }> {
    try {
      // Get active potholes from database
      const activePotholes = await Pothole.find({
        status: { $ne: 'resolved' },
      })
        .sort({ severity: -1 })
        .limit(100);

      // If user provided location, get nearby potholes
      let nearbyPotholes: any[] = [];
      if (userLocation) {
        nearbyPotholes = await Pothole.find({
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [userLocation.lng, userLocation.lat],
              },
              $maxDistance: 5000, // 5km radius
            },
          },
          status: { $ne: 'resolved' },
        }).limit(20);
      }

      // Build context for Gemini
      const systemPrompt = `You are RoadSense AI, an intelligent assistant that helps drivers plan optimal routes avoiding potholes and road damage.

**Your capabilities:**
- Analyze pothole data and suggest safe routes
- Provide estimates on road conditions
- Recommend best times to travel certain routes
- Alert users about high-severity potholes

**Current pothole database:**
Total active potholes: ${activePotholes.length}
${userLocation ? `Potholes near user (within 5km): ${nearbyPotholes.length}` : ''}

**High-severity potholes (severity > 70):**
${activePotholes
  .filter(p => p.severity > 70)
  .slice(0, 10)
  .map(
    (p, i) =>
      `${i + 1}. Location: [${p.location.coordinates[1].toFixed(4)}, ${p.location.coordinates[0].toFixed(4)}], Severity: ${p.severity}, Status: ${p.status}, Reports: ${p.reports}`
  )
  .join('\n')}

${
  nearbyPotholes.length > 0
    ? `\n**Potholes near user's location:**
${nearbyPotholes
  .slice(0, 5)
  .map(
    (p, i) =>
      `${i + 1}. Distance: ~${this.calculateDistance(userLocation!.lat, userLocation!.lng, p.location.coordinates[1], p.location.coordinates[0]).toFixed(1)}km, Severity: ${p.severity}, Status: ${p.status}`
  )
  .join('\n')}`
    : ''
}

**Instructions:**
- Be concise and helpful
- When suggesting routes, mention specific coordinates if relevant
- Warn about high-severity potholes (>70)
- If user asks about a specific location, reference nearby potholes from the database
- Always prioritize user safety
- Use Serbian language if user writes in Serbian, otherwise English`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }],
          },
          {
            role: 'model',
            parts: [
              {
                text: 'Razumem. Spreman sam da pomognem sa planiranjem ruta i izbegovavanjem rupa na putu. Imam pristup trenutnim podacima o aktivnim rupama u bazi. Kako mogu da pomognem?',
              },
            ],
          },
        ],
      });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;

      return {
        response: response.text(),
        potholes: nearbyPotholes.length > 0 ? nearbyPotholes.slice(0, 5) : undefined,
      };
    } catch (error: any) {
      console.error('❌ Gemini chat error:', error);

      // Fallback response if Gemini fails
      return {
        response:
          'Izvini, trenutno ne mogu da pristupim AI sistemu. Molim te proveri API ključ ili pokušaj ponovo kasnije.',
      };
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  /**
   * Generate route suggestions avoiding high-severity potholes
   */
  static async suggestRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<{
    recommendation: string;
    dangerousAreas: any[];
  }> {
    try {
      // Find potholes along the route (simplified: in bounding box)
      const minLat = Math.min(origin.lat, destination.lat) - 0.01;
      const maxLat = Math.max(origin.lat, destination.lat) + 0.01;
      const minLng = Math.min(origin.lng, destination.lng) - 0.01;
      const maxLng = Math.max(origin.lng, destination.lng) + 0.01;

      const potholesOnRoute = await Pothole.find({
        'location.coordinates.1': { $gte: minLat, $lte: maxLat },
        'location.coordinates.0': { $gte: minLng, $lte: maxLng },
        status: { $ne: 'resolved' },
        severity: { $gte: 50 }, // Only warn about medium+ severity
      }).sort({ severity: -1 });

      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `Korisnik planira putovanje od [${origin.lat}, ${origin.lng}] do [${destination.lat}, ${destination.lng}].

Na ovoj ruti detektovano je ${potholesOnRoute.length} aktivnih rupa:
${potholesOnRoute
  .slice(0, 10)
  .map(
    (p, i) =>
      `${i + 1}. [${p.location.coordinates[1].toFixed(4)}, ${p.location.coordinates[0].toFixed(4)}] - Severity: ${p.severity}/100, Status: ${p.status}`
  )
  .join('\n')}

Daj kratku preporuku (2-3 rečenice) o ovoj ruti na srpskom jeziku. Ako ima rupa visokog rizika (severity > 70), upozori korisnika.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      return {
        recommendation: response.text(),
        dangerousAreas: potholesOnRoute.filter(p => p.severity > 70),
      };
    } catch (error: any) {
      console.error('❌ Route suggestion error:', error);
      return {
        recommendation: 'Ne mogu trenutno da analiziram rutu. Proveri API ključ.',
        dangerousAreas: [],
      };
    }
  }
}
