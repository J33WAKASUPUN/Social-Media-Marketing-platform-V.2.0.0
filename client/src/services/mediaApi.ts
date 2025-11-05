import api from '@/lib/api';
import { ApiResponse, PaginatedResponse, Media } from '@/types';

export const mediaApi = {
  // Get all media
  getAll: async (params?: {
    organizationId?: string;
    brandId?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get<PaginatedResponse<Media>>('/media', { params });
    return response.data;
  },

  // Get single media
  getById: async (mediaId: string) => {
    const response = await api.get<ApiResponse<Media>>(`/media/${mediaId}`);
    return response.data;
  },

  // Upload media
  upload: async (file: File, brandId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (brandId) {
      formData.append('brandId', brandId);
    }

    const response = await api.post<ApiResponse<Media>>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload multiple media
  uploadMultiple: async (files: File[], brandId?: string) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    if (brandId) {
      formData.append('brandId', brandId);
    }

    const response = await api.post<ApiResponse<Media[]>>('/media/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete media
  delete: async (mediaId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/media/${mediaId}`);
    return response.data;
  },
};