import apiClient from './apiClient';

export const userService = {
  async updateProfile(data: any) {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },

  async getAddresses() {
    const response = await apiClient.get('/users/addresses');
    return response.data;
  },

  async addAddress(address: any) {
    const response = await apiClient.post('/users/addresses', address);
    return response.data;
  },

  async updateAddress(id: string, address: any) {
    const response = await apiClient.put(`/users/addresses/${id}`, address);
    return response.data;
  },

  async deleteAddress(id: string) {
    const response = await apiClient.delete(`/users/addresses/${id}`);
    return response.data;
  },
};

export const reviewService = {
  async createReview(productId: string, data: any) {
    const response = await apiClient.post(`/reviews/products/${productId}`, data);
    return response.data;
  },

  async getProductReviews(productId: string) {
    const response = await apiClient.get(`/reviews/products/${productId}`);
    return response.data;
  },
};

export const notificationService = {
  async getNotifications(page: number = 1, perPage: number = 20) {
    const response = await apiClient.get(`/notifications?page=${page}&perPage=${perPage}`);
    return response.data;
  },

  async markAsRead(id: string) {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  async deleteNotification(id: string) {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },
};

export const uploadService = {
  async uploadProductImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/upload/product-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/upload/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const adminService = {
  async getStats() {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  async getOrderAnalytics() {
    const response = await apiClient.get('/admin/analytics/orders');
    return response.data;
  },

  async getFarmers(page: number = 1, perPage: number = 20) {
    const response = await apiClient.get(`/admin/farmers?page=${page}&perPage=${perPage}`);
    return response.data;
  },

  async getConsumers(page: number = 1, perPage: number = 20) {
    const response = await apiClient.get(`/admin/consumers?page=${page}&perPage=${perPage}`);
    return response.data;
  },

  async getAllOrders(page: number = 1, perPage: number = 20) {
    const response = await apiClient.get(`/admin/orders?page=${page}&perPage=${perPage}`);
    return response.data;
  },
};
