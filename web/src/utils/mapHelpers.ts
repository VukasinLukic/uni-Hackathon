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

// Extract area from address
export const getAreaFromAddress = (address: string): string => {
  if (!address || address === 'Unknown address') return 'Unknown';

  const parts = address.split(',');
  // Try to get city/area (usually second to last or third to last part)
  return parts[parts.length - 2]?.trim() || parts[0]?.trim() || 'Unknown';
};
