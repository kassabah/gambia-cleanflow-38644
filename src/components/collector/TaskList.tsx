import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface Task {
  id: string;
  type: 'booking' | 'report';
  location_address: string;
  status: string;
  details: string;
}

const TaskList = ({ collectorId }: { collectorId: string | null }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (collectorId) {
      fetchTasks();
      
      const channel = supabase
        .channel('collector-tasks')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings'
          },
          () => fetchTasks()
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'reports'
          },
          () => fetchTasks()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [collectorId]);

  const fetchTasks = async () => {
    if (!collectorId) return;

    const [bookingsResult, reportsResult] = await Promise.all([
      supabase.from('bookings').select('*').eq('collector_id', collectorId).neq('status', 'completed'),
      supabase.from('reports').select('*').eq('collector_id', collectorId).neq('status', 'cleared')
    ]);

    const allTasks: Task[] = [
      ...(bookingsResult.data || []).map(b => ({
        id: b.id,
        type: 'booking' as const,
        location_address: b.location_address,
        status: b.status,
        details: b.notes || 'Sewage disposal service'
      })),
      ...(reportsResult.data || []).map(r => ({
        id: r.id,
        type: 'report' as const,
        location_address: r.location_address,
        status: r.status,
        details: r.description
      }))
    ];

    setTasks(allTasks);
    setLoading(false);
  };

  const updateTaskStatus = async (task: Task, newStatus: string) => {
    const table = task.type === 'booking' ? 'bookings' : 'reports';
    
    const updateData: any = { status: newStatus };
    
    if (newStatus === 'in_progress') {
      updateData.started_at = new Date().toISOString();
    } else if (newStatus === 'completed' || newStatus === 'cleared') {
      updateData[task.type === 'booking' ? 'completed_at' : 'cleared_at'] = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', task.id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated successfully');
      fetchTasks();
    }
  };

  if (!collectorId) {
    return <Card className="p-6"><p>Loading collector info...</p></Card>;
  }

  if (loading) {
    return <Card className="p-6"><p>Loading tasks...</p></Card>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">My Tasks</h2>
      
      {tasks.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No tasks assigned</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {task.type === 'booking' ? '🚰 Sewage' : '🚨 Report'}
                  </Badge>
                  <p className="font-medium">{task.location_address}</p>
                  <p className="text-sm text-muted-foreground mt-1">{task.details}</p>
                </div>
                <Badge>{task.status.replace('_', ' ')}</Badge>
              </div>
              
              <div className="flex gap-2 mt-3">
                {task.status === 'assigned' && (
                  <Button 
                    size="sm" 
                    onClick={() => updateTaskStatus(task, 'in_progress')}
                  >
                    Start Task
                  </Button>
                )}
                {task.status === 'in_progress' && (
                  <Button 
                    size="sm" 
                    onClick={() => updateTaskStatus(task, task.type === 'booking' ? 'completed' : 'cleared')}
                  >
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default TaskList;
