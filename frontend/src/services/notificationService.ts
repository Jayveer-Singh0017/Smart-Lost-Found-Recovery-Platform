import api from './api';
import { ApiResponse, PagedResponse, NotificationDto } from '../types';

export const notificationService = {
  getMyNotifications: async (page = 0, size = 15): Promise<PagedResponse<NotificationDto>> => {
    const response = await api.get<ApiResponse<PagedResponse<NotificationDto>>>('/notifications', {
      params: { page, size },
    });
    return response.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<{ unreadCount: number }>>('/notifications/unread-count');
    return response.data.data.unreadCount;
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },
};
