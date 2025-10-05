import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles: string[];
}

export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { user, userRole, isApproved, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(userRole || '')) {
    return <Navigate to="/" replace />;
  }

  if (userRole === 'resident' && !isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Pending Approval</h2>
          <p className="text-muted-foreground">Your account is awaiting admin approval. Please check back later.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
