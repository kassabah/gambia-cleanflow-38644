import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

interface Resident {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  is_approved: boolean;
  created_at: string;
}

const ManageResidents = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setResidents(data);
    }
    setLoading(false);
  };

  const approveResident = async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: true })
      .eq('id', id);

    if (error) {
      toast.error('Failed to approve resident');
    } else {
      toast.success('Resident approved!');
      fetchResidents();
    }
  };

  const deleteResident = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resident?')) return;

    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error) {
      toast.error('Failed to delete resident');
    } else {
      toast.success('Resident deleted');
      fetchResidents();
    }
  };

  if (loading) {
    return <Card className="p-6"><p className="text-center">Loading...</p></Card>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Residents</h2>
      
      {residents.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No residents registered</p>
      ) : (
        <div className="space-y-3">
          {residents.map((resident) => (
            <div key={resident.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{resident.full_name}</p>
                  {resident.is_approved ? (
                    <Badge className="bg-green-500/10 text-green-600">Approved</Badge>
                  ) : (
                    <Badge className="bg-yellow-500/10 text-yellow-600">Pending</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{resident.email}</p>
                <p className="text-sm text-muted-foreground">{resident.phone}</p>
              </div>
              
              <div className="flex gap-2">
                {!resident.is_approved && (
                  <Button size="sm" onClick={() => approveResident(resident.id)}>
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => deleteResident(resident.id)}>
                  <X className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ManageResidents;
