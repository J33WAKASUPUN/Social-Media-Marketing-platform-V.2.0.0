import api from '@/lib/api';
import { ApiResponse } from '@/types';

export type ContentType = 'text-only' | 'text-image' | 'text-video';
export type PublishType = 'now' | 'scheduled';
export type BulkPostStatus = 'pending' | 'publishing' | 'completed' | 'partial' | 'failed' | 'cancelled';

export interface ContentTypeInfo {
  id: ContentType;
  name: string;
  description: string;
  platforms: string[];
  supportsMedia: boolean;
  supportsImages: boolean;
  supportsVideos: boolean;
}

export interface ChannelAssignment {
  platform: string;
  channel: string;
}

export interface AvailableChannelsResponse {
  targetPlatforms: string[];
  channels: Record<string, Array<{
    _id: string;
    provider: string;
    displayName: string;
    avatar?: string;
    platformUsername?: string;
  }>>;
  allConnected: boolean;
  missingPlatforms: string[];
}

export interface PlatformContent {
  enabled: boolean;
  content: string;
  hashtags: string[];
  title?: string;
  optimizedAt?: string;
}

export interface PublishResult {
  platform: string;
  channel: {
    _id: string;
    provider: string;
    displayName: string;
    avatar?: string;
  };
  post?: string;
  status: 'pending' | 'queued' | 'publishing' | 'published' | 'failed' | 'cancelled';
  platformPostId?: string;
  platformUrl?: string;
  publishedAt?: string;
  error?: string;
  retryCount?: number;
  jobId?: string;
}

export interface BulkPost {
  _id: string;
  brand: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  contentType: ContentType;
  originalContent: {
    text: string;
    hashtags: string[];
    mediaUrls: string[];
    mediaType: 'none' | 'image' | 'video';
  };
  platformContent: Record<string, PlatformContent>;
  mediaLibraryItems: Array<{
    _id: string;
    s3Url: string;
    originalName: string;
    type: string;
  }>;
  targetPlatforms: string[];
  channelAssignments: Array<{
    platform: string;
    channel: {
      _id: string;
      provider: string;
      displayName: string;
      avatar?: string;
    };
  }>;
  individualPosts: Array<{
    platform: string;
    post: {
      _id: string;
      content: string;
      status: string;
      schedules: any[];
    };
  }>;
  publishType: PublishType;
  scheduledFor: string;
  status: BulkPostStatus;
  publishResults: PublishResult[];
  stats: {
    totalPlatforms: number;
    successCount: number;
    failedCount: number;
    pendingCount: number;
  };
  settings: {
    notifyOnComplete: boolean;
    retryOnFail: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBulkPostData {
  brandId: string;
  contentType: ContentType;
  content: string;
  hashtags?: string[];
  mediaLibraryIds?: string[];
  channelAssignments: ChannelAssignment[];
  publishType: PublishType;
  scheduledFor?: string;
  settings?: {
    notifyOnComplete?: boolean;
    retryOnFail?: boolean;
  };
}

export interface OptimizeContentResponse {
  targetPlatforms: string[];
  platformContent: Record<string, PlatformContent>;
}

export const bulkPublishApi = {
  /**
   * Get available content types
   */
  getContentTypes: async (): Promise<ApiResponse<ContentTypeInfo[]>> => {
    const response = await api.get('/bulk-publish/content-types');
    return response.data;
  },

  /**
   * Get available channels for a content type
   */
  getAvailableChannels: async (
    brandId: string,
    contentType: ContentType
  ): Promise<ApiResponse<AvailableChannelsResponse>> => {
    const response = await api.get('/bulk-publish/channels', {
      params: { brandId, contentType },
    });
    return response.data;
  },

  /**
   * Optimize content for all platforms
   */
  optimizeContent: async (
    content: string,
    contentType: ContentType,
    hashtags?: string[]
  ): Promise<ApiResponse<OptimizeContentResponse>> => {
    const response = await api.post('/bulk-publish/optimize', {
      content,
      contentType,
      hashtags,
    });
    return response.data;
  },

  /**
   * Create bulk post
   */
  create: async (data: CreateBulkPostData): Promise<ApiResponse<BulkPost>> => {
    const response = await api.post('/bulk-publish', data);
    return response.data;
  },

  /**
   * Get bulk posts for brand
   */
  getAll: async (
    brandId: string,
    filters?: {
      status?: BulkPostStatus;
      contentType?: ContentType;
      limit?: number;
      page?: number;
    }
  ): Promise<{ success: boolean; data: BulkPost[]; pagination: any }> => {
    const response = await api.get('/bulk-publish', {
      params: { brandId, ...filters },
    });
    return response.data;
  },

  /**
   * Get bulk post by ID
   */
  getById: async (id: string): Promise<ApiResponse<BulkPost>> => {
    const response = await api.get(`/bulk-publish/${id}`);
    return response.data;
  },

  /**
   * Cancel bulk post
   */
  cancel: async (id: string): Promise<ApiResponse<BulkPost>> => {
    const response = await api.post(`/bulk-publish/${id}/cancel`);
    return response.data;
  },

  /**
   * Update platform content
   */
  updatePlatformContent: async (
    id: string,
    platform: string,
    content: { text?: string; title?: string; hashtags?: string[] }
  ): Promise<ApiResponse<BulkPost>> => {
    const response = await api.patch(`/bulk-publish/${id}/platform/${platform}`, content);
    return response.data;
  },
};