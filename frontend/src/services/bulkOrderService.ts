import apiClient from './apiClient';

export interface BulkOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit: string;
  frequency: 'Daily' | 'Weekly' | 'One-time';
  price_per_unit?: number;
}

export interface CreateBulkOrderData {
  business_name: string;
  business_type: 'Restaurant' | 'Hotel' | 'Caterer';
  business_location: string;
  items: BulkOrderItem[];
  budget_min: number;
  budget_max: number;
}

export const bulkOrderService = {
  async createBulkOrder(data: CreateBulkOrderData) {
    const response = await apiClient.post('/bulk-orders', data);
    return response.data;
  },

  async getBulkOrders(params?: { page?: number; perPage?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.perPage) queryParams.append('perPage', params.perPage.toString());
    
    const response = await apiClient.get(`/bulk-orders?${queryParams.toString()}`);
    return response.data;
  },

  async getBulkOrder(id: string) {
    const response = await apiClient.get(`/bulk-orders/${id}`);
    return response.data;
  },

  async respondToBulkOrder(id: string, data: { message: string; quoted_price: number }) {
    const response = await apiClient.post(`/bulk-orders/${id}/respond`, data);
    return response.data;
  },
};
