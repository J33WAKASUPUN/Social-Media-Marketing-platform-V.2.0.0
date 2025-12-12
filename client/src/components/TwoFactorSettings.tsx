import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  Copy, 
  Check, 
  AlertTriangle,
  Loader2,
  RefreshCw,
  MailWarning
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  twoFactorApi, 
  TwoFactorStatus, 
  TOTPSetupResponse 
} from '@/services/twoFactorApi';

export const TwoFactorSettings: React.FC = () => {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false);
  const [setupMethod, setSetupMethod] = useState<'totp' | 'email'>('email');
  
  // Setup states
  const [totpSetup, setTotpSetup] = useState<TOTPSetupResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [processing, setProcessing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Track if we're currently setting up (to prevent double-clicks)
  const [settingUp, setSettingUp] = useState(false);
  
  // Track if email is being sent
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await twoFactorApi.getStatus();
      setStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch 2FA status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSetup = async (method: 'totp' | 'email') => {
    // Prevent double-clicks
    if (settingUp) return;
    
    setSettingUp(true);
    setSetupMethod(method);
    setVerificationCode(''); // Reset verification code
    setTotpSetup(null); // Reset TOTP setup
    
    // Show dialog IMMEDIATELY with loading state
    setShowSetupDialog(true);
    
    try {
      if (method === 'totp') {
        const response = await twoFactorApi.setupTOTP();
        setTotpSetup(response.data);
      } else {
        // Show sending state in dialog
        setSendingEmail(true);
        await twoFactorApi.sendCode();
        setSendingEmail(false);
        toast.success('Verification code sent to your email!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start setup');
      setShowSetupDialog(false); // Close dialog on error
      setSendingEmail(false);
    } finally {
      setSettingUp(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter the complete 6-digit verification code');
      return;
    }

    setProcessing(true);
    try {
      let response;
      if (setupMethod === 'totp') {
        response = await twoFactorApi.verifySetup(verificationCode);
      } else {
        // Use the new endpoint that verifies AND enables in one step
        response = await twoFactorApi.verifyEmailSetup(verificationCode);
      }
      
      setBackupCodes(response.data.backupCodes);
      setShowSetupDialog(false);
      setVerificationCode('');
      setTotpSetup(null);
      setShowBackupCodesDialog(true);
      
      toast.success('2FA enabled successfully!');
      fetchStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleDisable = async () => {
    if (!password) {
      toast.error('Password is required');
      return;
    }

    setProcessing(true);
    try {
      await twoFactorApi.disable(password);
      toast.success('2FA has been disabled');
      setShowDisableDialog(false);
      setPassword('');
      fetchStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setProcessing(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!password) {
      toast.error('Password is required');
      return;
    }

    setProcessing(true);
    try {
      const response = await twoFactorApi.regenerateBackupCodes(password);
      setBackupCodes(response.data.backupCodes);
      setPassword('');
      toast.success('Backup codes regenerated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to regenerate codes');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllCodes = () => {
    const allCodes = backupCodes.join('\n');
    navigator.clipboard.writeText(allCodes);
    toast.success('All backup codes copied!');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-violet-100 dark:bg-violet-900/30">
              <Shield className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!status?.enabled ? (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Two-factor authentication adds an extra layer of security.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Authenticator App Card */}
                <Card 
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700",
                    settingUp && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => !settingUp && handleStartSetup('totp')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        {settingUp && setupMethod === 'totp' ? (
                          <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
                        ) : (
                          <Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">Authenticator App</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Use Google Authenticator, Authy, or similar apps for secure codes
                        </p>
                        <Badge className="mt-2 bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200 hover:text-blue-800 hover:border-blue-400 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/50 transition-colors">Recommended</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Email Verification Card */}
                <Card 
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md hover:border-green-300 dark:hover:border-green-700",
                    settingUp && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => !settingUp && handleStartSetup('email')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                        {settingUp && setupMethod === 'email' ? (
                          <Loader2 className="h-6 w-6 text-green-600 dark:text-green-400 animate-spin" />
                        ) : (
                          <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">Email Verification</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Receive verification codes via email
                        </p>
                        <Badge variant="outline" className="mt-2">Simple</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-300">2FA is enabled</p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Method: {status.method === 'totp' ? 'Authenticator App' : 'Email'}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Backup Codes</p>
                    <p className="text-sm text-muted-foreground">
                      {status.backupCodesRemaining} codes remaining
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowBackupCodesDialog(true)}
                >
                  Regenerate
                </Button>
              </div>

              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => setShowDisableDialog(true)}
              >
                Disable 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={(open) => {
        // Don't allow closing while sending email
        if (!sendingEmail) {
          setShowSetupDialog(open);
          if (!open) {
            setVerificationCode('');
            setTotpSetup(null);
          }
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {setupMethod === 'totp' ? 'Set Up Authenticator App' : 'Enable Email 2FA'}
            </DialogTitle>
            <DialogDescription>
              {setupMethod === 'totp' 
                ? 'Scan the QR code with your authenticator app'
                : 'Enter the verification code sent to your email'
              }
            </DialogDescription>
          </DialogHeader>

          {/* TOTP Setup */}
          {setupMethod === 'totp' && (
            <>
              {!totpSetup ? (
                // Loading state for TOTP
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-violet-600 dark:text-violet-400 animate-spin" />
                  <p className="mt-4 text-sm text-muted-foreground">Generating QR code...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <img src={totpSetup.qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Manual Entry Key</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={totpSetup.manualEntry} 
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => {
                          navigator.clipboard.writeText(totpSetup.manualEntry);
                          toast.success('Copied!');
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Enter verification code from app</Label>
                    <Input
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center text-2xl tracking-widest"
                      maxLength={6}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Email Setup - Updated with better loading state and spam warning */}
          {setupMethod === 'email' && (
            <>
              {sendingEmail ? (
                // Better loading state while sending email
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative p-4 rounded-full bg-violet-100 dark:bg-violet-900/30">
                      <Mail className="h-8 w-8 text-violet-600 dark:text-violet-400 animate-pulse" />
                    </div>
                  </div>
                  <p className="mt-6 text-base font-medium">Sending verification code...</p>
                  <p className="mt-2 text-sm text-muted-foreground">Please check your email inbox</p>
                  <div className="flex gap-1 mt-4">
                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription>
                      We've sent a 6-digit verification code to your email. Please enter it below to enable 2FA.
                    </AlertDescription>
                  </Alert>

                  {/* Spam Folder Warning */}
                  <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                    <MailWarning className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
                      <strong>Can't find the email?</strong> Please check your <strong>Spam</strong> or <strong>Junk</strong> folder. If found, mark it as "Not Spam" to receive future emails.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label>Verification Code</Label>
                    <Input
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center text-2xl tracking-widest"
                      maxLength={6}
                      autoFocus
                    />
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    disabled={sendingEmail}
                    onClick={async () => {
                      try {
                        setSendingEmail(true);
                        await twoFactorApi.sendCode();
                        toast.success('Verification code resent!');
                      } catch (error: any) {
                        toast.error(error.response?.data?.message || 'Failed to resend code');
                      } finally {
                        setSendingEmail(false);
                      }
                    }}
                  >
                    <RefreshCw className={cn("mr-2 h-4 w-4", sendingEmail && "animate-spin")} />
                    {sendingEmail ? 'Sending...' : 'Resend Code'}
                  </Button>
                </div>
              )}
            </>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                if (!sendingEmail) {
                  setShowSetupDialog(false);
                  setVerificationCode('');
                  setTotpSetup(null);
                }
              }}
              disabled={sendingEmail}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleVerifyAndEnable} 
              disabled={
                processing || 
                verificationCode.length !== 6 || 
                sendingEmail ||
                (setupMethod === 'totp' && !totpSetup)
              }
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enabling...
                </>
              ) : (
                'Enable 2FA'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your password to confirm disabling 2FA. This will make your account less secure.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Disabling 2FA removes an important security layer from your account.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="disable-password">Password</Label>
              <Input
                id="disable-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDisableDialog(false);
                setPassword('');
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDisable} 
              disabled={processing || !password}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disabling...
                </>
              ) : (
                'Disable 2FA'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodesDialog} onOpenChange={setShowBackupCodesDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Backup Codes</DialogTitle>
            <DialogDescription>
              Save these codes in a secure place. Each code can only be used once.
            </DialogDescription>
          </DialogHeader>

          {backupCodes.length > 0 ? (
            <div className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> These codes will not be shown again. 
                  Save them securely!
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded font-mono text-sm"
                  >
                    <span>{code}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(code, index)}
                    >
                      {copiedIndex === index ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={copyAllCodes}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy All Codes
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter your password to regenerate backup codes. Your old codes will be invalidated.
              </p>

              <div className="space-y-2">
                <Label htmlFor="regen-password">Password</Label>
                <Input
                  id="regen-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button 
                className="w-full"
                onClick={handleRegenerateBackupCodes}
                disabled={processing || !password}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate New Codes'
                )}
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowBackupCodesDialog(false);
                setBackupCodes([]);
                setPassword('');
              }}
            >
              {backupCodes.length > 0 ? 'I\'ve Saved My Codes' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};