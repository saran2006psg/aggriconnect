# 🔗 Frontend-Backend Integration Guide

This guide explains how to integrate the React frontend with the FastAPI backend.

## 📡 API Communication Setup

### 1. Create API Client (Frontend)

Create `frontend/src/api/client.ts`:

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          await this.refreshToken();
        }
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        localStorage.setItem('access_token', response.data.access_token);
        return response.data.access_token;
      } catch (error) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
  }

  // Authentication
  async register(userData: any) {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.client.post('/auth/login', credentials);
    const { access_token, refresh_token, user } = response.data;
    
    // Store tokens
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  }

  async logout() {
    await this.client.post('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // Users
  async getCurrentUser() {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.client.put('/users/me', data);
    return response.data;
  }

  // Products
  async getProducts(params?: any) {
    const response = await this.client.get('/products', { params });
    return response.data;
  }

  async getProduct(productId: string) {
    const response = await this.client.get(`/products/${productId}`);
    return response.data;
  }

  async createProduct(data: any) {
    const response = await this.client.post('/products', data);
    return response.data;
  }

  async updateProduct(productId: string, data: any) {
    const response = await this.client.put(`/products/${productId}`, data);
    return response.data;
  }

  async deleteProduct(productId: string) {
    await this.client.delete(`/products/${productId}`);
  }

  // Cart
  async getCart() {
    const response = await this.client.get('/cart');
    return response.data;
  }

  async addToCart(productId: string, quantity: number) {
    const response = await this.client.post('/cart/items', {
      product_id: productId,
      quantity,
    });
    return response.data;
  }

  async updateCartItem(itemId: string, quantity: number) {
    const response = await this.client.put(`/cart/items/${itemId}`, {
      quantity,
    });
    return response.data;
  }

  async removeFromCart(itemId: string) {
    await this.client.delete(`/cart/items/${itemId}`);
  }

  async clearCart() {
    await this.client.delete('/cart');
  }

  // Orders
  async createOrder(shippingAddress: string) {
    const response = await this.client.post('/orders', {
      shipping_address: shippingAddress,
    });
    return response.data;
  }

  async getOrders(params?: any) {
    const response = await this.client.get('/orders', { params });
    return response.data;
  }

  async getOrder(orderId: string) {
    const response = await this.client.get(`/orders/${orderId}`);
    return response.data;
  }

  async updateOrderStatus(orderId: string, status: string) {
    const response = await this.client.put(`/orders/${orderId}/status`, {
      status,
    });
    return response.data;
  }

  // Subscriptions
  async getSubscriptions() {
    const response = await this.client.get('/subscriptions');
    return response.data;
  }

  async createSubscription(data: any) {
    const response = await this.client.post('/subscriptions', data);
    return response.data;
  }

  async updateSubscription(subscriptionId: string, data: any) {
    const response = await this.client.put(`/subscriptions/${subscriptionId}`, data);
    return response.data;
  }

  async pauseSubscription(subscriptionId: string) {
    const response = await this.client.put(`/subscriptions/${subscriptionId}/pause`);
    return response.data;
  }

  async cancelSubscription(subscriptionId: string) {
    await this.client.delete(`/subscriptions/${subscriptionId}`);
  }

  // Wallet (Farmers)
  async getWallet() {
    const response = await this.client.get('/wallet');
    return response.data;
  }

  async getWalletTransactions(params?: any) {
    const response = await this.client.get('/wallet/transactions', { params });
    return response.data;
  }

  async requestWithdrawal(amount: number, notes?: string) {
    const response = await this.client.post('/wallet/withdraw', {
      amount,
      notes,
    });
    return response.data;
  }

  async getEarnings() {
    const response = await this.client.get('/wallet/earnings');
    return response.data;
  }

  // Reviews
  async getProductReviews(productId: string) {
    const response = await this.client.get(`/reviews/product/${productId}`);
    return response.data;
  }

  async createReview(productId: string, rating: number, comment?: string) {
    const response = await this.client.post('/reviews', {
      product_id: productId,
      rating,
      comment,
    });
    return response.data;
  }

  // Analytics (Admin)
  async getDashboardAnalytics() {
    const response = await this.client.get('/analytics/dashboard');
    return response.data;
  }

  async getUserAnalytics() {
    const response = await this.client.get('/analytics/users');
    return response.data;
  }

  async getSalesAnalytics() {
    const response = await this.client.get('/analytics/sales');
    return response.data;
  }
}

export const api = new APIClient();
```

### 2. Install Axios (if not already installed)

```bash
cd frontend
npm install axios
```

### 3. Update Environment Variables

`frontend/.env`:
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_GEMINI_API_KEY=your_gemini_key
```

## 🔐 Authentication Flow

### Registration Example

```typescript
import { api } from '@/api/client';

const handleRegister = async (formData: {
  email: string;
  password: string;
  name: string;
  role: 'consumer' | 'farmer';
}) => {
  try {
    const response = await api.register(formData);
    console.log('User registered:', response.user);
    // Tokens are automatically stored
    // Redirect to dashboard
    navigate('/dashboard');
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

### Login Example

```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await api.login({ email, password });
    console.log('Logged in:', response.user);
    
    // Redirect based on role
    if (response.user.role === 'farmer') {
      navigate('/farmer-dashboard');
    } else if (response.user.role === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/consumer-home');
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

## 🛒 Product Management

### Fetch Products

```typescript
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const data = await api.getProducts({
        category: 'Fruits',
        limit: 20,
        offset: 0,
      });
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, []);
```

### Create Product (Farmer)

```typescript
const handleCreateProduct = async (productData: {
  name: string;
  price: number;
  description: string;
  category: string;
  unit: string;
  stock_quantity: number;
}) => {
  try {
    const product = await api.createProduct(productData);
    console.log('Product created:', product);
    // Refresh product list
  } catch (error) {
    console.error('Failed to create product:', error);
  }
};
```

## 🛍️ Shopping Cart

### Add to Cart

```typescript
const handleAddToCart = async (productId: string, quantity: number) => {
  try {
    await api.addToCart(productId, quantity);
    // Show success message
    // Update cart count
  } catch (error) {
    console.error('Failed to add to cart:', error);
  }
};
```

### Get Cart

```typescript
const [cart, setCart] = useState(null);

useEffect(() => {
  const fetchCart = async () => {
    try {
      const cartData = await api.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  fetchCart();
}, []);
```

### Checkout

```typescript
const handleCheckout = async (shippingAddress: string) => {
  try {
    const order = await api.createOrder(shippingAddress);
    console.log('Order created:', order);
    // Clear cart
    // Navigate to order confirmation
    navigate(`/order-tracking/${order.id}`);
  } catch (error) {
    console.error('Checkout failed:', error);
  }
};
```

## 📦 Order Management

### Get Orders (Consumer)

```typescript
const [orders, setOrders] = useState([]);

useEffect(() => {
  const fetchOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  fetchOrders();
}, []);
```

### Update Order Status (Farmer)

```typescript
const handleUpdateOrderStatus = async (
  orderId: string,
  status: 'confirmed' | 'shipped' | 'delivered'
) => {
  try {
    const updatedOrder = await api.updateOrderStatus(orderId, status);
    console.log('Order updated:', updatedOrder);
    // Refresh orders list
  } catch (error) {
    console.error('Failed to update order:', error);
  }
};
```

## 💰 Wallet Operations (Farmer)

### Get Wallet Balance

```typescript
const [wallet, setWallet] = useState(null);

useEffect(() => {
  const fetchWallet = async () => {
    try {
      const walletData = await api.getWallet();
      setWallet(walletData);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    }
  };

  fetchWallet();
}, []);
```

### Request Withdrawal

```typescript
const handleWithdrawal = async (amount: number) => {
  try {
    const result = await api.requestWithdrawal(amount, 'Bank account XYZ');
    console.log('Withdrawal requested:', result);
    // Show success message
  } catch (error) {
    console.error('Withdrawal failed:', error);
  }
};
```

## 📊 Admin Analytics

### Get Dashboard Data

```typescript
const [analytics, setAnalytics] = useState(null);

useEffect(() => {
  const fetchAnalytics = async () => {
    try {
      const data = await api.getDashboardAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  fetchAnalytics();
}, []);
```

## 🔄 Real-time Updates (Optional)

For real-time features, you can:

1. **Use Supabase Realtime:**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

// Subscribe to order updates
const orderSubscription = supabase
  .channel('orders')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      console.log('Order updated:', payload.new);
      // Update UI
    }
  )
  .subscribe();
