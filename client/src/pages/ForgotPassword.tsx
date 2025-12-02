import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, ArrowLeft, Sparkles, Send, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to send reset email";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16 xl:px-24 bg-background">
        <div className="mx-auto w-full max-w-md">
          {/* Back Link */}
          <Link
            to="/login"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>

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
              Reset your password
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>

          {!submitted ? (
            /* Form */
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

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-violet-500/40"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Send reset link
                  </div>
                )}
              </Button>
            </form>
          ) : (
            /* Success State */
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">Check your email</p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      We've sent a password reset link to <strong>{email}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Didn't receive the email?{" "}
                <button
                  onClick={() => setSubmitted(false)}
                  className="font-medium text-violet-600 hover:text-violet-700 transition-colors"
                >
                  Click to resend
                </button>
              </p>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Need help?</strong> Contact our support team at{" "}
              <a href="mailto:support@socialflow.com" className="text-violet-600 hover:underline">
                support@socialflow.com
              </a>
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
              We've Got You Covered
            </h2>
            <p className="text-lg text-violet-100/90">
              Password recovery is quick and secure. You'll be back to managing your social media in no time.
            </p>
          </div>

          {/* Security Features */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {['Secure Reset', 'Email Verification', '24/7 Support', 'Instant Recovery'].map((feature) => (
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