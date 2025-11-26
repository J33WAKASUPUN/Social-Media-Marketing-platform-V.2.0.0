import api from '@/lib/api';
import { ApiResponse } from '@/types';

export interface DashboardMetrics {
  summary: {
    totalPublished: number;
    totalFailed: number;
    totalScheduled: number;
    totalChannels: number;
    successRate: number;
    postsPerDay: number;
    period: string;
    dateRange: {
      start: string;
      end: string;
    };
  };
  platformStats: Array<{
    provider: string;
    totalPosts: number;
    totalChannels: number;
    percentage: string;
  }>;
  contentTypeStats: Array<{
    type: string;
    count: number;
    percentage: string;
  }>;
  postingTrends: Array<{
    date: string;
    count: number;
  }>;
  topPostingDays: Array<{
    day: string;
    count: number;
    percentage: string;
  }>;
  recentActivity: Array<{
    _id: string;
    content: string;
    platformUrl: string;
    publishedAt: string;
    provider: string;
    status: string;
    mediaType: string;
    channel?: {
      provider: string;
      displayName: string;
      avatar?: string;
    };
  }>;
}

export interface ChannelPerformance {
  channelId: string;
  provider: string;
  displayName: string;
  avatar?: string;
  connectionStatus: string;
  totalPosts: number;
  failedPosts: number;
  successRate: string;
  lastPostAt: string | null;
}

export interface PostingTrend {
  date: string;
  count: number;
  byPlatform: Record<string, number>;
}

export const analyticsApi = {
  /**
   * Get dashboard metrics
   */
  getDashboard: async (brandId: string, period: string = '30d') => {
    const response = await api.get<ApiResponse<DashboardMetrics>>('/analytics/dashboard', {
      params: { brandId, period },
    });
    return response.data;
  },

  /**
   * Get channel performance
   */
  getChannelPerformance: async (brandId: string) => {
    const response = await api.get<ApiResponse<ChannelPerformance[]>>('/analytics/channels', {
      params: { brandId },
    });
    return response.data;
  },

  /**
   * Get posting trends
   */
  getPostingTrends: async (brandId: string, period: string = '30d') => {
    const response = await api.get<ApiResponse<PostingTrend[]>>('/analytics/trends', {
      params: { brandId, period },
    });
    return response.data;
  },

  /**
   * Export analytics as CSV
   */
  exportCSV: async (brandId: string, period: string = '30d') => {
    const response = await api.get('/analytics/export/csv', {
      params: { brandId, period },
      responseType: 'blob',
    });
    return response.data;
  },
};