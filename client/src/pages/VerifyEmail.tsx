import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Verification token is missing');
      setVerifying(false);
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await api.get(`/auth/verify-email?token=${token}`);
      
      if (response.data.success) {
        setSuccess(true);
        toast.success('Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Verification failed';
      setError(message);
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
              {verifying && (
                <div className="p-4 rounded-full bg-violet-100 dark:bg-violet-900/30">
                  <Loader2 className="h-8 w-8 text-violet-600 dark:text-violet-400 animate-spin" />
                </div>
              )}
              {!verifying && success && (
                <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              )}
              {!verifying && error && (
                <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30">
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              )}
            </div>

            <CardTitle className="text-2xl">
              {verifying && 'Verifying Email...'}
              {!verifying && success && 'Email Verified!'}
              {!verifying && error && 'Verification Failed'}
            </CardTitle>

            <CardDescription>
              {verifying && 'Please wait while we verify your email address'}
              {!verifying && success && 'Your email has been successfully verified'}
              {!verifying && error && 'We couldn\'t verify your email address'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {verifying && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="h-2 w-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2 w-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-2 w-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}

            {!verifying && success && (
              <>
                <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Your account is now active! You can log in and start managing your social media.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Email verified successfully
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Account activated
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Redirecting to login page...
                  </p>
                </div>

                <Button
                  className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                  onClick={() => navigate('/login')}
                >
                  Continue to Login
                </Button>
              </>
            )}

            {!verifying && error && (
              <>
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>

                <div className="space-y-3 text-sm text-muted-foreground">
                  <p><strong>Common reasons:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Verification link has expired (24 hours)</li>
                    <li>Email already verified</li>
                    <li>Invalid or tampered link</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/register')}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </Button>

                  <Link to="/login">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {/* Help Section */}
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Need help?</strong> Contact our support team at{" "}
                <a href="mailto:support@socialflow.com" className="text-violet-600 hover:underline">
                  support@socialflow.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <div className="mt-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <img src="/logo.png" alt="SocialFlow" className="h-6 w-6" />
            <span className="font-semibold">SocialFlow</span>
          </Link>
        </div>
      </div>
    </div>
  );
}