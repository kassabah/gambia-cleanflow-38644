import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MapPin, Navigation } from 'lucide-react';

const LocationSharing = ({ collectorId }: { collectorId: string | null }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const startSharing = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        if (collectorId) {
          const { error } = await supabase
            .from('collectors')
            .update({
              current_lat: position.coords.latitude,
              current_lng: position.coords.longitude,
              last_location_update: new Date().toISOString()
            })
            .eq('id', collectorId);

          if (error) {
            toast.error('Failed to update location');
          }
        }
      },
      (error) => {
        toast.error('Unable to get location');
        setIsSharing(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000
      }
    );

    setWatchId(id);
    setIsSharing(true);
    toast.success('Location sharing started');
  };

  const stopSharing = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsSharing(false);
    toast.info('Location sharing stopped');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Location Sharing</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Share your location in real-time so residents and admins can track your truck
      </p>
      
      {!isSharing ? (
        <Button onClick={startSharing} className="w-full">
          <Navigation className="mr-2 h-4 w-4" />
          Start Sharing Location
        </Button>
      ) : (
        <div>
          <div className="flex items-center justify-center p-4 bg-green-500/10 text-green-600 rounded-lg mb-4">
            <MapPin className="mr-2 h-5 w-5 animate-pulse" />
            <span className="font-medium">Sharing Location</span>
          </div>
          <Button variant="destructive" onClick={stopSharing} className="w-full">
            Stop Sharing
          </Button>
        </div>
      )}
    </div>
  );
};

export default LocationSharing;
