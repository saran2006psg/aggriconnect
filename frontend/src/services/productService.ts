import apiClient from './apiClient';
import { Product } from '../types/types';

export const productService = {
  async getAllProducts(filters?: {
    category?: string;
    search?: string;
    farmerId?: string;
    page?: number;
    perPage?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.farmerId) params.append('farmerId', filters.farmerId);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.perPage) params.append('perPage', filters.perPage.toString());

    const response = await apiClient.get(`/products?${params.toString()}`);
    return response.data;
  },

  async getProduct(id: string) {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  async createProduct(product: Partial<Product>) {
    const response = await apiClient.post('/products', product);
    return response.data;
  },

  async updateProduct(id: string, product: Partial<Product>) {
    const response = await apiClient.put(`/products/${id}`, product);
    return response.data;
  },

  async deleteProduct(id: string) {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};
