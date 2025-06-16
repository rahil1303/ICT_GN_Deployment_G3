import { useState, useEffect, useCallback } from "react";
import { useAccessibility } from "../contexts/AccessibilityContext";

interface GeolocationState {
  position: GeolocationPosition | null;
  error: GeolocationPositionError | null;
  loading: boolean;
}

export function useGeolocation(options?: PositionOptions) {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: false
  });
  
  const { announceToUser } = useAccessibility();

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      const error = new Error('Geolocation not supported') as GeolocationPositionError;
      error.code = 0;
      setState(prev => ({ ...prev, error, loading: false }));
      announceToUser('Location services not available');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    announceToUser('Getting your location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({ position, error: null, loading: false });
        announceToUser('Location acquired');
      },
      (error) => {
        setState(prev => ({ ...prev, error, loading: false }));
        const errorMessages = {
          [error.PERMISSION_DENIED]: 'Location access denied. Please enable location services.',
          [error.POSITION_UNAVAILABLE]: 'Location information unavailable.',
          [error.TIMEOUT]: 'Location request timed out.'
        };
        announceToUser(errorMessages[error.code] || 'Failed to get location');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
        ...options
      }
    );
  }, [options, announceToUser]);

  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) return null;

    return navigator.geolocation.watchPosition(
      (position) => {
        setState(prev => ({ ...prev, position }));
      },
      (error) => {
        setState(prev => ({ ...prev, error }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute
        ...options
      }
    );
  }, [options]);

  return {
    ...state,
    getCurrentPosition,
    watchPosition,
    isSupported: !!navigator.geolocation
  };
}
