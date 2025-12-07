// filepath: e:\React Projects\Social-Media-Marketing-platform-V.2.0.1\Social-Media-Marketing-platform-V.2.0.1\client\src\services\mediaApi.ts
import api from '@/lib/api';
import { ApiResponse, PaginatedResponse, Media } from '@/types';

export interface MediaFilters {
  brandId: string;
  type?: 'image' | 'video';
  folder?: string;
  tags?: string[];
  search?: string;
  sortBy?: 'createdAt' | 'size' | 'filename' | 'usageCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UploadMediaOptions {
  brandId: string;
  folder?: string;
  tags?: string[];
  altText?: string;
  caption?: string;
}

export interface MediaStats {
  totalFiles: number;
  totalSize: number;
  totalSizeFormatted: string;
  byType: Array<{
    type: string;
    count: number;
    size: number;
    sizeFormatted: string;
  }>;
}

export interface FolderMetadata {
  name: string;
  description?: string;
  color?: string;
  mediaCount: number;
  totalSize: number;
  totalSizeFormatted: string;
  lastUpdated: string;
  createdAt?: string;
}

export const mediaApi = {
  // Get media library with filters
  getAll: async (filters: MediaFilters): Promise<PaginatedResponse<Media>> => {
    const params = new URLSearchParams();
    
    params.append('brandId', filters.brandId);
    if (filters.type) params.append('type', filters.type);
    if (filters.folder) params.append('folder', filters.folder.trim());
    if (filters.tags?.length) params.append('tags', filters.tags.join(','));
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    // Axios response is { data: { success, data: Media[], pagination: {...} } }
    const response = await api.get<ApiResponse<Media[]>>(`/media?${params.toString()}`);
    
    console.log('🔍 Raw axios response:', response);
    console.log('🔍 Response.data:', response.data);
    
    // CORRECT EXTRACTION:
    // response.data = { success: true, data: [...], pagination: {...} }
    const responseBody = response.data;
    
    // The array is directly in .data
    const mediaItems = Array.isArray(responseBody.data) ? responseBody.data : [];
    
    // The pagination is directly in .pagination
    const pagination = responseBody.pagination || {
      page: 1,
      limit: 50,
      total: 0,
      pages: 1,
    };

    return {
      data: mediaItems,
      media: mediaItems, // Keep for backward compatibility
      pagination: pagination,
      success: responseBody.success,
      message: responseBody.message,
    };
  },

  // Get media formatted for post composer
  getForPostComposer: async (brandId: string, type?: 'image' | 'video') => {
    const params = new URLSearchParams({ brandId });
    if (type) params.append('type', type);
    
    const response = await api.get<PaginatedResponse<Media>>(`/media/for-post?${params.toString()}`);
    return response.data;
  },

  // Get single media
  getById: async (mediaId: string, brandId: string) => {
    const response = await api.get<ApiResponse<Media>>(`/media/${mediaId}?brandId=${brandId}`);
    return response.data;
  },

  // Upload media (single or multiple)
  upload: async (files: File[], options: UploadMediaOptions) => {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('media', file);
    });
    
    formData.append('brandId', options.brandId);
    if (options.folder) formData.append('folder', options.folder);
    
    // Ensure tags are sent as comma-separated string
    if (options.tags && options.tags.length > 0) {
      formData.append('tags', options.tags.join(','));
    }
    
    if (options.altText) formData.append('altText', options.altText);
    if (options.caption) formData.append('caption', options.caption);

    console.log('📤 Uploading with options:', {
      brandId: options.brandId,
      folder: options.folder,
      tags: options.tags,
      altText: options.altText,
      caption: options.caption,
    });

    const response = await api.post<ApiResponse<Media[]>>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update media metadata
  updateMetadata: async (
    mediaId: string,
    brandId: string,
    updates: {
      folder?: string;
      tags?: string[];
      altText?: string;
      caption?: string;
    }
  ) => {
    const response = await api.patch<ApiResponse<Media>>(`/media/${mediaId}`, {
      brandId,
      ...updates,
    });
    return response.data;
  },

  // Delete media
  delete: async (mediaId: string, brandId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/media/${mediaId}?brandId=${brandId}`);
    return response.data;
  },

  // Bulk delete
  bulkDelete: async (mediaIds: string[], brandId: string) => {
    const response = await api.post<ApiResponse<{ deleted: string[]; failed: any[] }>>('/media/bulk-delete', {
      mediaIds,
      brandId,
    });
    return response.data;
  },

  // Get folders
  getFolders: async (brandId: string) => {
    const response = await api.get<ApiResponse<string[]>>(`/media/folders?brandId=${brandId}`);
    return response.data;
  },

  // Get popular tags
  getTags: async (brandId: string, limit = 20) => {
    const response = await api.get<ApiResponse<Array<{ tag: string; count: number }>>>(
      `/media/tags?brandId=${brandId}&limit=${limit}`
    );
    return response.data;
  },

  // Get storage statistics
  getStats: async (brandId: string) => {
    const response = await api.get<ApiResponse<MediaStats>>(`/media/stats?brandId=${brandId}`);
    return response.data;
  },

  /**
   * Get folders with metadata
   */
  async getFoldersMetadata(brandId: string) {
    const response = await api.get('/media/folders-metadata', {
      params: { brandId },
    });
    return response.data;
  },

  /**
   * Create folder
   */
  async createFolder(brandId: string, data: {
    name: string;
    description?: string;
    color?: string;
  }) {
    const response = await api.post('/media/folders', {
      brandId,
      ...data,
    });
    return response.data;
  },

  /**
   * Rename folder
   */
  async renameFolder(oldName: string, brandId: string, newName: string) {
    const response = await api.patch(`/media/folders/${encodeURIComponent(oldName)}`, {
      brandId,
      newName,
    });
    return response.data;
  },

  /**
   * Delete folder
   */
  async deleteFolder(folderName: string, brandId: string) {
    const response = await api.delete(`/media/folders/${encodeURIComponent(folderName)}`, {
      params: { brandId },
    });
    return response.data;
  },

  /**
   * Move media to folder
   */
  async moveToFolder(mediaIds: string[], brandId: string, targetFolder: string) {
    const response = await api.post('/media/move-to-folder', {
      brandId,
      mediaIds,
      targetFolder,
    });
    return response.data;
  },
};