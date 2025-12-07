import api from '@/lib/api';
import { ApiResponse } from '@/types';

export interface TwoFactorStatus {
  enabled: boolean;
  method: 'totp' | 'email' | 'both';
  backupCodesRemaining: number;
  lastVerifiedAt?: string;
  verificationRequired: boolean;
}

export interface TOTPSetupResponse {
  secret: string;
  qrCode: string;
  manualEntry: string;
}

export interface EnableResponse {
  backupCodes: string[];
  warning: string;
}

export const twoFactorApi = {
  // Get 2FA status
  getStatus: async () => {
    const response = await api.get<ApiResponse<TwoFactorStatus>>('/auth/2fa/status');
    return response.data;
  },

  // Start TOTP setup
  setupTOTP: async () => {
    const response = await api.post<ApiResponse<TOTPSetupResponse>>('/auth/2fa/setup/totp');
    return response.data;
  },

  // Verify and enable TOTP
  verifySetup: async (code: string) => {
    const response = await api.post<ApiResponse<EnableResponse>>('/auth/2fa/verify-setup', { code });
    return response.data;
  },

  // Enable email-based 2FA
  enableEmail2FA: async () => {
    const response = await api.post<ApiResponse<EnableResponse>>('/auth/2fa/enable-email');
    return response.data;
  },

  // Send email OTP
  sendCode: async (userId?: string) => {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/2fa/send-code', { userId });
    return response.data;
  },

    // Verify email and enable 2FA (setup flow)
  verifyEmailSetup: async (code: string) => {
    const response = await api.post<ApiResponse<EnableResponse>>('/auth/2fa/verify-email-setup', { code });
    return response.data;
  },

  // Verify 2FA code
  verifyCode: async (code: string, userId?: string) => {
    const response = await api.post<ApiResponse<void>>('/auth/2fa/verify', { code, userId });
    return response.data;
  },

  // Disable 2FA
  disable: async (password: string) => {
    const response = await api.post<ApiResponse<void>>('/auth/2fa/disable', { password });
    return response.data;
  },

  // Regenerate backup codes
  regenerateBackupCodes: async (password: string) => {
    const response = await api.post<ApiResponse<{ backupCodes: string[] }>>('/auth/2fa/regenerate-backup', { password });
    return response.data;
  },

  // Complete login after 2FA
  complete2FALogin: async (userId: string) => {
    const response = await api.post<ApiResponse<{ user: any; tokens: any }>>('/auth/complete-2fa-login', { userId });
    return response.data;
  },
};