import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Shield, Smartphone, Mail, Loader2, RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react';
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

    // Auto-send email code if email method
    if (twoFactorMethod === 'email') {
      handleResendCode();
    }
  }, [userId, twoFactorMethod]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-submit when all digits entered
  useEffect(() => {
    if (code.every(c => c !== '') && !isSubmitting) {
      handleVerify();
    }
  }, [code, isSubmitting]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Move to next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      // Verify the 2FA code
      await twoFactorApi.verifyCode(fullCode, userId);
      
      // Complete login after verification
      const response = await twoFactorApi.complete2FALogin(userId);
      
      // Store tokens
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      
      // Set user in context
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
          <CardDescription className="text-base">
            {twoFactorMethod === 'totp' ? (
              <>
                <Smartphone className="inline h-4 w-4 mr-1" />
                Enter the code from your authenticator app
              </>
            ) : (
              <>
                <Mail className="inline h-4 w-4 mr-1" />
                Enter the code sent to your email
              </>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Spam Notice for Email 2FA */}
          {twoFactorMethod === 'email' && (
            <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
                <strong>Can't find the code?</strong> Check your <strong>Spam</strong> or <strong>Junk</strong> folder.
              </AlertDescription>
            </Alert>
          )}

          {/* Code Input */}
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
                  "w-12 h-14 text-center text-2xl font-bold border-2",
                  "focus:ring-2 focus:ring-violet-500 focus:border-violet-500",
                  digit && "border-violet-500 bg-violet-50 dark:bg-violet-950"
                )}
                disabled={loading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={loading || code.some(c => c === '')}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </Button>

          {/* Resend Code */}
          {twoFactorMethod === 'email' && (
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={handleResendCode}
                disabled={resending || countdown > 0}
                className="text-sm text-muted-foreground"
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

          {/* Use Backup Code */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Having trouble?</p>
            <button
              onClick={() => toast.info('Enter one of your backup codes in the field above')}
              className="text-violet-600 hover:underline"
            >
              Use a backup code
            </button>
          </div>

          {/* Back to Login */}
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}