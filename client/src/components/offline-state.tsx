import { useEffect, useState } from 'react';
import { EmptyState } from '@/components/ds';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflineState() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <EmptyState
        icon={<WifiOff className="w-16 h-16" />}
        title="No internet connection"
        description="You can see things you've already loaded, but you need internet to search for parking, book spots, or check your account. Check your connection and try again."
        ctaText="Try Again"
        onCtaClick={() => window.location.reload()}
        className="max-w-md"
      />
    </div>
  );
}

// Hook to check online status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}