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

    // ✅ NEW: Check for 2FA redirect parameters
    const userId = searchParams.get('userId');
    const method = searchParams.get('method');
    const deviceId = searchParams.get('deviceId');
    const deviceName = searchParams.get('deviceName');

    if (error) {
      toast.error(`Google login failed: ${error}`);
      navigate('/login');
      return;
    }

    // ✅ NEW: Handle 2FA redirect
    if (userId && method && deviceId) {
      toast.info('2FA verification required for this device');
      navigate('/2fa-verify', {
        state: {
          userId,
          twoFactorMethod: method,
          deviceId,
          deviceName: deviceName ? decodeURIComponent(deviceName) : 'Unknown Device',
        },
        replace: true,
      });
      return;
    }

    // Normal login flow
    if (token && refresh) {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refresh);
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

      if (!response.ok) throw new Error('Failed to fetch user data');

      const { data } = await response.json();
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      toast.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Fetch user error:', error);
      toast.error('Failed to load user data');
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing Google sign-in...</p>
      </div>
    </div>
  );
}