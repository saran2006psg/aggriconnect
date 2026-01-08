import React, { useState, useEffect, useMemo } from 'react';
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
import Toast from '@/components/Toast';

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
  const [cartLoading, setCartLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load cart helper function
  const loadCart = async () => {
    if (!authService.isAuthenticated()) return;
    
    // Load from localStorage immediately for instant display
    const cachedCart = localStorage.getItem('cart_cache');
    if (cachedCart) {
      try {
        const parsed = JSON.parse(cachedCart);
        setCart(parsed);
      } catch (e) {
        console.error('Failed to parse cached cart:', e);
      }
    }
    
    setCartLoading(true);
    try {
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
        // Cache for next time
        localStorage.setItem('cart_cache', JSON.stringify(cartItems));
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setCartLoading(false);
    }
  };

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

  // Load products function (reusable)
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

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Reload products when navigating to consumer home
  useEffect(() => {
    if (location.pathname === '/home') {
      loadProducts();
    }
  }, [location.pathname]);

  const navigate = (path: string, shouldRefreshProducts = false) => {
    console.log('Navigating to:', path);
    window.scrollTo(0, 0);
    // Refresh products if requested (e.g., after adding a product)
    if (shouldRefreshProducts) {
      loadProducts();
    }
    // Force a re-render by using replace: false to ensure route change
    routerNavigate(path, { replace: false });
  };

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    navigate('/login');
  };

  const handleLogin = async () => {
    // Get user info to set proper role
    const user = authService.getCurrentUserFromStorage();
    if (user) {
      setRole(user.role);
    }
    
    if (role === 'farmer') navigate('/farmer-dashboard');
    else if (role === 'admin') navigate('/admin-dashboard');
    else navigate('/home');
  };

  const handleLogout = () => {
    setRole(null);
    setCart([]);
    // Clear cart cache on logout
    localStorage.removeItem('cart_cache');
    navigate('/');
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart_cache');
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    navigate('/product-details');
  };

  // Load cart whenever role changes (user logs in) or on mount
  useEffect(() => {
    if (role && role === 'consumer') {
      loadCart();
    } else if (!role) {
      // Clear cart on logout
      setCart([]);
    }
  }, [role]);

  // Update cart cache whenever cart changes
  useEffect(() => {
    if (cart.length > 0 && authService.isAuthenticated()) {
      localStorage.setItem('cart_cache', JSON.stringify(cart));
    }
  }, [cart]);

  // Calculate total cart count (memoized for performance)
  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // -- Cart Logic --
  const addToCart = async (product: Product, quantity: number = 1) => {
    // Optimistic update - show immediately in UI
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        // Update existing item quantity
        return prev.map(i => 
          i.productId === product.id 
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        // Add new item (use temporary ID that will be replaced)
        return [...prev, {
          id: 'temp-' + product.id,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          image: product.image,
          farmer: product.farmer,
          unit: product.unit,
          category: product.category || ''
        }];
      }
    });

    // Show success toast immediately
    setToast({ message: 'Added to cart!', type: 'success' });

    // Background sync with backend
    try {
      await cartService.addToCart(product.id, quantity);
      // Silently sync with backend to get correct IDs
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
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setToast({ message: 'Failed to add to cart', type: 'error' });
      // Rollback on error
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
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      <Routes>
        <Route path="/" element={<Onboarding onRoleSelect={handleRoleSelect} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} role={role} onBack={() => navigate('/')} />} />
        <Route path="/home" element={
          <ConsumerHome 
            navigate={navigate} 
            cartCount={cartCount}
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
            cartItemCount={cartCount}
          />
        } />
        <Route path="/cart" element={
          <Cart 
            navigate={navigate} 
            cart={cart} 
            onUpdateQuantity={updateCartQuantity}
            isLoading={cartLoading}
            onClearCart={clearCart}
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