import apiClient from './apiClient';

export interface CreateOrderData {
  deliveryType: 'Delivery' | 'Pickup';
  deliveryAddress?: any;
  promoCode?: string;
}

export const orderService = {
  async createOrder(data: CreateOrderData) {
    // Transform camelCase to snake_case for backend
    const requestData = {
      delivery_type: data.deliveryType,
      delivery_address_id: data.deliveryAddress,
      promo_code: data.promoCode
    };
    const response = await apiClient.post('/orders', requestData);
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
