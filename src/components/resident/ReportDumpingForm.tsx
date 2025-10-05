import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MapPin, Upload } from 'lucide-react';

const ReportDumpingForm = () => {
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
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
    
    if (!address || !lat || !lng || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('Please login first');
      setLoading(false);
      return;
    }

    let photoUrl = null;
    
    // Note: Photo upload will require storage bucket setup
    if (photo) {
      toast.info('Photo upload feature coming soon!');
    }

    const { error } = await supabase.from('reports').insert({
      user_id: user.id,
      location_address: address,
      location_lat: parseFloat(lat),
      location_lng: parseFloat(lng),
      description,
      photo_url: photoUrl,
      status: 'pending'
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to submit report');
    } else {
      toast.success('Report submitted successfully!');
      setAddress('');
      setLat('');
      setLng('');
      setDescription('');
      setPhoto(null);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Report Illegal Dumping</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="address">Location Address</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter location address"
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
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the illegal dumping..."
            rows={4}
            required
          />
        </div>

        <div>
          <Label htmlFor="photo">Photo (Optional)</Label>
          <Input
            id="photo"
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Report'}
        </Button>
      </form>
    </Card>
  );
};

export default ReportDumpingForm;
