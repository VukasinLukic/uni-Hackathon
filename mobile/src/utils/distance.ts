/**
 * Calculates the distance between two geographic coordinates using the Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Converts degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Checks if user has moved at least the specified distance from the last recorded position
 * @param {object} currentPos - Current position {latitude, longitude}
 * @param {object} lastPos - Last recorded position {latitude, longitude}
 * @param {number} thresholdMeters - Minimum distance in meters (default: 10)
 * @returns {boolean} True if moved beyond threshold
 */
export function hasMovedBeyondThreshold(
  currentPos: { latitude: number; longitude: number },
  lastPos: { latitude: number; longitude: number },
  thresholdMeters: number = 10
): boolean {
  const distance = getDistanceInMeters(
    lastPos.latitude,
    lastPos.longitude,
    currentPos.latitude,
    currentPos.longitude
  );
  return distance >= thresholdMeters;
}
