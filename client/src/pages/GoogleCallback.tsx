import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const refresh = searchParams.get('refresh');
    const error = searchParams.get('error');

    if (error) {
      toast.error(`Google login failed: ${error}`);
      navigate('/login');
      return;
    }

    if (token && refresh) {
      // Store tokens FIRST
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refresh);

      // Then fetch user data
      fetchUserData(token);
    } else {
      toast.error('Invalid authentication response');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      const userData = data.data.user;

      // Set user in BOTH localStorage AND AuthContext
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Call setUser from AuthContext (need to update AuthContext first)
      // For now, just refresh the page to trigger AuthContext useEffect
      
      toast.success(`Welcome, ${userData.name}!`);
      
      // USE REPLACE INSTEAD OF NAVIGATE TO AVOID BACK BUTTON ISSUES
      navigate('/dashboard', { replace: true });
      
      // FORCE PAGE RELOAD TO TRIGGER AUTHCONTEXT REFRESH
      window.location.reload();
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to complete authentication');
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-sm text-muted-foreground">Completing Google sign-in...</p>
      </div>
    </div>
  );
}