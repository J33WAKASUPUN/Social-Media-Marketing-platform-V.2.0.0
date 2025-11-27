import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, ArrowLeft, Sparkles, Check, X, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      navigate("/forgot-password");
    }
  }, [token, navigate]);

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

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Please meet all password requirements");
      return;
    }

    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    setLoading(true);

    try {
      // ✅ FIX: Send token and password in the request body
      await api.post('/auth/reset-password', { 
        token,
        password 
      });
      
      setSuccess(true);
      toast.success("Password reset successful!");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to reset password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={cn(
      "flex items-center gap-2 text-sm transition-colors",
      met ? "text-green-600" : "text-gray-400"
    )}>
      {met ? (
        <Check className="h-4 w-4" />
      ) : (
        <X className="h-4 w-4" />
      )}
      {text}
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Back Link */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          {/* Logo & Header */}
          <div className="mb-10">
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

            {!success ? (
              <>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Create new password
                </h1>
                <p className="mt-2 text-base text-gray-600">
                  Your new password must be different from previously used passwords.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                  <ShieldCheck className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Password reset successful!
                </h1>
                <p className="mt-2 text-base text-gray-600">
                  Your password has been successfully reset. You can now log in with your new password.
                </p>
              </>
            )}
          </div>

          {!success ? (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  New password
                </Label>
                <div className="relative">
                  <Lock className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
                    focusedField === 'password' ? "text-violet-600" : "text-gray-400"
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
                    autoComplete="new-password"
                    className={cn(
                      "h-12 pl-11 pr-11 text-base border-2 transition-all duration-200",
                      focusedField === 'password' 
                        ? "border-violet-600 ring-4 ring-violet-100" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password Requirements */}
                {password && (
                  <div className="mt-3 p-3 rounded-lg bg-gray-50 space-y-2">
                    <PasswordRequirement met={passwordValidation.minLength} text="At least 8 characters" />
                    <PasswordRequirement met={passwordValidation.hasUpperCase} text="One uppercase letter" />
                    <PasswordRequirement met={passwordValidation.hasLowerCase} text="One lowercase letter" />
                    <PasswordRequirement met={passwordValidation.hasNumber} text="One number" />
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm new password
                </Label>
                <div className="relative">
                  <Lock className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
                    focusedField === 'confirmPassword' ? "text-violet-600" : "text-gray-400"
                  )} />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    className={cn(
                      "h-12 pl-11 pr-11 text-base border-2 transition-all duration-200",
                      focusedField === 'confirmPassword' 
                        ? "border-violet-600 ring-4 ring-violet-100" 
                        : "border-gray-200 hover:border-gray-300",
                      confirmPassword && (passwordsMatch ? "border-green-500" : "border-red-500")
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    Passwords don't match
                  </p>
                )}
                {confirmPassword && passwordsMatch && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    Passwords match
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !isPasswordValid || !passwordsMatch}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-violet-500/40 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Resetting password...
                  </div>
                ) : (
                  "Reset password"
                )}
              </Button>
            </form>
          ) : (
            /* Success State */
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm text-green-800">
                  You will be redirected to the login page in a few seconds...
                </p>
              </div>

              <Link to="/login">
                <Button
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/30"
                >
                  Go to login
                </Button>
              </Link>
            </div>
          )}

          {/* Security Note */}
          <div className="mt-8 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Security tip:</strong> Use a strong password that you don't use on other websites. 
              Consider using a password manager.
            </p>
          </div>
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
              Secure Your Account
            </h2>
            <p className="text-lg text-violet-100/90">
              Create a strong, unique password to protect your social media marketing platform.
            </p>
          </div>

          {/* Security Features */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['256-bit Encryption', 'Secure Reset', 'Password Protection', 'Account Safety'].map((feature) => (
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