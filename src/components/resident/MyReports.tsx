import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface Report {
  id: string;
  location_address: string;
  description: string;
  status: string;
  reported_at: string;
  cleared_at: string;
}

const MyReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
    
    const channel = supabase
      .channel('my-reports')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports'
        },
        () => {
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReports = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('reported_at', { ascending: false });
      
      if (!error && data) {
        setReports(data);
      }
    }
    setLoading(false);
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
      <h2 className="text-2xl font-bold mb-6">My Reports</h2>
      
      {reports.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No reports submitted yet</p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{report.location_address}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(report.reported_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={getStatusColor(report.status)}>
                  {report.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{report.description}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default MyReports;
