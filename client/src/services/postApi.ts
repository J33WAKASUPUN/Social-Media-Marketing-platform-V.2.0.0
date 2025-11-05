import api from '@/lib/api';
import { ApiResponse, PaginatedResponse, Post, PostStatus } from '@/types';

export const postApi = {
  // Get all posts
  getAll: async (params?: {
    brandId?: string;
    status?: PostStatus;
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await api.get<PaginatedResponse<Post>>('/posts', { params });
    return response.data;
  },

  // Get single post
  getById: async (postId: string) => {
    const response = await api.get<ApiResponse<Post>>(`/posts/${postId}`);
    return response.data;
  },

  // Create draft post
  create: async (data: {
    brandId: string;
    content: Post['content'];
    selectedChannels: string[];
    media?: string[];
    platformSpecificContent?: Post['platformSpecificContent'];
  }) => {
    const response = await api.post<ApiResponse<Post>>('/posts', data);
    return response.data;
  },

  // Schedule post
  schedule: async (data: {
    brandId: string;
    content: Post['content'];
    selectedChannels: string[];
    scheduledFor: string;
    media?: string[];
    platformSpecificContent?: Post['platformSpecificContent'];
  }) => {
    const response = await api.post<ApiResponse<Post>>('/posts/schedule', data);
    return response.data;
  },

  // Update post
  update: async (postId: string, data: Partial<Post>) => {
    const response = await api.put<ApiResponse<Post>>(`/posts/${postId}`, data);
    return response.data;
  },

  // Delete post
  delete: async (postId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/posts/${postId}`);
    return response.data;
  },

  // Publish post immediately
  publishNow: async (postId: string) => {
    const response = await api.post<ApiResponse<Post>>(`/posts/${postId}/publish`);
    return response.data;
  },

  // Retry failed post
  retry: async (postId: string) => {
    const response = await api.post<ApiResponse<Post>>(`/posts/${postId}/retry`);
    return response.data;
  },
};