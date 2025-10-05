import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';

const BookingForm = () => {
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toString());
          setLng(position.coords.longitude.toString());
          toast.success('Location captured!');
        },
        (error) => {
          toast.error('Unable to get location');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address || !lat || !lng) {
      toast.error('Please provide address and location');
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('Please login first');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('bookings').insert({
      user_id: user.id,
      location_address: address,
      location_lat: parseFloat(lat),
      location_lng: parseFloat(lng),
      notes,
      status: 'pending'
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to create booking');
    } else {
      toast.success('Booking created successfully! Awaiting assignment.');
      setAddress('');
      setLat('');
      setLng('');
      setNotes('');
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Book Sewage Disposal Service</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="address">Location Address</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lat">Latitude</Label>
            <Input
              id="lat"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="13.4549"
              required
            />
          </div>
          <div>
            <Label htmlFor="lng">Longitude</Label>
            <Input
              id="lng"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="-16.5790"
              required
            />
          </div>
        </div>

        <Button type="button" variant="outline" onClick={getCurrentLocation} className="w-full">
          <MapPin className="mr-2 h-4 w-4" />
          Use Current Location
        </Button>

        <div>
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions..."
            rows={3}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Booking'}
        </Button>
      </form>
    </Card>
  );
};

export default BookingForm;
