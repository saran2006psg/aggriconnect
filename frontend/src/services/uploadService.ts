import apiClient from './apiClient';

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
