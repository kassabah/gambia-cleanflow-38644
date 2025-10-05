import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface Booking {
  id: string;
  location_address: string;
  status: string;
  notes: string;
  requested_at: string;
  completed_at: string;
}

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
    
    const channel = supabase
      .channel('my-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false });
      
      if (!error && data) {
        setBookings(data);
      }
    }
    setLoading(false);
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
      <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
      
      {bookings.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No bookings yet</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{booking.location_address}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(booking.requested_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status.replace('_', ' ')}
                </Badge>
              </div>
              {booking.notes && (
                <p className="text-sm text-muted-foreground mt-2">{booking.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default MyBookings;
