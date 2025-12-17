import apiClient from './apiClient';

export const subscriptionService = {
  async getSubscriptions() {
    const response = await apiClient.get('/subscriptions');
    return response.data;
  },

  async getSubscription(id: string) {
    const response = await apiClient.get(`/subscriptions/${id}`);
    return response.data;
  },

  async createSubscription(data: any) {
    const response = await apiClient.post('/subscriptions', data);
    return response.data;
  },

  async pauseSubscription(id: string) {
    const response = await apiClient.patch(`/subscriptions/${id}/pause`);
    return response.data;
  },

  async resumeSubscription(id: string) {
    const response = await apiClient.patch(`/subscriptions/${id}/resume`);
    return response.data;
  },

  async cancelSubscription(id: string) {
    const response = await apiClient.delete(`/subscriptions/${id}`);
    return response.data;
  },
};

export const bulkOrderService = {
  async createBulkOrder(data: any) {
    const response = await apiClient.post('/bulk-orders', data);
    return response.data;
  },

  async getBulkOrders() {
    const response = await apiClient.get('/bulk-orders');
    return response.data;
  },

  async getBulkOrder(id: string) {
    const response = await apiClient.get(`/bulk-orders/${id}`);
    return response.data;
  },

  async respondToBulkOrder(id: string, response: any) {
    const apiResponse = await apiClient.post(`/bulk-orders/${id}/respond`, response);
    return apiResponse.data;
  },
};
