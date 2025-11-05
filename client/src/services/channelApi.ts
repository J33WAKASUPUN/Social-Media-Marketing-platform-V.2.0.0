import api from '@/lib/api';
import { ApiResponse, Channel, PlatformType } from '@/types';

export const channelApi = {
  // Get all channels for a brand
  getAll: async (brandId: string) => {
    const response = await api.get<ApiResponse<Channel[]>>(`/brands/${brandId}/channels`);
    return response.data;
  },

  // Get single channel
  getById: async (channelId: string) => {
    const response = await api.get<ApiResponse<Channel>>(`/channels/${channelId}`);
    return response.data;
  },

  // Get OAuth URL for platform
  getOAuthUrl: async (platform: PlatformType, brandId: string) => {
    const response = await api.get<ApiResponse<{ url: string }>>(
      `/auth/${platform}?brandId=${brandId}`
    );
    return response.data;
  },

  // Disconnect channel
  disconnect: async (channelId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/channels/${channelId}`);
    return response.data;
  },

  // Refresh channel token
  refreshToken: async (channelId: string) => {
    const response = await api.post<ApiResponse<Channel>>(`/channels/${channelId}/refresh`);
    return response.data;
  },

  // Update channel status
  updateStatus: async (channelId: string, isActive: boolean) => {
    const response = await api.patch<ApiResponse<Channel>>(`/channels/${channelId}`, { isActive });
    return response.data;
  },
};