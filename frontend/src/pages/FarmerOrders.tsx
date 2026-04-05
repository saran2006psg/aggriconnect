import React, { useState, useEffect } from 'react';
import { orderService } from '@/services/orderService';

interface FarmerOrdersProps {
  navigate: (path: string) => void;
}

const FarmerOrders: React.FC<FarmerOrdersProps> = ({ navigate }) => {
  const [filter, setFilter] = useState<'All' | 'pending' | 'delivered' | 'cancelled'>('All');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

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

  const handleStatusUpdate = async (orderId: string, newStatus: string, confirmMessage?: string) => {
    if (confirmMessage && !confirm(confirmMessage)) return;
    
    setStatusUpdateLoading(true);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      await loadOrders();
      if (selectedOrder?.id === orderId) {
        const updatedOrder = orders.find(o => o.id === orderId);
        setSelectedOrder(updatedOrder || null);
      }
      alert(`Order ${formatStatus(newStatus)}!`);
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const normalizeStatus = (status?: string) => {
    return (status || '').toLowerCase().replace(/\s+/g, '_');
  };

  const formatCurrency = (value: number | string) => {
    const amount = Number(value || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleViewDetails = async (orderId: string) => {
    setDetailsLoading(true);
    try {
      const response = await orderService.getOrder(orderId);
      if (response.success && response.data) {
        setSelectedOrder(response.data);
      } else {
        alert('Unable to load order details');
      }
    } catch (error) {
      console.error('Failed to load order details:', error);
      alert('Failed to load order details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => filter === 'All' || normalizeStatus(o.status) === filter);

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
           <button onClick={() => navigate('/farmer-dashboard')} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
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
                                         <span className={`px-2 py-1 rounded-md text-xs font-bold ${getStatusStyle(normalizeStatus(order.status))}`}>
                                           {formatStatus(normalizeStatus(order.status))}
                                       </span>
                                   </div>
                               </div>
                           </div>
                           
                           <div className="flex justify-between items-center py-2 border-t border-b border-border-light dark:border-border-dark my-2 border-dashed">
                                     <span className="text-sm font-medium text-text-main dark:text-white">{order.item_count || order.order_items?.length || order.items?.length || 0} items</span>
                                     <span className="text-sm font-bold text-text-main dark:text-white">{formatCurrency(order.farmer_earning || order.total || order.total_amount || 0)}</span>
                           </div>

                           <div className="mt-3 space-y-2">
                               <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-1 text-text-subtle">
                                       <span className="material-symbols-outlined text-lg">
                                           {order.delivery_type === 'Delivery' ? 'local_shipping' : 'storefront'}
                                       </span>
                                       <span className="text-xs font-medium">{order.delivery_type}</span>
                                   </div>
                                   <button 
                                       onClick={() => handleViewDetails(order.id)}
                                       className="text-primary text-xs font-bold hover:underline"
                                   >
                                       View Details
                                   </button>
                               </div>
                               
                               {/* Status progression buttons */}
                                   {normalizeStatus(order.status) === 'pending' && (
                                   <div className="flex gap-2">
                                       <button 
                                           onClick={() => handleStatusUpdate(order.id, 'cancelled', 'Are you sure you want to reject this order?')}
                                           disabled={statusUpdateLoading}
                                           className="flex-1 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg border border-red-100 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                                       >
                                           Reject
                                       </button>
                                       <button 
                                           onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                                           disabled={statusUpdateLoading}
                                           className="flex-1 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50"
                                       >
                                           Accept Order
                                       </button>
                                   </div>
                               )}
                                     {normalizeStatus(order.status) === 'confirmed' && (
                                   <button 
                                       onClick={() => handleStatusUpdate(order.id, 'processing')}
                                       disabled={statusUpdateLoading}
                                       className="w-full px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                                   >
                                       Start Preparing
                                   </button>
                               )}
                                   {normalizeStatus(order.status) === 'processing' && (
                                   <button 
                                       onClick={() => handleStatusUpdate(order.id, 'out_for_delivery', 'Mark order as shipped/ready for pickup?')}
                                       disabled={statusUpdateLoading}
                                       className="w-full px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                                   >
                                       {order.delivery_type === 'Delivery' ? 'Mark as Shipped' : 'Ready for Pickup'}
                                   </button>
                               )}
                                   {normalizeStatus(order.status) === 'out_for_delivery' && (
                                   <button 
                                       onClick={() => handleStatusUpdate(order.id, 'delivered', 'Confirm order has been delivered/picked up?')}
                                       disabled={statusUpdateLoading}
                                       className="w-full px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:opacity-50"
                                   >
                                       Mark as Delivered
                                   </button>
                               )}
                           </div>
                       </div>
                   ))
               )}
           </div>
       </main>

       {/* Order Detail Modal */}
       {selectedOrder && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
           <div className="bg-background-light dark:bg-background-dark rounded-t-3xl md:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div className="sticky top-0 bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark p-4 flex items-center justify-between">
               <h2 className="text-xl font-bold text-text-main dark:text-white">Order Details</h2>
               <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                 <span className="material-symbols-outlined">close</span>
               </button>
             </div>

             <div className="p-6 space-y-4">
               <div className="flex justify-between items-start">
                 <div>
                   <p className="text-sm text-text-subtle">Order ID</p>
                   <p className="font-bold text-text-main dark:text-white">#{selectedOrder.id.slice(0, 8)}</p>
                 </div>
                 <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(normalizeStatus(selectedOrder.status))}`}>
                   {formatStatus(normalizeStatus(selectedOrder.status))}
                 </span>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <p className="text-sm text-text-subtle">Order Date</p>
                   <p className="font-medium text-text-main dark:text-white">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                 </div>
                 <div>
                   <p className="text-sm text-text-subtle">Delivery Type</p>
                   <p className="font-medium text-text-main dark:text-white">{selectedOrder.delivery_type}</p>
                 </div>
               </div>

               <div className="border-t border-border-light dark:border-border-dark pt-4">
                 <p className="text-sm font-bold text-text-main dark:text-white mb-3">Order Items</p>
                 {detailsLoading && <p className="text-sm text-text-subtle">Loading details...</p>}
                 <div className="space-y-3">
                   {(selectedOrder.items || selectedOrder.order_items || []).map((item: any, index: number) => (
                     <div key={index} className="flex gap-3 p-3 bg-surface-light dark:bg-surface-dark rounded-xl">
                       <div className="h-16 w-16 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0">
                         {(item.product_image_url || item.products?.image_url) ? (
                           <img src={item.product_image_url || item.products?.image_url} alt={item.product_name || item.products?.name} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center">
                             <span className="material-symbols-outlined text-gray-400">potted_plant</span>
                           </div>
                         )}
                       </div>
                       <div className="flex-1">
                         <p className="font-medium text-text-main dark:text-white">{item.product_name || item.products?.name || 'Product'}</p>
                         <p className="text-xs text-text-subtle">{item.product_category || item.products?.category}</p>
                         <div className="flex justify-between items-center mt-1">
                           <p className="text-sm text-text-subtle">Qty: {item.quantity}</p>
                           <p className="font-bold text-primary">{formatCurrency(item.subtotal || 0)}</p>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="border-t border-border-light dark:border-border-dark pt-4 space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="text-text-subtle">Subtotal</span>
                   <span className="font-medium text-text-main dark:text-white">{formatCurrency(selectedOrder.subtotal || 0)}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-text-subtle">Delivery Fee</span>
                   <span className="font-medium text-text-main dark:text-white">{formatCurrency(selectedOrder.delivery_fee || 0)}</span>
                 </div>
                 {selectedOrder.discount > 0 && (
                   <div className="flex justify-between text-sm">
                     <span className="text-text-subtle">Discount</span>
                     <span className="font-medium text-green-600">-{formatCurrency(selectedOrder.discount || 0)}</span>
                   </div>
                 )}
                 <div className="flex justify-between text-lg font-bold border-t border-border-light dark:border-border-dark pt-2">
                   <span className="text-text-main dark:text-white">Total</span>
                   <span className="text-primary">{formatCurrency(selectedOrder.total || 0)}</span>
                 </div>
                 {normalizeStatus(selectedOrder.status) === 'delivered' && (
                   <div className="flex justify-between text-sm bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2 mt-2">
                     <span className="text-green-700 dark:text-green-400 font-medium">Earnings Credited</span>
                     <span className="text-green-700 dark:text-green-400 font-bold">{formatCurrency(selectedOrder.farmer_earning || selectedOrder.total || 0)}</span>
                   </div>
                 )}
               </div>

               {/* Status action buttons in modal */}
               <div className="border-t border-border-light dark:border-border-dark pt-4">
                 {normalizeStatus(selectedOrder.status) === 'pending' && (
                   <div className="flex gap-3">
                     <button 
                       onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled', 'Are you sure you want to reject this order?')}
                       disabled={statusUpdateLoading}
                       className="flex-1 px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl border border-red-100 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                     >
                       Reject Order
                     </button>
                     <button 
                       onClick={() => handleStatusUpdate(selectedOrder.id, 'confirmed')}
                       disabled={statusUpdateLoading}
                       className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                     >
                       Accept Order
                     </button>
                   </div>
                 )}
                 {normalizeStatus(selectedOrder.status) === 'confirmed' && (
                   <button 
                     onClick={() => handleStatusUpdate(selectedOrder.id, 'processing')}
                     disabled={statusUpdateLoading}
                     className="w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                   >
                     Start Preparing Order
                   </button>
                 )}
                 {normalizeStatus(selectedOrder.status) === 'processing' && (
                   <button 
                     onClick={() => handleStatusUpdate(selectedOrder.id, 'out_for_delivery', 'Mark order as shipped/ready for pickup?')}
                     disabled={statusUpdateLoading}
                     className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                   >
                     {selectedOrder.delivery_type === 'Delivery' ? 'Mark as Shipped' : 'Ready for Pickup'}
                   </button>
                 )}
                 {normalizeStatus(selectedOrder.status) === 'out_for_delivery' && (
                   <button 
                     onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered', 'Confirm order has been delivered/picked up?')}
                     disabled={statusUpdateLoading}
                     className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-md hover:bg-green-700 transition-colors disabled:opacity-50"
                   >
                     Mark as Delivered
                   </button>
                 )}
               </div>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default FarmerOrders;