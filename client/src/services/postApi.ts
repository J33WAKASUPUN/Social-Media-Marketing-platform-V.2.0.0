import api from '@/lib/api';
import { ApiResponse } from '@/types';

export interface CreatePostData {
  brandId: string;
  title?: string;
  content: string;
  mediaUrls?: string[];
  mediaLibraryIds?: string[]; // Use media from library
  schedules: Array<{
    channel: string;
    provider: string;
    scheduledFor: string; // ISO 8601 UTC format
  }>;
  settings?: {
    requireApproval?: boolean;
    notifyOnPublish?: boolean;
  };
}

export interface Post {
  _id: string;
  brand: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  title?: string;
  content: string;
  hashtags?: string[];
  mediaUrls: string[];
  mediaType: 'none' | 'image' | 'video' | 'carousel' | 'multiImage';
  schedules: Array<{
    _id: string;
    channel: {
      _id: string;
      provider: string;
      displayName: string;
    };
    scheduledFor: string;
    status: 'pending' | 'queued' | 'published' | 'failed' | 'cancelled';
    publishedAt?: string;
    platformPostId?: string;
    error?: string;
  }>;
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
  settings: {
    requireApproval: boolean;
    notifyOnPublish: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export const postApi = {
  /**
   * Create new post
   */
  create: async (data: CreatePostData) => {
    const response = await api.post<ApiResponse<Post>>('/posts', data);
    return response.data;
  },

  /**
   * Get all posts for a brand
   */
  getAll: async (brandId: string, filters?: {
    status?: 'draft' | 'scheduled' | 'published' | 'failed';
    limit?: number;
  }) => {
    const params = new URLSearchParams({ brandId });
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get<ApiResponse<Post[]>>(`/posts?${params.toString()}`);
    return response.data;
  },

  /**
   * Get single post
   */
  getById: async (postId: string) => {
    const response = await api.get<ApiResponse<Post>>(`/posts/${postId}`);
    return response.data;
  },

  /**
   * Update post (draft only)
   */
  update: async (postId: string, data: Partial<CreatePostData>) => {
    const response = await api.patch<ApiResponse<Post>>(`/posts/${postId}`, data);
    return response.data;
  },

  /**
   * Delete post
   */
  delete: async (postId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/posts/${postId}`);
    return response.data;
  },

  /**
   * Cancel schedule
   */
  cancelSchedule: async (postId: string, scheduleId: string) => {
    const response = await api.delete<ApiResponse<Post>>(
      `/posts/${postId}/schedules/${scheduleId}`
    );
    return response.data;
  },

  /**
   * Get calendar events
   */
  getCalendar: async (brandId: string, startDate: string, endDate: string) => {
    const params = new URLSearchParams({
      brandId,
      startDate,
      endDate,
    });

    const response = await api.get<ApiResponse<any>>(`/posts/calendar?${params.toString()}`);
    return response.data;
  },
};