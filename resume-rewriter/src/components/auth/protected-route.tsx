import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    // 将用户重定向到登录页面，并保存他们尝试访问的页面
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
