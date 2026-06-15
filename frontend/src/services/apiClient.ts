import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh for auth endpoints to prevent infinite loops
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');
    
    // If 401 and not already retried and not an auth endpoint, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // No refresh token — clear everything and redirect immediately
        _clearAuthAndRedirect();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        if (response.data.success) {
          const newAccessToken = response.data.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } else {
          _clearAuthAndRedirect();
          return Promise.reject(error);
        }
      } catch {
        _clearAuthAndRedirect();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

function _clearAuthAndRedirect() {
  console.log('🔒 Session expired — clearing auth and redirecting to login');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('cart_cache');
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login?expired=true';
  }
}

// Named export for backwards compatibility
export { apiClient };
export default apiClient;
