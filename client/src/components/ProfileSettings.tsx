import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Upload, Trash2, CheckCircle2, XCircle, Lock, AlertCircle, Eye, EyeOff, Check, X, AlertTriangle } from 'lucide-react';import { toast } from 'sonner';
import api from '@/lib/api';
import { cn } from '@/lib/utils'; // Make sure you have this utility

export const ProfileSettings: React.FC = () => {
  const { user, updateProfile, logout, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // UI States for focus and visibility
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showBackupPassword, setShowBackupPassword] = useState(false);
  const [showBackupConfirm, setShowBackupConfirm] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  });

  // Password form state (Change Password)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Backup password state (Google OAuth users)
  const [backupPasswordData, setBackupPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  // --- Helpers for Password Validation ---
  const getPasswordValidation = (password: string) => ({
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  });

  const isValidationMet = (password: string) => {
    const v = getPasswordValidation(password);
    return Object.values(v).every(Boolean);
  };

  // Validation for Backup Password form
  const backupValidation = getPasswordValidation(backupPasswordData.password);
  const isBackupValid = Object.values(backupValidation).every(Boolean);
  const isBackupMatch = backupPasswordData.password === backupPasswordData.confirmPassword && backupPasswordData.confirmPassword !== "";

  // Validation for Change Password form
  const newPasswordValidation = getPasswordValidation(passwordData.newPassword);
  const isNewPasswordValid = Object.values(newPasswordValidation).every(Boolean);

  // --- Handlers ---

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name: profileData.name });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.patch('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedUser = response.data.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Avatar updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (!isNewPasswordValid) {
      toast.error('Password must meet all requirements');
      return;
    }

    setLoading(true);

    try {
      await api.patch('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleSetBackupPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isBackupMatch) {
      toast.error('Passwords do not match');
      return;
    }

    if (!isBackupValid) {
      toast.error('Password must meet all requirements');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/set-password', {
        password: backupPasswordData.password,
        confirmPassword: backupPasswordData.confirmPassword,
      });

      const updatedUser = response.data.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success('✅ Backup password set! You can now login with email/password.');
      setBackupPasswordData({ password: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

const handleDeleteAccount = async () => {
  if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
    toast.error('Please type the confirmation text exactly as shown');
    return;
  }

  try {
    await api.delete('/auth/account');
    toast.success('Account deleted successfully');
    await logout();
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to delete account');
  }
};

  if (!user) return null;

  const hasPassword = (user as any).hasPassword || user.provider === 'local';

  // Component for rendering Password Requirements
  const PasswordRequirements = ({ validation, password }: { validation: any, password: string }) => (
    password ? (
      <div className="grid grid-cols-2 gap-2 pt-2">
        {[
          { key: 'minLength', label: '8+ characters' },
          { key: 'hasUpperCase', label: 'Uppercase letter' },
          { key: 'hasLowerCase', label: 'Lowercase letter' },
          { key: 'hasNumber', label: 'Number' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            {validation[key] ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className={cn(
              "transition-colors",
              validation[key] ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
            )}>
              {label}
            </span>
          </div>
        ))}
      </div>
    ) : null
  );

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatarUrl || user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('avatar-upload')?.click()}
                disabled={uploadingAvatar}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadingAvatar ? 'Uploading...' : 'Change Avatar'}
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                JPG, PNG or WEBP. Max 2MB.
              </p>
            </div>
          </div>

          <Separator />

          {/* Profile Form */}
         <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              
              {/* Full Name Field + Save Button */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="flex gap-3">
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    required
                    minLength={2}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </div>

              {/* Email Field (Read Only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="email"
                    value={profileData.email}
                    disabled
                    className="flex-1 bg-muted"
                  />
                  {user.emailVerified ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 shrink-0 h-10 px-3">
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800 shrink-0 h-10 px-3">
                      <XCircle className="mr-1.5 h-4 w-4" />
                      Unverified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <Label className="text-muted-foreground">Account Type:</Label>
                <Badge variant="secondary" className="px-3 py-1">
                  {user.provider === 'google' ? 'Google Account' : 'Email Account'}
                </Badge>
              </div>
              
              <span className="text-sm text-muted-foreground">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ✅ SET BACKUP PASSWORD (Google Users) */}
      {user.provider === 'google' && !hasPassword && (
        <Card className="border-blue-500/20 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Set Backup Password</CardTitle>
                <CardDescription>
                  Add a password to enable email/password login as a backup
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                Your Google login will continue to work. This simply adds an alternative way to access your account.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSetBackupPassword} className="space-y-5">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="backup-password">New Password</Label>
                <div className="relative">
                  <Lock className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
                    focusedField === 'backup-password' ? "text-violet-600" : "text-muted-foreground"
                  )} />
                  <Input
                    id="backup-password"
                    type={showBackupPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={backupPasswordData.password}
                    onChange={(e) => setBackupPasswordData({ ...backupPasswordData, password: e.target.value })}
                    onFocus={() => setFocusedField('backup-password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={cn(
                        "pl-10 pr-10",
                        focusedField === 'backup-password' && "border-violet-600 ring-1 ring-violet-600"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowBackupPassword(!showBackupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showBackupPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Requirements Checklist */}
                <PasswordRequirements validation={backupValidation} password={backupPasswordData.password} />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-backup-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
                    focusedField === 'confirm-backup' ? "text-violet-600" : "text-muted-foreground"
                  )} />
                  <Input
                    id="confirm-backup-password"
                    type={showBackupConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={backupPasswordData.confirmPassword}
                    onChange={(e) => setBackupPasswordData({ ...backupPasswordData, confirmPassword: e.target.value })}
                    onFocus={() => setFocusedField('confirm-backup')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={cn(
                        "pl-10 pr-10",
                        focusedField === 'confirm-backup' && "border-violet-600 ring-1 ring-violet-600"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowBackupConfirm(!showBackupConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showBackupConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Match Validation */}
                {backupPasswordData.confirmPassword && (
                  <div className="flex items-center gap-2 text-xs pt-1">
                    {isBackupMatch ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-green-600 dark:text-green-400">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-red-600 dark:text-red-400">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button 
                    type="submit" 
                    disabled={loading || !isBackupValid || !isBackupMatch}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {loading ? 'Setting Password...' : 'Set Backup Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* CHANGE PASSWORD (Standard Users or Google Users with Password) */}
      {hasPassword && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              {user.provider === 'google' 
                ? 'Update your backup password'
                : 'Update your password to keep your account secure'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-5">
              
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                    <Lock className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
                        focusedField === 'current-password' ? "text-violet-600" : "text-muted-foreground"
                    )} />
                    <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        onFocus={() => setFocusedField('current-password')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className="pl-10 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                    <Lock className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
                        focusedField === 'new-password' ? "text-violet-600" : "text-muted-foreground"
                    )} />
                    <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        onFocus={() => setFocusedField('new-password')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className={cn(
                            "pl-10 pr-10",
                            focusedField === 'new-password' && "border-violet-600 ring-1 ring-violet-600"
                        )}
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                {/* Requirements Checklist for Change Password too */}
                <PasswordRequirements validation={newPasswordValidation} password={passwordData.newPassword} />
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                    <Lock className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
                        focusedField === 'confirm-new' ? "text-violet-600" : "text-muted-foreground"
                    )} />
                    <Input
                        id="confirm-password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        onFocus={() => setFocusedField('confirm-new')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className={cn(
                            "pl-10 pr-10",
                            focusedField === 'confirm-new' && "border-violet-600 ring-1 ring-violet-600"
                        )}
                    />
                </div>
                {passwordData.confirmPassword && (
                  <div className="flex items-center gap-2 text-xs pt-1">
                    {passwordData.newPassword === passwordData.confirmPassword ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-green-600 dark:text-green-400">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-red-600 dark:text-red-400">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading || !isNewPasswordValid}>
                    {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Once you delete your account, there is no going back. All your organizations,
              brands, posts, and data will be permanently deleted.
            </p>
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">
      <Trash2 className="mr-2 h-4 w-4" />
      Delete Account
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent className="max-w-md">
    <AlertDialogHeader>
      <AlertDialogTitle className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        Permanently Delete Account?
      </AlertDialogTitle>
      <AlertDialogDescription asChild>
        <div className="space-y-4">
          <p>
            This action <strong className="text-destructive">cannot be undone</strong>. This will permanently delete your account
            and remove all your data from our servers including:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>All organizations you own</li>
            <li>All brands and their posts</li>
            <li>All connected social media channels</li>
            <li>All media files and analytics data</li>
          </ul>

          {/* Confirmation Input */}
          <Alert variant="destructive" className="mt-4">
            
            <AlertDescription>
              <p className="font-semibold mb-3">To confirm deletion, please type: DELETE MY ACCOUNT</p>
              <Input
                placeholder="Type here to confirm..."
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="mt-2"
                autoComplete="off"
              />
            </AlertDescription>
          </Alert>
        </div>
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>
        Cancel
      </AlertDialogCancel>
      <AlertDialogAction
        onClick={handleDeleteAccount}
        disabled={deleteConfirmation !== 'DELETE MY ACCOUNT'}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Permanently Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};