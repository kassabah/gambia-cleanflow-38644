import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import TaskList from '@/components/collector/TaskList';
import LocationSharing from '@/components/collector/LocationSharing';
import { LogOut } from 'lucide-react';
import { Card } from '@/components/ui/card';

const CollectorDashboard = () => {
  const { signOut } = useAuth();
  const [collectorData, setCollectorData] = useState<any>(null);

  useEffect(() => {
    fetchCollectorData();
  }, []);

  const fetchCollectorData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('collectors')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setCollectorData(data);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Collector Dashboard</h1>
            {collectorData && (
              <p className="text-sm text-muted-foreground">
                Vehicle: {collectorData.vehicle_number}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <LocationSharing collectorId={collectorData?.id} />
          </Card>
          <div>
            <TaskList collectorId={collectorData?.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorDashboard;
