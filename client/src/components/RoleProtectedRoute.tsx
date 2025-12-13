import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { BrandedLoader } from '@/components/BrandedLoader'; // ✅ NEW IMPORT

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: keyof ReturnType<typeof usePermissions>;
  fallbackPath?: string;
  showAccessDenied?: boolean;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  requiredPermission,
  fallbackPath = '/dashboard',
  showAccessDenied = true,
}) => {
  const permissions = usePermissions();
  const { loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Show branded loader instead of gray skeletons
  if (authLoading || permissions.role === null) {
    return <BrandedLoader />;
  }

  // If no permission required, allow access
  if (!requiredPermission) {
    return <>{children}</>;
  }

  // Check if user has the required permission
  const hasPermission = permissions[requiredPermission];

  // If user doesn't have permission
  if (!hasPermission) {
    // Show access denied page instead of redirect
    if (showAccessDenied) {
      return (
        <div className="flex min-h-[80vh] items-center justify-center p-6">
          <div className="max-w-md w-full">
            <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
              <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-lg font-semibold text-red-900 dark:text-red-100">
                Access Denied
              </AlertTitle>
              <AlertDescription className="mt-2 text-red-800 dark:text-red-200">
                <p className="mb-4">
                  You don't have permission to access this page. This action requires <strong>{requiredPermission}</strong> permission.
                </p>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Your current role: <span className="text-red-900 dark:text-red-100">{permissions.role || 'None'}</span></p>
                  <p>Contact your organization owner to request higher permissions.</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="border-red-200 dark:border-red-800"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    // Silent redirect to fallback path
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // User has permission, render children
  return <>{children}</>;
};