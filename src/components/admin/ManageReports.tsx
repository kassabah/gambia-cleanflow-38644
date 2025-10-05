import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Report {
  id: string;
  location_address: string;
  description: string;
  status: string;
  reported_at: string;
  profiles: { full_name: string };
  collectors: { vehicle_number: string } | null;
}

const ManageReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [collectors, setCollectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [reportsResult, collectorsResult] = await Promise.all([
      supabase.from('reports').select(`
        *,
        profiles (full_name),
        collectors (vehicle_number)
      `).order('reported_at', { ascending: false }),
      supabase.from('collectors').select('*')
    ]);
    
    if (reportsResult.data) setReports(reportsResult.data as any);
    if (collectorsResult.data) setCollectors(collectorsResult.data);
    setLoading(false);
  };

  const assignCollector = async (reportId: string, collectorId: string) => {
    const { error } = await supabase
      .from('reports')
      .update({ 
        collector_id: collectorId,
        status: 'assigned',
        assigned_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (error) {
      toast.error('Failed to assign collector');
    } else {
      toast.success('Collector assigned!');
      fetchData();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cleared': return 'bg-green-500/10 text-green-600';
      case 'in_progress': return 'bg-blue-500/10 text-blue-600';
      case 'assigned': return 'bg-yellow-500/10 text-yellow-600';
      case 'rejected': return 'bg-red-500/10 text-red-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  if (loading) {
    return <Card className="p-6"><p className="text-center">Loading...</p></Card>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Reports</h2>
      
      {reports.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No reports yet</p>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium">{report.location_address}</p>
                  <p className="text-sm text-muted-foreground">
                    Reporter: {report.profiles?.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(report.reported_at).toLocaleString()}
                  </p>
                  <p className="text-sm mt-1">{report.description}</p>
                  {report.collectors && (
                    <p className="text-sm text-muted-foreground">
                      Assigned: {report.collectors.vehicle_number}
                    </p>
                  )}
                </div>
                <Badge className={getStatusColor(report.status)}>
                  {report.status.replace('_', ' ')}
                </Badge>
              </div>
              
              {report.status === 'pending' && (
                <div className="flex gap-2 items-center mt-3">
                  <Select onValueChange={(value) => assignCollector(report.id, value)}>
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

export default ManageReports;
