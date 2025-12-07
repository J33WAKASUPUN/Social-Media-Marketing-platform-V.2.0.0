import api from '@/lib/api';
import { ApiResponse, Brand } from '@/types';

export const brandApi = {
  // Get all brands for an organization
  getAll: async (organizationId: string) => {
    const response = await api.get<ApiResponse<Brand[]>>(`/organizations/${organizationId}/brands`);
    return response.data;
  },

  // Get single brand
  getById: async (brandId: string) => {
    const response = await api.get<ApiResponse<Brand>>(`/brands/${brandId}`);
    return response.data;
  },

  // Create brand (use organization route)
  create: async (organizationId: string, data: { name: string; description?: string; logo?: string; website?: string }) => {
    const response = await api.post<ApiResponse<Brand>>(`/organizations/${organizationId}/brands`, data);
    return response.data;
  },

  // Update brand (use PATCH)
  update: async (brandId: string, data: Partial<Brand>) => {
    const response = await api.patch<ApiResponse<Brand>>(`/brands/${brandId}`, data);
    return response.data;
  },

  // Delete brand
  delete: async (brandId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/brands/${brandId}`);
    return response.data;
  },
};