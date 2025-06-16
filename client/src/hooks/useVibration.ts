import { useCallback } from "react";

export function useVibration() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
        return true;
      } catch (error) {
        console.warn('Vibration failed:', error);
        return false;
      }
    }
    return false;
  }, []);

  const vibrateSuccess = useCallback(() => {
    return vibrate(200);
  }, [vibrate]);

  const vibrateError = useCallback(() => {
    return vibrate([100, 100, 100]);
  }, [vibrate]);

  const vibrateNotification = useCallback(() => {
    return vibrate([200, 100, 200]);
  }, [vibrate]);

  const vibrateAssistance = useCallback(() => {
    return vibrate([100, 50, 100]);
  }, [vibrate]);

  const isSupported = 'vibrate' in navigator;

  return {
    vibrate,
    vibrateSuccess,
    vibrateError,
    vibrateNotification,
    vibrateAssistance,
    isSupported
  };
}
