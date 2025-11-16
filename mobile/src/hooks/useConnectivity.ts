import { useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { APIService } from '../services/apiService';

/**
 * Hook to monitor backend connectivity
 * Automatically checks backend availability and updates store
 */
export function useConnectivity() {
  const { connectivity, setBackendAvailable, updateLastSync } = useAppStore();

  /**
   * Check backend connectivity
   */
  const checkConnectivity = useCallback(async () => {
    try {
      const isAvailable = await APIService.forceHealthCheck();
      setBackendAvailable(isAvailable);

      if (isAvailable) {
        updateLastSync();
      }

      return isAvailable;
    } catch (error) {
      console.error('Connectivity check failed:', error);
      setBackendAvailable(false);
      return false;
    }
  }, [setBackendAvailable, updateLastSync]);

  /**
   * Start periodic connectivity checks
   */
  useEffect(() => {
    // Initial check
    checkConnectivity();

    // Check every 30 seconds
    const interval = setInterval(() => {
      checkConnectivity();
    }, 30000);

    return () => clearInterval(interval);
  }, [checkConnectivity]);

  return {
    isOnline: connectivity.isBackendAvailable,
    isOffline: connectivity.isOfflineMode,
    lastSync: connectivity.lastSync,
    pendingEvents: connectivity.pendingEvents,
    checkConnectivity,
  };
}
