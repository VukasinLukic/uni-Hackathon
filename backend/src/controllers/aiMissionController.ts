import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pothole, IPothole } from '../models/Pothole.model';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

interface MissionRequest {
  missionType: 'safety-first' | 'max-coverage' | 'critical-only';
  teams: number;
  workHours: number;
  constraints: string[];
}

interface PotholeData {
  id: string;
  lat: number;
  lng: number;
  severity: number;
  trust: number;
  ageDays: number;
  nearSchool: boolean;
}

export const generateAIMission = async (req: Request, res: Response) => {
  try {
    const { missionType, teams, workHours, constraints }: MissionRequest = req.body;

    // Validate input
    if (!missionType || !teams || !workHours) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch potholes from database
    const potholes = await Pothole.find({ status: { $in: ['new', 'planned'] } });

    if (potholes.length === 0) {
      return res.status(404).json({ error: 'No potholes available for mission planning' });
    }

    // Transform potholes to simplified format
    const potholeData: PotholeData[] = potholes.map((p: IPothole) => {
      const [lng, lat] = p.location.coordinates;
      const ageDays = Math.floor(
        (Date.now() - new Date(p.firstReported).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Calculate trust score based on reports and AI validation
      const trust = Math.min(
        (p.reports / 10) * 0.5 + (p.aiValidated ? 0.5 : 0) + (p.aiConfidence || 0) * 0.3,
        1
      );

      // Simple heuristic: near school if within ~500m of known school zones
      // In production, this would check against a school database
      const nearSchool = false; // Placeholder

      return {
        id: (p as any)._id.toString(),
        lat,
        lng,
        severity: p.severity / 100, // Convert to 0-1 scale
        trust,
        ageDays,
        nearSchool,
      };
    });

    // Apply constraints to filter potholes
    let filteredPotholes = [...potholeData];

    if (constraints.includes('avoid-schools')) {
      filteredPotholes = filteredPotholes.filter((p) => !p.nearSchool);
    }

    if (constraints.includes('high-trust-only')) {
      filteredPotholes = filteredPotholes.filter((p) => p.trust >= 0.7);
    }

    if (constraints.includes('ignore-recent')) {
      filteredPotholes = filteredPotholes.filter((p) => p.ageDays >= 2);
    }

    if (filteredPotholes.length === 0) {
      return res.status(404).json({ error: 'No potholes match the specified constraints' });
    }

    // Prepare prompt for Gemini AI
    const prompt = `You are an AI route optimization expert for road repair missions. Your task is to create optimal repair routes for ${teams} team(s) working for ${workHours} hours.

Mission Type: ${missionType}
- "safety-first": Prioritize high-severity potholes that pose immediate danger
- "max-coverage": Maximize the number of potholes repaired
- "critical-only": Focus on highest severity potholes only

Available Potholes (first 20 shown):
${filteredPotholes.slice(0, 20).map((p, i) =>
  `${i + 1}. ID: ${p.id}, Lat: ${p.lat.toFixed(4)}, Lng: ${p.lng.toFixed(4)}, Severity: ${p.severity.toFixed(2)}, Trust: ${p.trust.toFixed(2)}, Age: ${p.ageDays}d`
).join('\n')}

Total potholes available: ${filteredPotholes.length}

Please generate ${teams} optimized route(s). For each team, provide:
1. A list of pothole IDs in visit order (prioritize based on mission type)
2. Estimated total time (realistic travel + repair time)
3. Estimated total distance in km
4. Impact score (0-10, based on severity and number of potholes)

IMPORTANT: Return your response in this EXACT JSON format (no markdown, no code blocks, just pure JSON):
{
  "missions": [
    {
      "teamId": 1,
      "route": ["pothole_id_1", "pothole_id_2", "pothole_id_3"],
      "estimatedTime": 5.2,
      "totalDistance": 11.4,
      "impactScore": 8.9
    }
  ]
}

Consider:
- Average repair time: 30 min per pothole
- Average travel speed: 40 km/h in urban areas
- Cluster nearby potholes to minimize travel time
- Don't exceed the ${workHours} hour limit per team
- Balance workload between teams if multiple teams

Generate the optimal mission plan now:`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse AI response
    let aiResponse;
    try {
      aiResponse = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      return res.status(500).json({ error: 'AI returned invalid JSON response' });
    }

    if (!aiResponse.missions || !Array.isArray(aiResponse.missions)) {
      return res.status(500).json({ error: 'AI response missing missions array' });
    }

    // Enrich missions with coordinate data and create route geometries
    const enrichedMissions = aiResponse.missions.map((mission: any) => {
      const potholes = mission.route
        .map((id: string) => filteredPotholes.find((p) => p.id === id))
        .filter(Boolean);

      // Create LineString geometry for the route
      const routeGeometry = {
        type: 'LineString' as const,
        coordinates: potholes.map((p: any) => [p.lng, p.lat]),
      };

      return {
        ...mission,
        potholes: potholes.map((p: any, idx: number) => ({
          id: p.id,
          lat: p.lat,
          lng: p.lng,
          severity: p.severity,
          distance: idx > 0 ? calculateDistance(potholes[idx - 1], p) : 0,
        })),
        routeGeometry,
      };
    });

    // Calculate totals
    const totalPotholes = enrichedMissions.reduce(
      (sum: number, m: any) => sum + m.route.length,
      0
    );
    const totalImpact = enrichedMissions.reduce(
      (sum: number, m: any) => sum + m.impactScore,
      0
    );

    res.json({
      missions: enrichedMissions,
      totalPotholes,
      totalImpact: totalImpact / enrichedMissions.length,
    });
  } catch (error) {
    console.error('Error generating AI mission:', error);
    res.status(500).json({ error: 'Failed to generate AI mission' });
  }
};

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1.lat)) *
      Math.cos(toRad(p2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
