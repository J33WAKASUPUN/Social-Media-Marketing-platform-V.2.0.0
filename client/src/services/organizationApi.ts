import api from '@/lib/api';
import { ApiResponse, PaginatedResponse, Organization, Membership, MemberRole } from '@/types';

export const organizationApi = {
  // Get all organizations for current user
  getAll: async () => {
    const response = await api.get<ApiResponse<Organization[]>>('/organizations');
    return response.data;
  },

  // Get single organization
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Organization>>(`/organizations/${id}`);
    return response.data;
  },

  // Create organization
  create: async (data: { name: string; description?: string; logo?: string }) => {
    const response = await api.post<ApiResponse<Organization>>('/organizations', data);
    return response.data;
  },

  // Update organization (use PATCH)
  update: async (id: string, data: Partial<Organization>) => {
    const response = await api.patch<ApiResponse<Organization>>(`/organizations/${id}`, data);
    return response.data;
  },

  // Delete organization
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/organizations/${id}`);
    return response.data;
  },

  // Get organization members
  getMembers: async (id: string) => {
    const response = await api.get<ApiResponse<Membership[]>>(`/organizations/${id}/members`);
    return response.data;
  },

  inviteMember: async (id: string, data: { email: string; role: MemberRole }) => {
    const response = await api.post<ApiResponse<Membership>>(`/organizations/${id}/members`, data);
    return response.data;
  },

  updateMemberRole: async (id: string, userId: string, role: MemberRole) => {
    const response = await api.put<ApiResponse<Membership>>(
      `/organizations/${id}/members/${userId}`,
      { role }
    );
    return response.data;
  },

  // Remove member
  removeMember: async (id: string, userId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/organizations/${id}/members/${userId}`);
    return response.data;
  },
};