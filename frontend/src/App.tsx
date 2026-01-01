import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Role, Product, CartItem } from '@/types/types';
import { authService } from '@/services/authService';
import { productService } from '@/services/productService';
import { cartService } from '@/services/cartService';
import Onboarding from '@pages/Onboarding';
import Login from '@pages/Login';
import ConsumerHome from '@pages/ConsumerHome';
import FarmerDashboard from '@pages/FarmerDashboard';
import AdminDashboard from '@pages/AdminDashboard';
import ProductDetails from '@pages/ProductDetails';
import Cart from '@pages/Cart';
import OrderTracking from '@pages/OrderTracking';
import Subscriptions from '@pages/Subscriptions';
import AddProduct from '@pages/AddProduct';
import BulkOrder from '@pages/BulkOrder';
import Profile from '@pages/Profile';
import FarmerOrders from '@pages/FarmerOrders';
import FarmerProducts from '@pages/FarmerProducts';
import FarmerWallet from '@pages/FarmerWallet';
import NotificationBell from '@/components/NotificationBell';

export default function App() {
  const routerNavigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState<Role>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Log route changes
  useEffect(() => {
    console.log('Current route:', location.pathname);
  }, [location]);
  
  // App Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Check if user is already logged in (only on initial mount)
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const user = authService.getCurrentUserFromStorage();
          if (user) {
            setRole(user.role);
            // Only redirect if we're on the root or login page
            if (location.pathname === '/' || location.pathname === '/login') {
              if (user.role === 'farmer') routerNavigate('/farmer-dashboard');
              else if (user.role === 'admin') routerNavigate('/admin-dashboard');
              else routerNavigate('/home');
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []); // Empty dependency array - only run once on mount

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('Loading products...');
        const response = await productService.getAllProducts();
        console.log('Products API response:', response);
        
        if (response.success && response.data) {
          const items = response.data.items || response.data;
          console.log('Products items:', items);
          
          // Transform backend products to frontend format
          const transformedProducts = items.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: parseFloat(item.price),
            unit: item.unit || 'kg',
            image: item.image_url || 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
            farmer: item.farmer || 'Local Farm',
            rating: item.rating || 4.5,
            category: item.category || 'Other',
            description: item.description || '',
            location: item.farm_location || '',
            stock_quantity: item.stock_quantity || 0
          }));
          console.log('Transformed products:', transformedProducts);
          setProducts(transformedProducts);
        } else {
          console.log('No products data in response');
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };
    
    loadProducts();
  }, []);

  const navigate = (path: string) => {
    console.log('Navigating to:', path);
    window.scrollTo(0, 0);
    // Force a re-render by using replace: false to ensure route change
    routerNavigate(path, { replace: false });
  };

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    navigate('/login');
  };

  const handleLogin = () => {
    if (role === 'farmer') navigate('/farmer-dashboard');
    else if (role === 'admin') navigate('/admin-dashboard');
    else navigate('/home');
  };

  const handleLogout = () => {
    setRole(null);
    setCart([]);
    navigate('/');
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    navigate('/product-details');
  };

  // Load cart on mount
  useEffect(() => {
    const loadCart = async () => {
      if (authService.isAuthenticated()) {
        try {
          const response = await cartService.getCart();
          if (response.success && response.data.items) {
            // Transform backend cart items to match CartItem interface
            const cartItems = response.data.items.map((item: any) => ({
              id: item.id, // Use cart item ID, not product_id
              productId: item.product_id, // Store product_id separately
              name: item.product_name || '',
              price: parseFloat(item.price || 0),
              quantity: item.quantity,
              image: item.image_url || 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
              farmer: item.farmer || '',
              unit: item.unit || 'kg',
              category: ''
            }));
            setCart(cartItems);
          }
        } catch (error) {
          console.error('Failed to load cart:', error);
        }
      }
    };
    loadCart();
  }, []);

  // -- Cart Logic --
  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      await cartService.addToCart(product.id, quantity);
      // Reload cart from backend
      const response = await cartService.getCart();
      if (response.success && response.data.items) {
        const cartItems = response.data.items.map((item: any) => ({
          id: item.id, // Use cart item ID, not product_id
          productId: item.product_id,
          name: item.product_name || '',
          price: parseFloat(item.price || 0),
          quantity: item.quantity,
          image: item.image_url || 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
          farmer: item.farmer || '',
          unit: item.unit || 'kg',
          category: ''
        }));
        setCart(cartItems);
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const updateCartQuantity = async (itemId: string, delta: number) => {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;
    
    const newQty = item.quantity + delta;
    
    if (newQty <= 0) {
      // Optimistic update - remove from UI immediately
      setCart(prev => prev.filter(i => i.id !== itemId));
      
      try {
        await cartService.removeFromCart(itemId);
      } catch (error) {
        console.error('Failed to remove from cart:', error);
        // Rollback on error - reload cart
        const response = await cartService.getCart();
        if (response.success && response.data.items) {
          const cartItems = response.data.items.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            name: item.product_name || '',
            price: parseFloat(item.price || 0),
            quantity: item.quantity,
            image: item.image_url || 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
            farmer: item.farmer || '',
            unit: item.unit || 'kg',
            category: ''
          }));
          setCart(cartItems);
        }
      }
    } else {
      // Optimistic update - update UI immediately
      setCart(prev => prev.map(i => 
        i.id === itemId ? { ...i, quantity: newQty } : i
      ));
      
      try {
        await cartService.updateCartItem(itemId, newQty);
      } catch (error) {
        console.error('Failed to update cart:', error);
        // Rollback on error - reload cart
        const response = await cartService.getCart();
        if (response.success && response.data.items) {
          const cartItems = response.data.items.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            name: item.product_name || '',
            price: parseFloat(item.price || 0),
            quantity: item.quantity,
            image: item.image_url || 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
            farmer: item.farmer || '',
            unit: item.unit || 'kg',
            category: ''
          }));
          setCart(cartItems);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-main dark:text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Routes>
        <Route path="/" element={<Onboarding onRoleSelect={handleRoleSelect} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} role={role} onBack={() => navigate('/')} />} />
        <Route path="/home" element={
          <ConsumerHome 
            navigate={navigate} 
            cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
            products={products}
            onProductSelect={handleProductSelect}
            onAddToCart={addToCart}
          />
        } />
        <Route path="/farmer-dashboard" element={<FarmerDashboard navigate={navigate} />} />
        <Route path="/admin-dashboard" element={<AdminDashboard navigate={navigate} />} />
        <Route path="/product-details" element={
          <ProductDetails 
            navigate={navigate} 
            product={selectedProduct || products[0]} 
            onAddToCart={addToCart} 
            cartItemCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
          />
        } />
        <Route path="/cart" element={
          <Cart 
            navigate={navigate} 
            cart={cart} 
            onUpdateQuantity={updateCartQuantity} 
          />
        } />
        <Route path="/order-tracking" element={<OrderTracking navigate={navigate} />} />
        <Route path="/subscriptions" element={<Subscriptions navigate={navigate} />} />
        <Route path="/add-product" element={<AddProduct navigate={navigate} />} />
        <Route path="/bulk-order" element={<BulkOrder navigate={navigate} />} />
        <Route path="/profile" element={<Profile navigate={navigate} role={role} onLogout={handleLogout} />} />
        <Route path="/farmer-orders" element={<FarmerOrders navigate={navigate} />} />
        <Route path="/farmer-products" element={<FarmerProducts navigate={navigate} products={products} />} />
        <Route path="/farmer-wallet" element={<FarmerWallet navigate={navigate} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}