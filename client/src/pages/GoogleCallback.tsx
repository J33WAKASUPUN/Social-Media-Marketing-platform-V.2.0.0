import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
      // Store tokens
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refresh);

      // Fetch user data
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
      localStorage.setItem('user', JSON.stringify(data.data.user));

      toast.success(`Welcome, ${data.data.user.name}!`);
      navigate('/dashboard');
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