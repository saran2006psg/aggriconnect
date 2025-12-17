import React, { useState, useEffect } from 'react';
import { View } from '@/types/types';
import { orderService } from '@/services/orderService';

interface OrderTrackingProps {
  navigate: (view: View) => void;
}


const OrderTracking: React.FC<OrderTrackingProps> = ({ navigate }) => {
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

  const getStatusColor = (status: string) => {
    const statusMap: any = {
      'pending': 'bg-yellow-500/10 text-yellow-600',
      'confirmed': 'bg-blue-500/10 text-blue-600',
      'processing': 'bg-purple-500/10 text-purple-600',
      'out_for_delivery': 'bg-primary/10 text-primary',
      'delivered': 'bg-green-500/10 text-green-600',
      'cancelled': 'bg-red-500/10 text-red-600'
    };
    return statusMap[status] || 'bg-gray-500/10 text-gray-600';
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
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
       <header className="flex items-center p-4 sticky top-0 z-10">
           <button onClick={() => navigate('consumer-home')} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
               <span className="material-symbols-outlined text-text-main dark:text-white">arrow_back_ios_new</span>
           </button>
           <h1 className="flex-1 text-center font-bold text-lg text-text-main dark:text-white pr-10">Order Tracking</h1>
       </header>

       <main className="flex-1 p-4 pb-24">
           {orders.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-center">
               <div className="h-24 w-24 bg-surface-light dark:bg-surface-dark rounded-full flex items-center justify-center mb-4">
                 <span className="material-symbols-outlined text-4xl text-text-subtle">receipt_long</span>
               </div>
               <h2 className="text-xl font-bold text-text-main dark:text-white mb-2">No orders yet</h2>
               <p className="text-text-subtle mb-6">Start shopping to place your first order</p>
               <button onClick={() => navigate('consumer-home')} className="px-8 py-3 bg-primary text-white rounded-full font-bold shadow-lg hover:bg-primary/90 transition-colors">Browse Products</button>
             </div>
           ) : (
             <div className="space-y-4">
               {orders.map((order) => (
                 <div key={order.id} className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-border-light dark:border-border-dark">
                   <div className="flex justify-between items-start mb-3">
                     <div>
                       <h3 className="font-bold text-text-main dark:text-white">Order #{order.id.slice(0, 8)}</h3>
                       <p className="text-sm text-text-subtle">{order.items?.length || 0} Items • ${parseFloat(order.total_amount).toFixed(2)}</p>
                       <p className="text-xs text-text-subtle mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                     </div>
                     <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>
                       {formatStatus(order.status)}
                     </span>
                   </div>
                   
                   <div className="flex gap-2 text-sm text-text-subtle">
                     <span className="material-symbols-outlined text-sm">local_shipping</span>
                     <span>{order.delivery_type}</span>
                   </div>

                   {order.items && order.items.length > 0 && (
                     <div className="mt-3 pt-3 border-t border-border-light dark:border-border-dark">
                       <p className="text-xs text-text-subtle mb-2">Items:</p>
                       <div className="space-y-1">
                         {order.items.slice(0, 2).map((item: any, idx: number) => (
                           <div key={idx} className="flex justify-between text-sm">
                             <span className="text-text-main dark:text-white">{item.product?.name || 'Product'} x{item.quantity}</span>
                             <span className="text-text-subtle">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                           </div>
                         ))}
                         {order.items.length > 2 && (
                           <p className="text-xs text-text-subtle">+{order.items.length - 2} more items</p>
                         )}
                       </div>
                     </div>
                   )}
                 </div>
               ))}
             </div>
           )}

       </main>
    </div>
  );
};

export default OrderTracking;