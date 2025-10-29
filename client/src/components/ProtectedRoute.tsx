import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  // WAIT A BIT LONGER FOR OAUTH CALLBACK TO COMPLETE
  useEffect(() => {
    if (!loading) {
      // Give a small delay for state updates to propagate
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // SHOW LOADING WHILE VERIFYING AUTH
  if (loading || !isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-soft">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // REDIRECT TO LOGIN IF NOT AUTHENTICATED
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};