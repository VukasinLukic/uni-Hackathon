// API Configuration with fallback support

const POSSIBLE_URLS = [
  process.env.EXPO_PUBLIC_API_URL || 'http://10.0.10.156:7392', // Regular WiFi IP
  'http://localhost:7392',
  'http://127.0.0.1:7392',
  'http://10.0.0.1:7392', // Common router IP
];

let cachedWorkingUrl: string | null = null;

/**
 * Test if a URL is reachable
 */
async function testUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${url}/api/users/leaderboard?limit=1`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Find the first working API URL from the list
 */
export async function findWorkingApiUrl(): Promise<string> {
  // Return cached URL if available
  if (cachedWorkingUrl) {
    return cachedWorkingUrl;
  }

  console.log('🔍 Testing API URLs...');

  for (const url of POSSIBLE_URLS) {
    console.log(`Testing: ${url}`);
    const isWorking = await testUrl(url);
    if (isWorking) {
      console.log(`✅ Found working URL: ${url}`);
      cachedWorkingUrl = url;
      return url;
    }
  }

  // If no URL works, return the first one (from env) and let it fail with proper error
  console.warn('⚠️ No working URL found, using default:', POSSIBLE_URLS[0]);
  return POSSIBLE_URLS[0];
}

/**
 * Get the API URL (returns cached or default immediately)
 */
export function getApiUrl(): string {
  return cachedWorkingUrl || POSSIBLE_URLS[0];
}

/**
 * Reset cached URL (useful for retry logic)
 */
export function resetApiUrl(): void {
  cachedWorkingUrl = null;
}
