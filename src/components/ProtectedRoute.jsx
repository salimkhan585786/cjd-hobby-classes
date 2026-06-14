import { Navigate, Outlet } from 'react-router-dom';
import LoadingSkeleton from './LoadingSkeleton';
import { useAuth } from '../hooks/useAuth';

function ProtectedRoute({ role, children }) {
  const { user, loading, role: userRole, emailVerified } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <LoadingSkeleton className="h-28 w-full rounded-[2rem]" />
          <div className="grid gap-6 lg:grid-cols-3">
            <LoadingSkeleton className="h-40" />
            <LoadingSkeleton className="h-40" />
            <LoadingSkeleton className="h-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'student' && !emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
}

export default ProtectedRoute;
