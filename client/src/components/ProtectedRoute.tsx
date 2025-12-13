import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { BrandedLoader } from '@/components/BrandedLoader';

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

  // Show branded loader
  if (loading || !isReady) {
    return <BrandedLoader />;
  }

  // REDIRECT TO LOGIN IF NOT AUTHENTICATED
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};