import api from '@/lib/api';
import { ApiResponse, Channel, PlatformType } from '@/types';

export const channelApi = {
  // Get all channels for a brand
  getAll: async (brandId: string) => {
    const response = await api.get<ApiResponse<Channel[]>>('/channels', {
      params: { brandId }, // Pass as query parameter
    });
    return response.data;
  },

  // Get single channel
  getById: async (channelId: string) => {
    const response = await api.get<ApiResponse<Channel>>(`/channels/${channelId}`);
    return response.data;
  },

  // Get OAuth URL for platform
  getOAuthUrl: async (platform: PlatformType, brandId: string) => {
    const response = await api.get<ApiResponse<{ authUrl: string; state: string }>>(
      `/channels/oauth/${platform}`,
      {
        params: {
          brandId,
          returnUrl: window.location.origin, // Frontend URL for callback
        },
      }
    );
    return response.data;
  },

  // Test connection
  testConnection: async (channelId: string) => {
    const response = await api.get<ApiResponse<{ isValid: boolean }>>(
      `/channels/${channelId}/test`
    );
    return response.data;
  },

  // Disconnect channel (soft delete)
  disconnect: async (channelId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/channels/${channelId}`);
    return response.data;
  },

  // Permanently delete channel
  permanentlyDelete: async (channelId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/channels/${channelId}/permanent`);
    return response.data;
  },

  // Refresh token
  refreshToken: async (channelId: string) => {
    const response = await api.post<ApiResponse<Channel>>(`/channels/${channelId}/refresh`);
    return response.data;
  },

  // Get disconnected channels
  getDisconnected: async (brandId: string) => {
    const response = await api.get<ApiResponse<Channel[]>>('/channels/disconnected', {
      params: { brandId },
    });
    return response.data;
  },
};