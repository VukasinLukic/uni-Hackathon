// Get priority based on reports count
export const getPriorityFromReports = (reports: number): 'High Priority' | 'Medium Priority' | 'Low Priority' => {
  if (reports > 10) return 'High Priority';
  if (reports > 3) return 'Medium Priority';
  return 'Low Priority';
};

// Calculate priority for all potholes in list (top third, middle third, bottom third)
export const calculateRelativePriority = (potholes: any[], currentPothole: any): 'High Priority' | 'Medium Priority' | 'Low Priority' => {
  // First apply absolute rules
  if (currentPothole.reports <= 3) return 'Low Priority';
  if (currentPothole.reports > 10) return 'High Priority';
  if (currentPothole.reports > 3 && currentPothole.reports <= 10) return 'Medium Priority';

  // If we need relative ranking (all above 10), sort by reports
  const sorted = [...potholes].sort((a, b) => b.reports - a.reports);
  const index = sorted.findIndex(p => p._id === currentPothole._id);
  const position = index / sorted.length;

  if (position < 0.33) return 'High Priority';
  if (position < 0.67) return 'Medium Priority';
  return 'Low Priority';
};

// Reverse geocode coordinates to address using Mapbox
export const reverseGeocode = async (lng: number, lat: number): Promise<string> => {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}`
    );

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }

    return 'Unknown address';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return 'Unknown address';
  }
};

// Extract area (municipality/neighborhood) from address
export const getAreaFromAddress = (address: string): string => {
  if (!address || address === 'Unknown address' || address === 'Loading address...') {
    return 'Unknown';
  }

  // Clean postal codes from address parts (e.g., "Timișoara 300124" -> "Timișoara")
  const cleanPostalCode = (text: string): string => {
    return text.replace(/\s*\d{5,6}\s*/g, ' ').trim();
  };

  const parts = address.split(',').map(p => cleanPostalCode(p.trim()));

  // Look for Belgrade municipalities FIRST (more specific)
  const belgradeMunicipalities = ['Vračar', 'Vracar', 'Stari Grad', 'Novi Beograd', 'Zemun', 'Voždovac', 'Vozdovac'];
  for (const part of parts) {
    const found = belgradeMunicipalities.find(m => part.toLowerCase().includes(m.toLowerCase()));
    if (found) {
      return found;
    }
  }

  // For Timișoara: find the part BEFORE "Timișoara" which is usually the neighborhood
  const timIndex = parts.findIndex(p => p.toLowerCase().includes('timișoara') || p.toLowerCase().includes('timisoara'));
  if (timIndex > 0) {
    // Check if the previous part is a neighborhood name (not a street number or "Bulevardul")
    const potentialNeighborhood = parts[timIndex - 1];
    if (potentialNeighborhood &&
        !potentialNeighborhood.match(/^\d+$/) &&  // not just a number
        !potentialNeighborhood.toLowerCase().startsWith('strada') &&
        !potentialNeighborhood.toLowerCase().startsWith('bulevar') &&
        potentialNeighborhood.length > 3) {
      return potentialNeighborhood;
    }
  }

  // If Timișoara found but no specific neighborhood, return city
  if (timIndex >= 0) {
    return 'Timișoara Center';
  }

  // Check for Belgrade
  const bgIndex = parts.findIndex(p => p.toLowerCase().includes('beograd') || p.toLowerCase().includes('belgrade'));
  if (bgIndex >= 0) {
    return 'Beograd Center';
  }

  // Fallback: return first non-street, non-country part
  for (const part of parts) {
    if (part.length > 2 && !part.toLowerCase().startsWith('strada') &&
        !part.toLowerCase().startsWith('bulevar') &&
        !part.toLowerCase().includes('românia') && !part.toLowerCase().includes('romania')) {
      return part;
    }
  }

  return 'Unknown';
};
