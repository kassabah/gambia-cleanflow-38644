import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Booking {
  id: string;
  location_address: string;
  status: string;
  requested_at: string;
  profiles: { full_name: string };
  collectors: { vehicle_number: string } | null;
}

const ManageBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [collectors, setCollectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [bookingsResult, collectorsResult] = await Promise.all([
      supabase.from('bookings').select(`
        *,
        profiles (full_name),
        collectors (vehicle_number)
      `).order('requested_at', { ascending: false }),
      supabase.from('collectors').select('*')
    ]);
    
    if (bookingsResult.data) setBookings(bookingsResult.data as any);
    if (collectorsResult.data) setCollectors(collectorsResult.data);
    setLoading(false);
  };

  const assignCollector = async (bookingId: string, collectorId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ 
        collector_id: collectorId,
        status: 'assigned',
        assigned_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (error) {
      toast.error('Failed to assign collector');
    } else {
      toast.success('Collector assigned!');
      fetchData();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-600';
      case 'in_progress': return 'bg-blue-500/10 text-blue-600';
      case 'assigned': return 'bg-yellow-500/10 text-yellow-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  if (loading) {
    return <Card className="p-6"><p className="text-center">Loading...</p></Card>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Bookings</h2>
      
      {bookings.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No bookings yet</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium">{booking.location_address}</p>
                  <p className="text-sm text-muted-foreground">
                    Resident: {booking.profiles?.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(booking.requested_at).toLocaleString()}
                  </p>
                  {booking.collectors && (
                    <p className="text-sm text-muted-foreground">
                      Assigned: {booking.collectors.vehicle_number}
                    </p>
                  )}
                </div>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status.replace('_', ' ')}
                </Badge>
              </div>
              
              {booking.status === 'pending' && (
                <div className="flex gap-2 items-center mt-3">
                  <Select onValueChange={(value) => assignCollector(booking.id, value)}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Assign collector" />
                    </SelectTrigger>
                    <SelectContent>
                      {collectors.map((collector) => (
                        <SelectItem key={collector.id} value={collector.id}>
                          {collector.vehicle_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ManageBookings;
