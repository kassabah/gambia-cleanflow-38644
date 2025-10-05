import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Truck } from 'lucide-react';

interface Collector {
  id: string;
  vehicle_number: string;
  vehicle_type: string;
  current_lat: number;
  current_lng: number;
  is_available: boolean;
  last_location_update: string;
}

const LiveTracking = () => {
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollectors();
    
    const channel = supabase
      .channel('admin-tracking')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collectors'
        },
        () => {
          fetchCollectors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCollectors = async () => {
    const { data, error } = await supabase
      .from('collectors')
      .select('*')
      .not('current_lat', 'is', null)
      .not('current_lng', 'is', null);
    
    if (!error && data) {
      setCollectors(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <Card className="p-6"><p className="text-center">Loading...</p></Card>;
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Live Truck Tracking</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Real-time location of all collection trucks
        </p>
        
        {collectors.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No active trucks</p>
        ) : (
          <div className="space-y-3">
            {collectors.map((collector) => (
              <div 
                key={collector.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{collector.vehicle_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {collector.vehicle_type || 'Truck'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Location: {collector.current_lat?.toFixed(4)}, {collector.current_lng?.toFixed(4)}
                    </p>
                    {collector.last_location_update && (
                      <p className="text-xs text-muted-foreground">
                        Updated: {new Date(collector.last_location_update).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs ${
                  collector.is_available 
                    ? 'bg-green-500/10 text-green-600' 
                    : 'bg-yellow-500/10 text-yellow-600'
                }`}>
                  {collector.is_available ? 'Available' : 'On Job'}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      <Card className="p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground text-center">
          🗺️ Interactive map view with Google Maps integration coming soon!
        </p>
      </Card>
    </div>
  );
};

export default LiveTracking;
