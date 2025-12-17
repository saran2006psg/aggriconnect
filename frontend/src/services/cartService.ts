import apiClient from './apiClient';

export const cartService = {
  async getCart() {
    const response = await apiClient.get('/cart');
    return response.data;
  },

  async addToCart(productId: string, quantity: number = 1) {
    const response = await apiClient.post('/cart/items', { product_id: productId, quantity });
    return response.data;
  },

  async updateCartItem(productId: string, quantity: number) {
    const response = await apiClient.put(`/cart/items/${productId}`, { quantity });
    return response.data;
  },

  async removeFromCart(itemId: string) {
    const response = await apiClient.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  async clearCart() {
    const response = await apiClient.delete('/cart/clear');
    return response.data;
  },
};
