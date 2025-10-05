import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';

interface Collector {
  id: string;
  user_id: string;
  vehicle_number: string;
  vehicle_type: string;
  is_available: boolean;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  };
}

const ManageCollectors = () => {
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    vehicleNumber: '',
    vehicleType: ''
  });

  useEffect(() => {
    fetchCollectors();
  }, []);

  const fetchCollectors = async () => {
    const { data, error } = await supabase
      .from('collectors')
      .select(`
        *,
        profiles (
          full_name,
          email,
          phone
        )
      `);
    
    if (!error && data) {
      setCollectors(data as any);
    }
    setLoading(false);
  };

  const createCollector = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
      user_metadata: {
        full_name: formData.fullName,
        phone: formData.phone
      }
    });

    if (authError) {
      toast.error('Failed to create collector account');
      return;
    }

    // Add collector role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: authData.user.id, role: 'collector' });

    if (roleError) {
      toast.error('Failed to assign collector role');
      return;
    }

    // Create collector record
    const { error: collectorError } = await supabase
      .from('collectors')
      .insert({
        user_id: authData.user.id,
        vehicle_number: formData.vehicleNumber,
        vehicle_type: formData.vehicleType,
        is_available: true
      });

    if (collectorError) {
      toast.error('Failed to create collector profile');
      return;
    }

    toast.success('Collector created successfully!');
    setOpen(false);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      vehicleNumber: '',
      vehicleType: ''
    });
    fetchCollectors();
  };

  const deleteCollector = async (userId: string) => {
    if (!confirm('Delete this collector?')) return;

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      toast.error('Failed to delete collector');
    } else {
      toast.success('Collector deleted');
      fetchCollectors();
    }
  };

  if (loading) {
    return <Card className="p-6"><p className="text-center">Loading...</p></Card>;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Collectors</h2>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Collector
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collector</DialogTitle>
            </DialogHeader>
            <form onSubmit={createCollector} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Vehicle Number</Label>
                <Input
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Vehicle Type</Label>
                <Input
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                  placeholder="e.g., Truck, Van"
                />
              </div>
              <Button type="submit" className="w-full">Create Collector</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {collectors.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No collectors created</p>
      ) : (
        <div className="space-y-3">
          {collectors.map((collector) => (
            <div key={collector.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{collector.profiles?.full_name}</p>
                <p className="text-sm text-muted-foreground">{collector.vehicle_number}</p>
                <p className="text-sm text-muted-foreground">{collector.profiles?.phone}</p>
              </div>
              
              <Button size="sm" variant="destructive" onClick={() => deleteCollector(collector.user_id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ManageCollectors;
