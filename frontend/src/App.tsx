import React, { useState } from 'react';
import { Role, View, Product, CartItem } from '@/types/types';
import { SAMPLE_PRODUCTS } from '@/data/data';
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
  
  // App Data State
  const [products] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

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

  // -- Cart Logic --
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

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