import React from 'react';
import { View } from '../types';

interface FarmerDashboardProps {
  navigate: (view: View) => void;
}

const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ navigate }) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm p-4 flex justify-between items-center border-b border-border-light dark:border-border-dark">
          <h1 className="text-2xl font-bold text-text-main dark:text-white">Dashboard</h1>
          <button onClick={() => navigate('profile')} className="h-10 w-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 transition-transform">
             <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="Farmer" className="w-full h-full object-cover" />
          </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Welcome */}
        <div>
            <h2 className="text-2xl font-bold text-text-main dark:text-white">John Appleseed</h2>
            <div className="flex items-center gap-1 mt-1 text-primary">
                <span className="material-symbols-outlined text-lg">location_on</span>
                <span className="text-sm font-medium">Green Valley Farm, CA</span>
            </div>
        </div>

        {/* Stats */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-sm">
            <p className="text-text-subtle font-medium mb-1">Today's Earnings</p>
            <p className="text-4xl font-bold text-text-main dark:text-white">$150.75</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => navigate('add-product')} className="aspect-square p-4 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.98]">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl">add_circle</span>
                </div>
                <span className="font-bold text-sm text-text-main dark:text-white text-center">Add Product</span>
            </button>
            <button onClick={() => navigate('farmer-products')} className="aspect-square p-4 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.98]">
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-2xl">inventory_2</span>
                </div>
                <span className="font-bold text-sm text-text-main dark:text-white text-center">Inventory</span>
            </button>
             <button onClick={() => navigate('farmer-orders')} className="aspect-square p-4 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.98] relative">
                <div className="absolute top-3 right-3 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">3</div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <span className="material-symbols-outlined text-2xl">shopping_basket</span>
                </div>
                <span className="font-bold text-sm text-text-main dark:text-white text-center">Orders</span>
            </button>
             <button onClick={() => navigate('farmer-wallet')} className="aspect-square p-4 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.98]">
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                </div>
                <span className="font-bold text-sm text-text-main dark:text-white text-center">Wallet</span>
            </button>
        </div>

        {/* Recent Orders List */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-text-main dark:text-white">Today's Orders</h3>
                <button onClick={() => navigate('farmer-orders')} className="text-primary text-sm font-bold hover:underline">View All</button>
            </div>
            <div className="space-y-4">
                {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                             <img src={`https://randomuser.me/api/portraits/thumb/women/${i + 20}.jpg`} alt="User" className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1">
                             <p className="font-bold text-text-main dark:text-white text-sm">Jane Doe</p>
                             <p className="text-xs text-text-subtle">Pickup • 3 Items</p>
                         </div>
                         <span className="font-bold text-primary">$24.50</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark p-2 pb-safe z-30">
          <div className="flex justify-around items-center">
              <button onClick={() => navigate('farmer-dashboard')} className="flex flex-col items-center gap-1 p-2 text-primary">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>dashboard</span>
                  <span className="text-[10px] font-bold">Dashboard</span>
              </button>
              <button onClick={() => navigate('farmer-orders')} className="flex flex-col items-center gap-1 p-2 text-text-subtle dark:text-gray-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">list_alt</span>
                  <span className="text-[10px] font-medium">Orders</span>
              </button>
              <button onClick={() => navigate('farmer-products')} className="flex flex-col items-center gap-1 p-2 text-text-subtle dark:text-gray-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">grass</span>
                  <span className="text-[10px] font-medium">Products</span>
              </button>
              <button onClick={() => navigate('profile')} className="flex flex-col items-center gap-1 p-2 text-text-subtle dark:text-gray-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">person</span>
                  <span className="text-[10px] font-medium">Profile</span>
              </button>
          </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;