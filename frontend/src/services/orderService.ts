import apiClient from './apiClient';

export interface CreateOrderData {
  deliveryType: 'Delivery' | 'Pickup';
  deliveryAddress?: any;
  promoCode?: string;
}

export const orderService = {
  async createOrder(data: CreateOrderData) {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  async getOrders() {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  async getOrder(id: string) {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  async updateOrderStatus(id: string, status: string) {
    const response = await apiClient.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  async cancelOrder(id: string) {
    const response = await apiClient.post(`/orders/${id}/cancel`);
    return response.data;
  },
};
