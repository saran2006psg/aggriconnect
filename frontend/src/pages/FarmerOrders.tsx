import React, { useState, useEffect } from 'react';
import { View } from '@/types/types';
import { orderService } from '@/services/orderService';

interface FarmerOrdersProps {
  navigate: (view: View) => void;
}

const FarmerOrders: React.FC<FarmerOrdersProps> = ({ navigate }) => {
  const [filter, setFilter] = useState<'All' | 'pending' | 'delivered' | 'cancelled'>('All');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await orderService.getOrders();
      if (response.success) {
        setOrders(response.data.items || []);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      loadOrders(); // Reload orders
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(o => filter === 'All' || o.status === filter);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'confirmed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'processing': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'out_for_delivery': return 'bg-primary/10 text-primary';
      case 'delivered': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col pb-24">
       <header className="flex items-center p-4 sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
           <button onClick={() => navigate('farmer-dashboard')} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
               <span className="material-symbols-outlined text-text-main dark:text-white">arrow_back_ios_new</span>
           </button>
           <h1 className="flex-1 text-center font-bold text-lg text-text-main dark:text-white pr-10">Manage Orders</h1>
       </header>

       <main className="flex-1 p-4">
           {/* Filter Tabs */}
           <div className="flex p-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl mb-6 overflow-x-auto no-scrollbar">
                {[
                  { label: 'All', value: 'All' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Delivered', value: 'delivered' },
                  { label: 'Cancelled', value: 'cancelled' }
                ].map((tab) => (
                    <button 
                        key={tab.value}
                        onClick={() => setFilter(tab.value as any)}
                        className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${filter === tab.value ? 'bg-primary text-white shadow-md' : 'text-text-subtle hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        {tab.label}
                    </button>
                ))}
           </div>

           {/* Orders List */}
           <div className="space-y-4">
               {filteredOrders.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-10 text-text-subtle opacity-70">
                       <span className="material-symbols-outlined text-4xl mb-2">filter_list_off</span>
                       <p>No orders found</p>
                   </div>
               ) : (
                   filteredOrders.map((order) => (
                       <div key={order.id} className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 border border-border-light dark:border-border-dark shadow-sm">
                           <div className="flex justify-between items-start mb-3">
                               <div className="flex-1">
                                   <div className="flex justify-between items-start">
                                       <div>
                                           <p className="font-bold text-text-main dark:text-white">Order #{order.id.slice(0, 8)}</p>
                                           <p className="text-xs text-text-subtle">{new Date(order.created_at).toLocaleDateString()}</p>
                                       </div>
                                       <span className={`px-2 py-1 rounded-md text-xs font-bold ${getStatusStyle(order.status)}`}>
                                           {formatStatus(order.status)}
                                       </span>
                                   </div>
                               </div>
                           </div>
                           
                           <div className="flex justify-between items-center py-2 border-t border-b border-border-light dark:border-border-dark my-2 border-dashed">
                               <span className="text-sm font-medium text-text-main dark:text-white">{order.items?.length || 0} items</span>
                               <span className="text-sm font-bold text-text-main dark:text-white">${parseFloat(order.total_amount).toFixed(2)}</span>
                           </div>

                           <div className="flex items-center justify-between mt-3">
                               <div className="flex items-center gap-1 text-text-subtle">
                                   <span className="material-symbols-outlined text-lg">
                                       {order.type === 'Delivery' ? 'local_shipping' : 'storefront'}
                                   </span>
                                   <span className="text-xs font-medium">{order.type}</span>
                               </div>
                               {order.status === 'Pending' && (
                                   <div className="flex gap-2">
                                       <button className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg border border-red-100 dark:border-red-800">Reject</button>
                                       <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-md shadow-primary/20">Accept</button>
                                   </div>
                               )}
                               {(order.status === 'Completed' || order.status === 'Cancelled') && (
                                   <button className="px-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-main dark:text-white text-xs font-bold rounded-lg">View Details</button>
                               )}
                           </div>
                       </div>
                   ))
               )}
           </div>
       </main>
    </div>
  );
};

export default FarmerOrders;