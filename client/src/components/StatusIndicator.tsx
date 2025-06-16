import { useState, useEffect } from "react";
import { Wifi, WifiOff, CloudSync, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { offlineService } from "../services/offlineService";

export default function StatusIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncCount, setSyncCount] = useState(0);
  const { announceToUser } = useAccessibility();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      announceToUser('Connection restored. Data will sync automatically.');
    };

    const handleOffline = () => {
      setIsOnline(false);
      announceToUser('Connection lost. App will work offline.');
    };

    const updateSyncCount = () => {
      setSyncCount(offlineService.getPendingOperationsCount());
    };

    // Initial sync count
    updateSyncCount();

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update sync count periodically
    const syncInterval = setInterval(updateSyncCount, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, [announceToUser]);

  const getStatusText = () => {
    if (!isOnline) {
      return syncCount > 0 
        ? `Offline - ${syncCount} items pending sync`
        : 'Offline mode active';
    }
    return syncCount > 0 
      ? `Online - Syncing ${syncCount} items`
      : 'Online and synced';
  };

  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="h-4 w-4" aria-hidden="true" />;
    }
    if (syncCount > 0) {
      return <CloudSync className="h-4 w-4 animate-spin" aria-hidden="true" />;
    }
    return <Wifi className="h-4 w-4" aria-hidden="true" />;
  };

  const getVariant = () => {
    if (!isOnline) return "destructive";
    if (syncCount > 0) return "default";
    return "secondary";
  };

  return (
    <Badge 
      variant={getVariant()}
      className="flex items-center gap-2 text-xs"
      aria-label={getStatusText()}
    >
      {getStatusIcon()}
      <span className="sr-only sm:not-sr-only">
        {isOnline ? 'Online' : 'Offline'}
        {syncCount > 0 && ` (${syncCount})`}
      </span>
    </Badge>
  );
}