import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Shield, Smartphone, Mail, Loader2, RefreshCw, ArrowLeft, AlertTriangle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { twoFactorApi } from '@/services/twoFactorApi';

export default function TwoFactorVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  
  // Get data from login redirect
  const { userId, twoFactorMethod } = (location.state as any) || {};
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!userId) {
      toast.error('Invalid session. Please login again.');
      navigate('/login');
      return;
    }

    if (twoFactorMethod === 'email') {
      handleResendCode();
    }
  }, [userId, twoFactorMethod]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (code.every(c => c !== '') && !isSubmitting) {
      handleVerify();
    }
  }, [code, isSubmitting]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < 6) newCode[index + i] = digit;
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) return toast.error('Please enter the complete 6-digit code');

    setIsSubmitting(true);
    setLoading(true);

    try {
      await twoFactorApi.verifyCode(fullCode, userId);
      const response = await twoFactorApi.complete2FALogin(userId);
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      setUser(response.data.user);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid verification code';
      toast.error(message);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      await twoFactorApi.sendCode(userId);
      toast.success('Verification code sent to your email');
      setCountdown(60);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16 xl:px-24 bg-background">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <img 
                src="/logo.png" 
                alt="SocialFlow" 
                className="h-10 w-10"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                SocialFlow
              </span>
            </div>
          </div>

          <div className="text-center mb-8">
             <div className="mx-auto w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Two-Factor Authentication</h1>
              <p className="mt-2 text-muted-foreground">
                {twoFactorMethod === 'totp' ? 'Enter the code from your authenticator app' : 'Enter the code sent to your email'}
              </p>
          </div>

          <div className="space-y-6">
            {twoFactorMethod === 'email' && (
              <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
                  <strong>Can't find the code?</strong> Check your <strong>Spam</strong> or <strong>Junk</strong> folder.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={cn(
                    "w-12 h-14 text-center text-2xl font-bold border-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500",
                    digit && "border-violet-500 bg-violet-50 dark:bg-violet-950"
                  )}
                  disabled={loading}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <Button onClick={handleVerify} disabled={loading || code.some(c => c === '')} className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/30">
              {loading ? (
                <div className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Verifying...</div>
              ) : 'Verify'}
            </Button>

            {twoFactorMethod === 'email' && (
              <div className="text-center">
                <Button variant="ghost" onClick={handleResendCode} disabled={resending || countdown > 0} className="text-sm text-muted-foreground">
                  {resending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : countdown > 0 ? `Resend code in ${countdown}s` : <><RefreshCw className="mr-2 h-4 w-4" /> Resend code</>}
                </Button>
              </div>
            )}

            <div className="text-center">
              <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image (Updated) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        {/* Background Circles */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Content Container */}
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
              Two-Factor Security
            </h2>
            <p className="text-lg text-violet-100/90">
              Protect your account with an extra layer of security.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['Enhanced Protection', 'Secure Access', 'Real-time Alerts'].map((feature) => (
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