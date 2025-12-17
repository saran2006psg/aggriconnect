import React, { useState, useEffect } from 'react';
import { Role, View, Product, CartItem } from '@/types/types';
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

export default function App() {
  const [currentView, setCurrentView] = useState<View>('onboarding');
  const [role, setRole] = useState<Role>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // App Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const user = authService.getCurrentUserFromStorage();
          if (user) {
            setRole(user.role);
            if (user.role === 'farmer') setCurrentView('farmer-dashboard');
            else if (user.role === 'admin') setCurrentView('admin-dashboard');
            else setCurrentView('consumer-home');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // Load products
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

  const navigate = (view: View) => {
    window.scrollTo(0, 0);
    setCurrentView(view);
  };

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    navigate('login');
  };

  const handleLogin = () => {
    if (role === 'farmer') navigate('farmer-dashboard');
    else if (role === 'admin') navigate('admin-dashboard');
    else navigate('consumer-home');
  };

  const handleLogout = () => {
    setRole(null);
    setCart([]);
    navigate('onboarding');
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    navigate('product-details');
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
  }, [currentView]);

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

  const renderView = () => {
    switch (currentView) {
      case 'onboarding':
        return <Onboarding onRoleSelect={handleRoleSelect} />;
      case 'login':
        return <Login onLogin={handleLogin} role={role} onBack={() => navigate('onboarding')} />;
      case 'consumer-home':
        return (
          <ConsumerHome 
            navigate={navigate} 
            cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
            products={products}
            onProductSelect={handleProductSelect}
            onAddToCart={addToCart}
          />
        );
      case 'farmer-dashboard':
        return <FarmerDashboard navigate={navigate} />;
      case 'admin-dashboard':
        return <AdminDashboard navigate={navigate} />;
      case 'product-details':
        return (
          <ProductDetails 
            navigate={navigate} 
            product={selectedProduct || products[0]} 
            onAddToCart={addToCart} 
            cartItemCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
          />
        );
      case 'cart':
        return (
          <Cart 
            navigate={navigate} 
            cart={cart} 
            onUpdateQuantity={updateCartQuantity} 
          />
        );
      case 'order-tracking':
        return <OrderTracking navigate={navigate} />;
      case 'subscriptions':
        return <Subscriptions navigate={navigate} />;
      case 'add-product':
        return <AddProduct navigate={navigate} />;
      case 'bulk-order':
        return <BulkOrder navigate={navigate} />;
      case 'profile':
        return <Profile navigate={navigate} role={role} onLogout={handleLogout} />;
      case 'farmer-orders':
        return <FarmerOrders navigate={navigate} />;
      case 'farmer-products':
        return <FarmerProducts navigate={navigate} products={products} />;
      case 'farmer-wallet':
        return <FarmerWallet navigate={navigate} />;
      default:
        return <Onboarding onRoleSelect={handleRoleSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      {renderView()}
    </div>
  );
}