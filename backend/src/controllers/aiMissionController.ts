import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pothole, IPothole } from '../models/Pothole.model';
import { reverseGeocode, sleep } from '../utils/geocoding';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

interface MissionRequest {
  teams: number;
  workHours: number;
  optimizationCriteria?: 'reports' | 'severity'; // Novi parametar
}

interface PotholeData {
  id: string;
  lat: number;
  lng: number;
  severity: number;
  reports: number; // Dodato
  address: string;
}

export const generateAIMission = async (req: Request, res: Response) => {
  try {
    const { teams, workHours, optimizationCriteria = 'reports' }: MissionRequest = req.body;

    // Validate input
    if (!teams || !workHours) {
      return res.status(400).json({ error: 'Missing required fields: teams and workHours' });
    }

    console.log(`🤖 AI Mission Request: ${teams} teams, ${workHours}h, optimize by ${optimizationCriteria}`);

    // Fetch potholes from database - samo new i planned
    const potholes = await Pothole.find({ status: { $in: ['new', 'planned'] } });

    if (potholes.length === 0) {
      return res.status(404).json({ error: 'No potholes available for mission planning' });
    }

    // Transform potholes - izvuci sve podatke iz baze
    const potholeData: PotholeData[] = [];
    for (const p of potholes) {
      const [lng, lat] = p.location.coordinates;
      let address = p.location.address;

      // Ako nema adresu, pozovi reverse geocoding
      if (!address || address.includes(',') === false) {
        console.log(`🔍 Fetching address for ${lat}, ${lng}...`);
        try {
          address = await reverseGeocode(lat, lng);
          // Save address back to database
          p.location.address = address;
          await p.save();
          // Respect Nominatim rate limit (1 req/sec)
          await sleep(1100);
        } catch (geocodeError) {
          console.warn(`⚠️ Geocoding failed for ${lat}, ${lng}:`, geocodeError);
          // Fallback to coordinates if geocoding fails
          address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
      }

      potholeData.push({
        id: (p as any)._id.toString(),
        lat,
        lng,
        severity: p.severity / 100, // 0-100 → 0-1 scale
        reports: p.reports, // Dodato
        address,
      });
    }

    // Sortiraj po izabranom kriterijumu
    let sortedPotholes: PotholeData[];
    if (optimizationCriteria === 'severity') {
      sortedPotholes = [...potholeData].sort((a, b) => b.severity - a.severity);
      console.log(`📊 Sorted by SEVERITY (highest priority first)`);
    } else {
      sortedPotholes = [...potholeData].sort((a, b) => b.reports - a.reports);
      console.log(`📊 Sorted by REPORTS (most reported first)`);
    }

    // Limitujem na top 15 za AI (smanjuje tokene)
    const topPotholes = sortedPotholes.slice(0, 15);

    // Poboljšan prompt - AI određuje brzinu i impact score
    const criteriaLabel = optimizationCriteria === 'severity' ? 'Severity' : 'Reports';
    const criteriaData = optimizationCriteria === 'severity'
      ? topPotholes.map((p, i) => `${i + 1}. ID:${p.id.slice(-6)}, Lat:${p.lat.toFixed(3)}, Lng:${p.lng.toFixed(3)}, Severity:${p.severity.toFixed(2)}`)
      : topPotholes.map((p, i) => `${i + 1}. ID:${p.id.slice(-6)}, Lat:${p.lat.toFixed(3)}, Lng:${p.lng.toFixed(3)}, Reports:${p.reports}`);

    const prompt = `ROUTE OPTIMIZER FOR ROAD REPAIR

Task: Create ${teams} optimized missions for ${workHours}h each.
Optimization Criteria: ${criteriaLabel} (${optimizationCriteria === 'severity' ? 'highest severity = highest priority' : 'most reports = most urgent'})

AVAILABLE POTHOLES:
${criteriaData.join('\n')}

RULES:
1. Return EXACTLY ${teams} mission(s)
2. ONLY use IDs from above
3. Each team works MAX ${workHours} hours (30min repair time per pothole + travel time)
4. Cluster geographically for shortest route
5. Determine realistic avg driving speed (20-60 km/h based on urban/rural)
6. Calculate impactScore as: (sum of ${criteriaLabel.toLowerCase()}) / (number of potholes in route)

JSON FORMAT:
{"missions":[{"teamId":1,"route":["id1","id2"],"estimatedTime":5.2,"totalDistance":11.4,"impactScore":8.9,"avgSpeed":35}]}

Return ONLY valid JSON, no markdown.`;

    console.log(`📝 Prompt sent to AI (${prompt.length} chars)`);

    // Call Gemini API - Gemini 2.0 (FREE experimental model)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.1, // Niska temperatura za konzistentnije rezultate
        maxOutputTokens: 800,
      },
    });

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    console.log(`✅ AI Response received (${text.length} chars)`);
    console.log(`📄 Raw AI Response:\n${text.substring(0, 500)}...`); // Prvi 500 karaktera

    // Clean up markdown formatting
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse AI response
    let aiResponse;
    try {
      aiResponse = JSON.parse(text);
      console.log(`✅ AI JSON parsed successfully: ${aiResponse.missions?.length || 0} missions`);
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', text);
      console.error('❌ Parse error:', parseError);
      // FALLBACK: Ako AI faila, kreiraj basic mission
      console.log('⚠️ Using FALLBACK missions');
      return res.json(createFallbackMissions(topPotholes, teams, workHours, optimizationCriteria));
    }

    // Validacija strukture
    if (!aiResponse.missions || !Array.isArray(aiResponse.missions)) {
      console.error('❌ AI response missing missions array');
      return res.json(createFallbackMissions(topPotholes, teams, workHours, optimizationCriteria));
    }

    // Limit broj missions
    if (aiResponse.missions.length > teams) {
      console.warn(`⚠️ AI returned ${aiResponse.missions.length} missions, limiting to ${teams}`);
      aiResponse.missions = aiResponse.missions.slice(0, teams);
    }

    console.log(`📊 Processing ${aiResponse.missions.length} missions from AI...`);

    // Enrich missions sa TAČNIM podacima iz baze
    const enrichedMissions = aiResponse.missions
      .map((mission: any, teamIndex: number) => {
        const maxPotholesPerRoute = Math.min(workHours * 2, 20);
        const routeIds = mission.route.slice(0, maxPotholesPerRoute);

        // Validacija: proveravamo da li IDs postoje
        const validShortIds = new Set(topPotholes.map((p) => p.id.slice(-6)));
        const validRouteIds = routeIds.filter((id: string) => validShortIds.has(id.slice(-6)));

        if (validRouteIds.length === 0) {
          console.warn(`Mission ${mission.teamId} has no valid IDs, skipping`);
          return null;
        }

        // Match IDs sa kompletnim pothole podacima
        const routePotholes = validRouteIds
          .map((id: string) => topPotholes.find((p) => p.id === id || p.id.endsWith(id)))
          .filter(Boolean);

        if (routePotholes.length === 0) return null;

        // Calculate TAČAN total distance
        let totalDistance = 0;
        for (let i = 1; i < routePotholes.length; i++) {
          totalDistance += calculateDistance(routePotholes[i - 1], routePotholes[i]);
        }

        // Calculate TAČAN estimated time (30min po rupi + vreme vožnje)
        const repairTime = routePotholes.length * 0.5; // 0.5h = 30min po rupi
        // Koristi avgSpeed iz AI odgovora ili fallback na 40
        const avgSpeed = mission.avgSpeed || 40;
        const travelTime = totalDistance / avgSpeed;
        const estimatedTime = repairTime + travelTime;

        // Calculate TAČAN impact score - zavisi od optimizationCriteria
        // Impact Score = prosek kriterijuma (reports ili severity)
        const impactScore = optimizationCriteria === 'severity'
          ? routePotholes.reduce((sum: number, p: PotholeData) => sum + p.severity, 0) / routePotholes.length
          : routePotholes.reduce((sum: number, p: PotholeData) => sum + p.reports, 0) / routePotholes.length;

        // Create LineString geometry za mapu
        const routeGeometry = {
          type: 'LineString' as const,
          coordinates: routePotholes.map((p: PotholeData) => [p.lng, p.lat]),
        };

        return {
          teamId: teamIndex + 1,
          route: routePotholes.map((p: PotholeData) => p.id.slice(-6)),
          potholes: routePotholes.map((p: PotholeData, idx: number) => ({
            id: p.id,
            lat: p.lat,
            lng: p.lng,
            severity: p.severity,
            address: p.address, // TAČNA ADRESA IZ BAZE
            distance: idx > 0 ? calculateDistance(routePotholes[idx - 1], p) : 0,
          })),
          routeGeometry,
          estimatedTime: parseFloat(estimatedTime.toFixed(2)),
          totalDistance: parseFloat(totalDistance.toFixed(2)),
          impactScore: parseFloat(impactScore.toFixed(2)),
          avgSpeed: avgSpeed,
          optimizationCriteria: optimizationCriteria, // Dodato za frontend
        };
      })
      .filter(Boolean);

    // Ako su SVI missions null, koristi fallback
    if (enrichedMissions.length === 0) {
      console.warn('⚠️ All AI missions failed validation, using fallback');
      return res.json(createFallbackMissions(topPotholes, teams, workHours, optimizationCriteria));
    }

    console.log(`✅ Successfully enriched ${enrichedMissions.length} missions`);

    // Calculate totals
    const totalPotholes = enrichedMissions.reduce((sum: number, m: any) => sum + m.potholes.length, 0);
    const totalImpact =
      enrichedMissions.reduce((sum: number, m: any) => sum + m.impactScore, 0) / enrichedMissions.length;

    res.json({
      missions: enrichedMissions,
      totalPotholes,
      totalImpact: parseFloat(totalImpact.toFixed(2)),
    });
  } catch (error) {
    console.error('❌ Error generating AI mission:', error);
    // Better error message with stack trace
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('❌ Error details:', errorMessage);
    console.error('❌ Stack trace:', errorStack);
    res.status(500).json({
      error: 'Failed to generate AI mission',
      details: errorMessage
    });
  }
};

