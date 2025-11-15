/**
 * Test Fallback System
 * Run this to verify that offline mode works correctly
 */

import { APIService } from '../services/apiService';
import { MockDataService } from '../services/mockDataService';

export async function testFallbackSystem() {
  console.log('🧪 Testing Fallback System...\n');

  // Test 1: Health Check
  console.log('Test 1: Health Check');
  const isOnline = await APIService.healthCheck();
  console.log(`Result: ${isOnline ? '✅ Backend Online' : '⚠️ Backend Offline (Fallback Active)'}\n`);

  // Test 2: Get Nearby Potholes
  console.log('Test 2: Get Nearby Potholes (Novi Sad center)');
  const potholes = await APIService.getNearbyPotholes(45.2551, 19.8451, 2000);
  console.log(`Result: Found ${potholes.length} potholes`);
  console.log(`First pothole:`, potholes[0]);
  console.log('');

  // Test 3: Send Pothole Event
  console.log('Test 3: Send Pothole Event');
  const eventData = {
    location: {
      type: 'Point' as const,
      coordinates: [19.8451, 45.2551] as [number, number],
    },
    accelerationData: {
      magnitude: 25.5,
      x: 10.2,
      y: 15.3,
      z: 12.1,
    },
    speed: 35.5,
    timestamp: new Date(),
  };

  const eventResult = await APIService.sendPotholeEvent(eventData);
  console.log('Result:', eventResult);
  console.log('');

  // Test 4: Mock Data Directly
  console.log('Test 4: Mock Data Service (Direct)');
  const mockPotholes = MockDataService.getNearbyPotholes(45.2551, 19.8451, 2000);
  console.log(`Mock potholes: ${mockPotholes.length}`);
  console.log(`Mock pothole locations:`);
  mockPotholes.forEach((p, i) => {
    console.log(`  ${i + 1}. Severity ${p.severity} at [${p.location.coordinates[1]}, ${p.location.coordinates[0]}]`);
  });
  console.log('');

  // Test 5: Backend Status
  console.log('Test 5: Backend Status');
  const status = APIService.isOnline();
  console.log(`APIService.isOnline(): ${status}`);
  console.log(`Backend Host: ${APIService.getBackendHost()}`);
  console.log('');

  console.log('✅ Fallback System Test Complete!');
  console.log('');
  console.log('Summary:');
  console.log(`- Backend ${isOnline ? 'CONNECTED' : 'OFFLINE'}`);
  console.log(`- Potholes retrieved: ${potholes.length}`);
  console.log(`- Mock data available: ${mockPotholes.length} potholes`);
  console.log(`- Fallback system: ${!isOnline && potholes.length > 0 ? '✅ WORKING' : isOnline ? '⚠️ Not tested (backend online)' : '❌ FAILED'}`);

  return {
    isOnline,
    potholesFound: potholes.length,
    mockDataAvailable: mockPotholes.length,
    fallbackWorking: !isOnline && potholes.length > 0,
  };
}

// Auto-run test if imported
if (process.env.NODE_ENV === 'development') {
  console.log('To run fallback test, call: import { testFallbackSystem } from "./utils/testFallback"; testFallbackSystem();');
}
