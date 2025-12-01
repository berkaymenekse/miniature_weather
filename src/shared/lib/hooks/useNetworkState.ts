import { useEffect, useState } from 'react';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string | null;
}

/**
 * Optimistic network connectivity hook
 * Assumes connection is always available unless proven otherwise by multiple failures
 * This prevents false negatives from blocking image loading and other network operations
 * @returns Current network state with connection status
 */
export const useNetworkState = (): NetworkState => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true, // Optimistically assume connected
    isInternetReachable: true,
    type: 'unknown',
  });

  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const MAX_FAILURES_BEFORE_OFFLINE = 3; // Require 3 consecutive failures before marking offline

  useEffect(() => {
    let isActive = true;

    const checkConnectivity = async () => {
      try {
        // Simple connectivity check using a reliable endpoint
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // Increased timeout to 5s

        await fetch('https://www.google.com/generate_204', {
          method: 'HEAD',
          cache: 'no-cache',
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!isActive) return;

        // Success - reset failure count and mark as connected
        setConsecutiveFailures(0);
        setNetworkState({
          isConnected: true,
          isInternetReachable: true,
          type: 'wifi', // Can't determine exact type without native modules
        });
      } catch (error) {
        if (!isActive) return;

        // Increment failure count
        setConsecutiveFailures((prev) => {
          const newCount = prev + 1;
          
          // Only mark as offline after multiple consecutive failures
          if (newCount >= MAX_FAILURES_BEFORE_OFFLINE) {
            console.warn(`[Network] ${newCount} consecutive failures - marking as offline`);
            setNetworkState({
              isConnected: false,
              isInternetReachable: false,
              type: null,
            });
          } else {
            console.log(`[Network] Check failed (${newCount}/${MAX_FAILURES_BEFORE_OFFLINE}) - staying optimistic`);
          }
          
          return newCount;
        });
      }
    };

    // Initial check
    checkConnectivity();

    // Periodic check every 30 seconds (reduced frequency)
    const interval = setInterval(checkConnectivity, 30000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, []);

  return networkState;
};

