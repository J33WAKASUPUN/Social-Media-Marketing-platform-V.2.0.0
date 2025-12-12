import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, location]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const result = await login(email, password);
    
    // Check if 2FA verification is needed
    if (result.requires2FA) {
      navigate('/2fa-verify', {
        state: {
          userId: result.userId,
          twoFactorMethod: result.twoFactorMethod,
          deviceId: result.deviceId,
          deviceName: result.deviceName,
        },
        replace: true,
      });
      return;
    }

    // Normal login success
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  } catch (error: any) {
    console.error('Login error:', error);
  } finally {
    setLoading(false);
  }
};

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    window.location.href = `${apiUrl}/auth/google`;
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-violet-600 border-t-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16 xl:px-24 bg-background">
        <div className="mx-auto w-full max-w-md">
          {/* Logo & Header */}
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-0 mb-8">
              <img 
                src="/logo.png" 
                alt="SocialFlow" 
                className="h-12 w-12"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                SocialFlow
              </span>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Sign in to your account to continue managing your social media
            </p>
          </div>

          {/* Google Sign In */}
          <Button
            variant="outline"
            className="w-full h-12 text-base font-medium border-2 hover:bg-muted transition-all duration-200"
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground">or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </Label>
              <div className="relative">
                <Mail className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
                  focusedField === 'email' ? "text-violet-600" : "text-muted-foreground"
                )} />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={loading}
                  autoComplete="email"
                  className={cn(
                    "h-12 pl-11 text-base border-2 transition-all duration-200 bg-background",
                    focusedField === 'email' 
                      ? "border-violet-600 ring-4 ring-violet-100 dark:ring-violet-900/30" 
                      : "border-input hover:border-muted-foreground/50"
                  )}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
                  focusedField === 'password' ? "text-violet-600" : "text-muted-foreground"
                )} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className={cn(
                    "h-12 pl-11 pr-11 text-base border-2 transition-all duration-200 bg-background",
                    focusedField === 'password' 
                      ? "border-violet-600 ring-4 ring-violet-100 dark:ring-violet-900/30" 
                      : "border-input hover:border-muted-foreground/50"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/30 transition-all duration-200 hover:shadow-l hover:shadow-violet-500/40"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Sign in
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-base text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-violet-600 hover:text-violet-700 transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          {/* Image Container */}
          <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-black/30 ring-1 ring-white/20">
            <img
              src="https://raw.githubusercontent.com/J33WAKASUPUN/Social-Media-Marketing-platform-V.2.0.0/main/social%20flow.png"
              alt="SocialFlow Platform"
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-violet-900/40 via-transparent to-transparent"></div>
          </div>

          {/* Text Content */}
          <div className="mt-10 text-center max-w-md">
            <h2 className="text-3xl font-bold text-white mb-4">
              Manage All Your Social Media in One Place
            </h2>
            <p className="text-lg text-violet-100/90">
              Schedule posts, track analytics, and grow your audience across LinkedIn, Facebook, Instagram, Twitter, and YouTube.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['Multi-Platform', 'Analytics', 'Scheduling', 'Team Collaboration'].map((feature) => (
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