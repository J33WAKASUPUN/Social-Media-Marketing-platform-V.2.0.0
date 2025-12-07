import api from '@/lib/api';
import { ApiResponse, PaginatedResponse, Notification } from '@/types';

export const notificationApi = {
  // Get all notifications
  getAll: async (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) => {
    const response = await api.get<PaginatedResponse<Notification>>('/notifications', { params });
    return response.data;
  },

  // Mark as read
  markAsRead: async (notificationId: string) => {
    const response = await api.patch<ApiResponse<Notification>>(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.patch<ApiResponse<void>>('/notifications/read-all');
    return response.data;
  },

  // Delete notification
  delete: async (notificationId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/notifications/${notificationId}`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return response.data;
  },
};