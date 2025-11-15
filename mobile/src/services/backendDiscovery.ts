/**
 * Backend Discovery Service
 * Automatically finds and connects to backend server
 * Tries multiple IP addresses and ports
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const STORAGE_KEY = '@backend_host';

/**
 * Common IP patterns to try
 * These will be tried in order until one works
 */
const getIPCandidates = (): string[] => {
  return [
    // Saved IP from last successful connection
    // (will be injected at runtime)

    // Your current IP - FIRST PRIORITY!
    '10.0.10.156', // Vukasin's current IP

    // Your network range
    '10.0.10.157',
    '10.0.10.158',
    '10.0.10.159',
    '10.0.10.155',
    '10.0.10.154',

    // Common local network IPs (192.168.x.x)
    '192.168.1.100',
    '192.168.1.101',
    '192.168.1.102',
    '192.168.0.100',
    '192.168.0.101',
    '192.168.0.102',

    // Other common patterns
    '192.168.43.1', // Mobile hotspot
    '192.168.137.1', // Windows hotspot

    // Localhost (for emulator)
    'localhost',
    '127.0.0.1',
    '10.0.2.2', // Android emulator host
  ];
};

/**
 * Ports to try
 */
const PORTS = [5001, 5000, 3000, 8080];

/**
 * Generate all possible backend URLs
 */
const generateBackendUrls = (): string[] => {
  const ips = getIPCandidates();
  const urls: string[] = [];

  for (const ip of ips) {
    for (const port of PORTS) {
      urls.push(`http://${ip}:${port}`);
    }
  }

  return urls;
};

/**
 * Test if a URL is reachable
 */
const testUrl = async (url: string, timeout = 2000): Promise<boolean> => {
  try {
    const response = await axios.get(`${url}/health`, {
      timeout,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.status === 200;
  } catch {
    return false;
  }
};

/**
 * Discovery Service
 */
export class BackendDiscovery {
  private static currentBackendUrl: string | null = null;
  private static isDiscovering = false;

  /**
   * Get saved backend URL from storage
   */
  static async getSavedBackendUrl(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Save backend URL to storage
   */
  static async saveBackendUrl(url: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, url);
      this.currentBackendUrl = url;
      console.log('💾 Saved backend URL:', url);
    } catch (error) {
      console.error('Failed to save backend URL:', error);
    }
  }

  /**
   * Clear saved backend URL
   */
  static async clearSavedUrl(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      this.currentBackendUrl = null;
      console.log('🗑️ Cleared saved backend URL');
    } catch (error) {
      console.error('Failed to clear backend URL:', error);
    }
  }

  /**
   * Get current backend URL (cached)
   */
  static getCurrentBackendUrl(): string | null {
    return this.currentBackendUrl;
  }

  /**
   * Discover backend server
   * Tries all possible URLs and returns the first one that works
   */
  static async discoverBackend(
    onProgress?: (url: string, index: number, total: number) => void
  ): Promise<string | null> {
    if (this.isDiscovering) {
      console.log('⏳ Discovery already in progress...');
      return this.currentBackendUrl;
    }

    this.isDiscovering = true;

    try {
      console.log('🔍 Starting backend discovery...');

      // Step 1: Try saved URL first
      const savedUrl = await this.getSavedBackendUrl();
      if (savedUrl) {
        console.log(`🔍 Testing saved URL: ${savedUrl}`);
        onProgress?.(savedUrl, 0, 1);

        const works = await testUrl(savedUrl);
        if (works) {
          console.log(`✅ Saved URL works: ${savedUrl}`);
          this.currentBackendUrl = savedUrl;
          this.isDiscovering = false;
          return savedUrl;
        } else {
          console.log(`❌ Saved URL no longer works: ${savedUrl}`);
        }
      }

      // Step 2: Try all possible URLs
      const urls = generateBackendUrls();
      console.log(`🔍 Testing ${urls.length} possible URLs...`);

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        console.log(`🔍 [${i + 1}/${urls.length}] Testing: ${url}`);
        onProgress?.(url, i + 1, urls.length);

        const works = await testUrl(url);
        if (works) {
          console.log(`✅ Found working backend: ${url}`);
          await this.saveBackendUrl(url);
          this.isDiscovering = false;
          return url;
        }
      }

      // No backend found
      console.log('❌ No working backend found');
      this.isDiscovering = false;
      return null;
    } catch (error) {
      console.error('❌ Discovery error:', error);
      this.isDiscovering = false;
      return null;
    }
  }

  /**
   * Quick discovery - only try saved URL and common ones
   */
  static async quickDiscover(): Promise<string | null> {
    console.log('⚡ Quick discovery...');

    // Try saved first
    const savedUrl = await this.getSavedBackendUrl();
    if (savedUrl && (await testUrl(savedUrl, 1500))) {
      this.currentBackendUrl = savedUrl;
      return savedUrl;
    }

    // Try most common patterns quickly - YOUR IP FIRST!
    const quickUrls = [
      'http://10.0.10.156:5001', // Your current IP - FIRST!
      'http://10.0.10.157:5001',
      'http://10.0.10.158:5001',
      'http://192.168.1.100:5001',
      'http://192.168.0.100:5001',
      'http://localhost:5001',
    ];

    for (const url of quickUrls) {
      if (await testUrl(url, 1000)) {
        await this.saveBackendUrl(url);
        return url;
      }
    }

    return null;
  }

  /**
   * Test a custom URL
   */
  static async testCustomUrl(url: string): Promise<boolean> {
    console.log(`🧪 Testing custom URL: ${url}`);

    // Ensure URL has http:// prefix
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `http://${url}`;
    }

    const works = await testUrl(url, 3000);

    if (works) {
      console.log(`✅ Custom URL works: ${url}`);
      await this.saveBackendUrl(url);
      return true;
    } else {
      console.log(`❌ Custom URL failed: ${url}`);
      return false;
    }
  }

  /**
   * Add custom IP to discovery list
   */
  static addCustomIP(ip: string, port: number = 5001): void {
    const url = `http://${ip}:${port}`;
    console.log(`➕ Added custom URL to discovery: ${url}`);
    // The IP will be tried in next discovery
  }
}
