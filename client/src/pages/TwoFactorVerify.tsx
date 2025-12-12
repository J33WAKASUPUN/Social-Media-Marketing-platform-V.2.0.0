import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Shield, Smartphone, Mail, Loader2, RefreshCw, ArrowLeft, AlertTriangle, Sparkles, Monitor, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { twoFactorApi } from '@/services/twoFactorApi';

export default function TwoFactorVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  
  const userId = location.state?.userId;
  const twoFactorMethod = location.state?.twoFactorMethod;
  const deviceId = location.state?.deviceId; // ✅ NEW
  const deviceName = location.state?.deviceName; // ✅ NEW

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!userId) {
      toast.error('Session expired. Please login again.');
      navigate('/login');
      return;
    }

    // Auto-focus input
    inputRef.current?.focus();
  }, [userId, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);

    try {
      // 1. Verify 2FA code
      await twoFactorApi.verifyCode(code, userId);

      // 2. Complete login (✅ NOW includes deviceId)
      const response = await api.post('/auth/2fa/complete-login', { 
        userId,
        deviceId, // ✅ NEW: Include deviceId
      });

      const { tokens, user } = response.data.data;

      // Store tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      // ✅ Show device trust confirmation
      toast.success('✅ Login successful! This device is now trusted for 30 days.');
      navigate('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Verification failed';
      toast.error(message);
      setCode('');
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (twoFactorMethod === 'totp') {
      toast.info('Authenticator app codes don\'t expire. Use your app to generate a new code.');
      return;
    }

    if (countdown > 0) return;

    setResending(true);
    try {
      await twoFactorApi.sendCode(userId);
      toast.success('Verification code sent!');
      setCountdown(60);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Verification Form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16 xl:px-24 bg-background">
        <div className="mx-auto w-full max-w-md">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>

          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    {twoFactorMethod === 'totp' ? 'Enter code from authenticator app' : 'Enter code from email'}
                  </CardDescription>
                </div>
              </div>

              {/* ✅ NEW: Device Detection Alert */}
              {deviceName && (
                <Alert className="mt-4 border-blue-500/20 bg-blue-500/5">
                  <Monitor className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription>
                    <p className="font-semibold text-sm">🔐 New device detected</p>
                    <p className="text-xs mt-1 text-muted-foreground">{deviceName}</p>
                    <p className="text-xs mt-2 flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check className="h-3 w-3" />
                      After verification, this device will be trusted for 30 days
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </CardHeader>

            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Verification Code</label>
                  <Input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="000000"
                    value={code}
                    onChange={handleInputChange}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest font-mono h-14"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {twoFactorMethod === 'totp' 
                      ? 'Open your authenticator app' 
                      : 'Check your email for the verification code'}
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={loading || code.length !== 6}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Continue'
                  )}
                </Button>
              </form>

              {twoFactorMethod === 'email' && (
                <div className="mt-4 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResendCode}
                    disabled={resending || countdown > 0}
                  >
                    {resending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : countdown > 0 ? (
                      `Resend code in ${countdown}s`
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resend code
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div className="text-center mt-6">
                <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
          </div>
          <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-black/30 ring-1 ring-white/20">
            <img
              src="https://raw.githubusercontent.com/J33WAKASUPUN/Social-Media-Marketing-platform-V.2.0.0/main/social%20flow.png"
              alt="SocialFlow Platform"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-violet-900/40 via-transparent to-transparent"></div>
          </div>

          <div className="mt-10 text-center max-w-md">
            <h2 className="text-3xl font-bold text-white mb-4">
              Enhanced Security
            </h2>
            <p className="text-lg text-violet-100/90">
              Your account is protected with device-aware two-factor authentication.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['Device Tracking', 'Secure Access', '30-Day Trust'].map((feature) => (
              <span
                key={feature}
                className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium border border-white/20"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}