// FALLBACK: Kreiraj jednostavne missions ako AI faila
function createFallbackMissions(potholes: PotholeData[], teams: number, hours: number, criteria: 'reports' | 'severity' = 'reports') {
  console.log(`⚙️ Creating fallback missions (${teams} teams, ${hours}h, criteria: ${criteria})`);

  const maxPotholesPerTeam = Math.min(hours * 2, 20);
  const potholesPerTeam = Math.ceil(Math.min(potholes.length, maxPotholesPerTeam * teams) / teams);

  const missions = Array.from({ length: teams }, (_, i) => {
    const startIdx = i * potholesPerTeam;
    const endIdx = Math.min(startIdx + potholesPerTeam, potholes.length);
    const chunk = potholes.slice(startIdx, endIdx);

    if (chunk.length === 0) return null;

    let totalDistance = 0;
    for (let j = 1; j < chunk.length; j++) {
      totalDistance += calculateDistance(chunk[j - 1], chunk[j]);
    }

    const repairTime = chunk.length * 0.5;
    const avgSpeed = 35; // Fallback prosečna brzina
    const travelTime = totalDistance / avgSpeed;
    const estimatedTime = repairTime + travelTime;

    // Impact score zavisi od kriterijuma
    const impactScore = criteria === 'severity'
      ? chunk.reduce((sum, p) => sum + p.severity, 0) / chunk.length
      : chunk.reduce((sum, p) => sum + p.reports, 0) / chunk.length;

    return {
      teamId: i + 1,
      route: chunk.map((p) => p.id.slice(-6)),
      potholes: chunk.map((p, idx) => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        severity: p.severity,
        address: p.address,
        distance: idx > 0 ? calculateDistance(chunk[idx - 1], p) : 0,
      })),
      routeGeometry: {
        type: 'LineString' as const,
        coordinates: chunk.map((p) => [p.lng, p.lat]),
      },
      estimatedTime: parseFloat(estimatedTime.toFixed(2)),
      totalDistance: parseFloat(totalDistance.toFixed(2)),
      impactScore: parseFloat(impactScore.toFixed(2)),
      avgSpeed: avgSpeed,
      optimizationCriteria: criteria,
    };
  }).filter(Boolean);

  const totalPotholes = missions.reduce((sum: number, m: any) => sum + (m?.potholes.length || 0), 0);
  const totalImpact = missions.reduce((sum: number, m: any) => sum + (m?.impactScore || 0), 0) / missions.length;

  console.log(`✅ Fallback missions created: ${missions.length} teams, ${totalPotholes} potholes`);

  return {
    missions,
    totalPotholes,
    totalImpact: parseFloat(totalImpact.toFixed(2)),
    usedFallback: true,
  };
}

// Haversine formula - tačna kalkulacija distance
function calculateDistance(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
