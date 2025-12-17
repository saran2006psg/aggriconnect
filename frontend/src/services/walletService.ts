import apiClient from './apiClient';

export const walletService = {
  async getWallet() {
    const response = await apiClient.get('/wallet');
    return response.data;
  },

  async getTransactions(page: number = 1, perPage: number = 20) {
    const response = await apiClient.get(`/wallet/transactions?page=${page}&perPage=${perPage}`);
    return response.data;
  },

  async requestPayout(amount: number) {
    const response = await apiClient.post('/wallet/payouts', { amount });
    return response.data;
  },

  async getPayouts() {
    const response = await apiClient.get('/wallet/payouts');
    return response.data;
  },

  async getEarnings() {
    const response = await apiClient.get('/wallet/earnings');
    return response.data;
  },
};
