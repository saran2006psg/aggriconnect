import apiClient from './apiClient';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  async getNotifications(unread?: boolean, limit: number = 50) {
    const params = new URLSearchParams();
    if (unread !== undefined) {
      params.append('unread', unread.toString());
    }
    params.append('limit', limit.toString());
    
    const response = await apiClient.get(`/notifications?${params.toString()}`);
    return response.data;
  },

  async markAsRead(notificationId: string) {
    const response = await apiClient.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await apiClient.post('/notifications/read-all');
    return response.data;
  }
};
