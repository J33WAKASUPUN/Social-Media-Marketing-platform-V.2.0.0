import api from '@/lib/api';
import { ApiResponse, Analytics } from '@/types';

export const analyticsApi = {
  // Get analytics for a brand
  get: async (params: {
    brandId: string;
    startDate?: string;
    endDate?: string;
    platform?: string;
  }) => {
    const response = await api.get<ApiResponse<Analytics>>('/analytics', { params });
    return response.data;
  },

  // Get post analytics
  getPostAnalytics: async (postId: string) => {
    const response = await api.get<ApiResponse<any>>(`/analytics/posts/${postId}`);
    return response.data;
  },

  // Get channel analytics
  getChannelAnalytics: async (channelId: string, params?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get<ApiResponse<any>>(`/analytics/channels/${channelId}`, { params });
    return response.data;
  },
};