```

2. **Use WebSockets (custom implementation):**

Add WebSocket support to FastAPI backend and connect from frontend.

## 🛡️ Error Handling

### Global Error Handler

```typescript
import { AxiosError } from 'axios';

export const handleAPIError = (error: unknown) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.detail || 'An error occurred';
    const status = error.response?.status;

    if (status === 401) {
      // Unauthorized - redirect to login
      window.location.href = '/login';
    } else if (status === 403) {
      // Forbidden
      alert('You do not have permission to perform this action');
    } else if (status === 404) {
      // Not found
      alert('Resource not found');
    } else {
      // Other errors
      alert(message);
    }
  } else {
    alert('An unexpected error occurred');
  }
};
```

Use it in your components:

```typescript
try {
  await api.createProduct(productData);
} catch (error) {
  handleAPIError(error);
}
```

## 📝 TypeScript Types

Create `frontend/src/types/api.ts`:

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'consumer' | 'farmer' | 'admin';
  profile_image_url?: string;
  is_verified: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  farmer_id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  unit: string;
  image_url?: string;
  location?: string;
  stock_quantity: number;
  rating: number;
  rating_count: number;
  is_active: boolean;
  farmer_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  product_name?: string;
  product_image?: string;
  current_price?: number;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  total_items: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  farmer_id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: string;
  order_date: string;
  delivery_date?: string;
  items: OrderItem[];
  farmer_name?: string;
  user_name?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_name?: string;
  product_image?: string;
}
```

## ✅ Testing API Integration

```bash
# Test backend is running
curl http://localhost:8000/health

# Test registration
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "consumer"
  }'

# Test login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 🎉 You're All Set!

Your frontend is now fully integrated with the backend. You can:

✅ Register and login users  
✅ Manage products  
✅ Handle cart operations  
✅ Create and track orders  
✅ Process payments (wallet)  
✅ View analytics  

**Happy coding! 🚀**
