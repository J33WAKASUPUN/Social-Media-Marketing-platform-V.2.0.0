import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, Check, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Password validation
  const passwordValidation = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      toast.error("Please meet all password requirements");
      return;
    }
    
    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      setRegistrationComplete(true);
      toast.success("Registration successful! Please check your email to verify your account.");
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    window.location.href = `${apiUrl}/auth/google`;
  };

  // Show success message after registration
  if (registrationComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Success Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
              <p className="mt-2 text-muted-foreground">
                We've sent a verification link to <strong className="text-foreground">{email}</strong>
              </p>
            </div>

            {/* Spam Notice */}
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Can't find the email?
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Please check your <strong>Spam</strong> or <strong>Junk</strong> folder. 
                    If you find it there, mark it as "Not Spam" to receive future emails in your inbox.
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Click the link in the email to verify your account
              </p>
              <p className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Once verified, you can log in to your account
              </p>
            </div>

            <div className="pt-4 border-t">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16 xl:px-24 bg-background">
        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                SocialFlow
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
            <p className="mt-2 text-muted-foreground">
              Start managing your social media today
            </p>
          </div>

          {/* Google Sign Up */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 mb-6 gap-3 border-2 hover:bg-muted/50"
            onClick={handleGoogleSignup}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
              <div className="relative">
                <User className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
                  focusedField === 'name' ? "text-violet-600" : "text-muted-foreground"
                )} />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={loading}
                  className="pl-10 h-12 border-2 focus:border-violet-600"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
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
                  className="pl-10 h-12 border-2 focus:border-violet-600"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
                  focusedField === 'password' ? "text-violet-600" : "text-muted-foreground"
                )} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={loading}
                  className="pl-10 pr-10 h-12 border-2 focus:border-violet-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {[
                    { key: 'minLength', label: '8+ characters' },
                    { key: 'hasUpperCase', label: 'Uppercase letter' },
                    { key: 'hasLowerCase', label: 'Lowercase letter' },
                    { key: 'hasNumber', label: 'Number' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      {passwordValidation[key as keyof typeof passwordValidation] ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span className={passwordValidation[key as keyof typeof passwordValidation] ? "text-green-600" : "text-muted-foreground"}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</Label>
              <div className="relative">
                <Lock className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
                  focusedField === 'confirmPassword' ? "text-violet-600" : "text-muted-foreground"
                )} />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={loading}
                  className={cn(
                    "pl-10 pr-10 h-12 border-2 focus:border-violet-600",
                    confirmPassword && (passwordsMatch ? "border-green-500" : "border-red-500")
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Create account
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-violet-600 hover:text-violet-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Sparkles className="h-10 w-10" />
            </div>
            <span className="text-4xl font-bold">SocialFlow</span>
          </div>
          
          <h2 className="text-3xl font-bold text-center mb-4">
            Start your journey today
          </h2>
          <p className="text-xl text-center text-white/80 max-w-md">
            Join thousands of creators managing their social media presence with SocialFlow.
          </p>

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