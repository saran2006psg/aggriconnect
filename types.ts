export type Role = 'consumer' | 'farmer' | 'admin' | null;

export type View = 
  | 'onboarding'
  | 'login'
  | 'consumer-home'
  | 'farmer-dashboard'
  | 'admin-dashboard'
  | 'product-details'
  | 'cart'
  | 'order-tracking'
  | 'subscriptions'
  | 'add-product'
  | 'bulk-order'
  | 'profile'
  | 'farmer-orders'
  | 'farmer-products'
  | 'farmer-wallet';

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  farmer: string;
  rating: number;
  category: string;
  description?: string;
  location?: string;
}

export interface CartItem extends Product {
  quantity: number;
}