import axios from 'axios';

/**
 * Reverse geocode coordinates to address using Nominatim (OpenStreetMap)
 * Free API, no key required, but please respect rate limits (1 req/sec)
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon: lng,
        format: 'json',
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'RoadSense-App/1.0', // Required by Nominatim
      },
      timeout: 5000,
    });

    if (response.data && response.data.display_name) {
      return response.data.display_name;
    }

    // Fallback to coordinates if no address found
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch (error) {
    console.error('Geocoding error:', error);
    // Fallback to coordinates on error
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

/**
 * Add delay to respect Nominatim rate limit (1 req/sec)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
