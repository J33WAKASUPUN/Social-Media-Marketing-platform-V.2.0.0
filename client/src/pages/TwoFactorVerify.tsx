import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Shield, 
  Smartphone, 
  Mail, 
  ArrowLeft,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { twoFactorApi } from "@/services/twoFactorApi";
import { useAuth } from "@/contexts/AuthContext";

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
      const pastedCode = value.slice(0, 6).split('');
      const newCode = [...code];
      pastedCode.forEach((char, i) => {
        if (index + i < 6) {
          newCode[index + i] = char;
        }
      });
      setCode(newCode);
      
      // Focus last filled input or next empty
      const nextIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
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

  const handleVerify = async () => {
    const fullCode = code.join('');
    
    if (fullCode.length !== 6 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    try {
      // Verify 2FA code
      await twoFactorApi.verifyCode(fullCode, userId);
      
      // Complete login
      const response = await twoFactorApi.complete2FALogin(userId);
      
      // Store tokens and user
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setUser(response.data.user);
      
      toast.success('Verification successful!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid verification code');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setIsSubmitting(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
          <CardDescription>
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
                  digit && "border-violet-500 bg-violet-50"
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
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}