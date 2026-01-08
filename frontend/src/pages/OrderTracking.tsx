import React, { useState, useEffect } from 'react';
import { orderService } from '@/services/orderService';
import { apiClient } from '@/services/apiClient';
import ReviewModal from '@/components/ReviewModal';

interface OrderTrackingProps {
  navigate: (path: string) => void;
}


const OrderTracking: React.FC<OrderTrackingProps> = ({ navigate }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    loadOrders();
    
    // Auto-refresh orders every 30 seconds to check for status updates
    const interval = setInterval(() => {
      loadOrders();
    }, 30000);
    
    return () => clearInterval(interval);
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
    const normalizedStatus = status.toLowerCase().replace(/ /g, '_');
    const statusMap: any = {
      'pending': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
      'confirmed': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      'processing': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      'out_for_delivery': 'bg-primary/10 text-primary',
      'delivered': 'bg-green-500/10 text-green-600 dark:text-green-400',
      'cancelled': 'bg-red-500/10 text-red-600 dark:text-red-400'
    };
    return statusMap[normalizedStatus] || 'bg-gray-500/10 text-gray-600';
  };

  const formatStatus = (status: string) => {
    return status.split(/[_\s]/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    setCancelLoading(true);
    try {
      await orderService.updateOrderStatus(orderId, 'cancelled');
      await loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
      alert('Order cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order');
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusProgress = (status: string) => {
    const steps = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered'];
    const currentIndex = steps.indexOf(status);
    return currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;
  };

  const getStatusIcon = (status: string) => {
    const icons: any = {
      'pending': 'schedule',
      'confirmed': 'task_alt',
      'processing': 'package_2',
      'out_for_delivery': 'local_shipping',
      'delivered': 'check_circle',
      'cancelled': 'cancel'
    };
    return icons[status] || 'pending';
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!reviewProduct) return;
    
    try {
      const response = await apiClient.post(`/reviews/${reviewProduct.id}`, {
        rating,
        comment
      });
      
      if (response.data.success) {
        alert('Review submitted successfully!');
        setReviewProduct(null);
      } else {
        throw new Error(response.data.message || 'Failed to submit review');
      }
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      throw error;
    }
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
           <button onClick={() => navigate('/home')} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
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
               <button onClick={() => navigate('/home')} className="px-8 py-3 bg-primary text-white rounded-full font-bold shadow-lg hover:bg-primary/90 transition-colors">Browse Products</button>
             </div>
           ) : (
             <div className="space-y-4">
               {orders.map((order) => (
                 <div 
                   key={order.id} 
                   onClick={() => setSelectedOrder(order)}
                   className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-border-light dark:border-border-dark cursor-pointer hover:shadow-md transition-shadow"
                 >
                   <div className="flex justify-between items-start mb-3">
                     <div>
                       <h3 className="font-bold text-text-main dark:text-white">Order #{order.id.slice(0, 8)}</h3>
                       <p className="text-sm text-text-subtle">{order.order_items?.length || 0} Items • ${parseFloat(order.total || order.total_amount).toFixed(2)}</p>
                       <p className="text-xs text-text-subtle mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                     </div>
                     <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>
                       {formatStatus(order.status)}
                     </span>
                   </div>
                   
                   {/* Status Progress Bar */}
                   {order.status !== 'cancelled' && (
                     <div className="mb-3">
                       <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-primary transition-all duration-500"
                           style={{ width: `${getStatusProgress(order.status)}%` }}
                         />
                       </div>
                       <div className="flex justify-between mt-1 text-xs text-text-subtle">
                         <span>Placed</span>
                         {order.status === 'delivered' ? <span>Delivered</span> : <span>In Progress</span>}
                       </div>
                     </div>
                   )}
                   
                   <div className="flex gap-2 text-sm text-text-subtle items-center">
                     <span className="material-symbols-outlined text-sm">{getStatusIcon(order.status)}</span>
                     <span>{order.delivery_type}</span>
                   </div>

                   {order.order_items && order.order_items.length > 0 && (
                     <div className="mt-3 pt-3 border-t border-border-light dark:border-border-dark">
                       <div className="flex gap-2 overflow-x-auto no-scrollbar">
                         {order.order_items.slice(0, 3).map((item: any, idx: number) => (
                           <div key={idx} className="flex-shrink-0 w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                             {item.products?.image_url ? (
                               <img src={item.products.image_url} alt="" className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center">
                                 <span className="material-symbols-outlined text-gray-400 text-sm">potted_plant</span>
                               </div>
                             )}
                           </div>
                         ))}
                         {order.order_items.length > 3 && (
                           <div className="flex-shrink-0 w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                             <span className="text-xs font-bold text-text-subtle">+{order.order_items.length - 3}</span>
                           </div>
                         )}
                       </div>
                     </div>
                   )}
                 </div>
               ))}
             </div>
           )}

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

             <div className="p-6 space-y-6">
               {/* Status Timeline */}
               <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-4">
                 <div className="flex items-center justify-between mb-2">
                   <h3 className="font-bold text-text-main dark:text-white">Order Status</h3>
                   <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedOrder.status)}`}>
                     {formatStatus(selectedOrder.status)}
                   </span>
                 </div>
                 
                 {selectedOrder.status !== 'cancelled' && (
                   <div className="space-y-3 mt-4">
                     {[
                       { status: 'pending', label: 'Order Placed', icon: 'receipt' },
                       { status: 'confirmed', label: 'Confirmed', icon: 'task_alt' },
                       { status: 'processing', label: 'Preparing', icon: 'package_2' },
                       { status: 'out_for_delivery', label: selectedOrder.delivery_type === 'Delivery' ? 'Out for Delivery' : 'Ready for Pickup', icon: 'local_shipping' },
                       { status: 'delivered', label: 'Delivered', icon: 'check_circle' }
                     ].map((step, index) => {
                       const steps = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered'];
                       const currentIndex = steps.indexOf(selectedOrder.status);
                       const stepIndex = steps.indexOf(step.status);
                       const isCompleted = stepIndex <= currentIndex;
                       const isCurrent = stepIndex === currentIndex;
                       
                       return (
                         <div key={step.status} className="flex items-start gap-3">
                           <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                             <span className="material-symbols-outlined text-sm">{step.icon}</span>
                           </div>
                           <div className="flex-1">
                             <p className={`font-medium ${isCompleted ? 'text-text-main dark:text-white' : 'text-text-subtle'}`}>
                               {step.label}
                             </p>
                             {isCurrent && (
                               <p className="text-xs text-primary mt-1">Current status</p>
                             )}
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 )}
                 
                 {selectedOrder.status === 'cancelled' && (
                   <div className="flex items-center gap-3 mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                     <span className="material-symbols-outlined text-red-600">cancel</span>
                     <div>
                       <p className="font-medium text-red-600">Order Cancelled</p>
                       <p className="text-xs text-red-500">This order has been cancelled</p>
                     </div>
                   </div>
                 )}
               </div>

               {/* Order Info */}
               <div>
                 <div className="grid grid-cols-2 gap-4 mb-4">
                   <div>
                     <p className="text-sm text-text-subtle">Order ID</p>
                     <p className="font-bold text-text-main dark:text-white">#{selectedOrder.id.slice(0, 8)}</p>
                   </div>
                   <div>
                     <p className="text-sm text-text-subtle">Order Date</p>
                     <p className="font-medium text-text-main dark:text-white">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                   </div>
                   <div>
                     <p className="text-sm text-text-subtle">Delivery Type</p>
                     <p className="font-medium text-text-main dark:text-white">{selectedOrder.delivery_type}</p>
                   </div>
                   <div>
                     <p className="text-sm text-text-subtle">Payment Status</p>
                     <p className="font-medium text-green-600">Paid</p>
                   </div>
                 </div>
               </div>

               {/* Order Items */}
               <div className="border-t border-border-light dark:border-border-dark pt-4">
                 <p className="text-sm font-bold text-text-main dark:text-white mb-3">Order Items</p>
                 <div className="space-y-3">
                   {selectedOrder.order_items?.map((item: any, index: number) => (
                     <div key={index} className="flex gap-3 p-3 bg-surface-light dark:bg-surface-dark rounded-xl">
                       <div className="h-16 w-16 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0">
                         {item.products?.image_url ? (
                           <img src={item.products.image_url} alt={item.products?.name} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center">
                             <span className="material-symbols-outlined text-gray-400">potted_plant</span>
                           </div>
                         )}
                       </div>
                       <div className="flex-1">
                         <p className="font-medium text-text-main dark:text-white">{item.products?.name || 'Product'}</p>
                         <p className="text-xs text-text-subtle">{item.products?.category}</p>
                         <div className="flex justify-between items-center mt-1">
                           <p className="text-sm text-text-subtle">Qty: {item.quantity}</p>
                           <p className="font-bold text-primary">${parseFloat(item.subtotal).toFixed(2)}</p>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>

               {/* Price Summary */}
               <div className="border-t border-border-light dark:border-border-dark pt-4 space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="text-text-subtle">Subtotal</span>
                   <span className="font-medium text-text-main dark:text-white">${parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-text-subtle">Delivery Fee</span>
                   <span className="font-medium text-text-main dark:text-white">${parseFloat(selectedOrder.delivery_fee || 0).toFixed(2)}</span>
                 </div>
                 {selectedOrder.discount > 0 && (
                   <div className="flex justify-between text-sm">
                     <span className="text-text-subtle">Discount</span>
                     <span className="font-medium text-green-600">-${parseFloat(selectedOrder.discount).toFixed(2)}</span>
                   </div>
                 )}
                 <div className="flex justify-between text-lg font-bold border-t border-border-light dark:border-border-dark pt-2">
                   <span className="text-text-main dark:text-white">Total</span>
                   <span className="text-primary">${parseFloat(selectedOrder.total || selectedOrder.total_amount).toFixed(2)}</span>
                 </div>
               </div>

               {/* Action Buttons */}
               <div className="border-t border-border-light dark:border-border-dark pt-4 space-y-3">
                 {(selectedOrder.status === 'pending' || selectedOrder.status === 'confirmed') && (
                   <button 
                     onClick={() => handleCancelOrder(selectedOrder.id)}
                     disabled={cancelLoading}
                     className="w-full px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl border border-red-100 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                   >
                     {cancelLoading ? (
                       <>
                         <span className="h-5 w-5 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin"></span>
                         Cancelling...
                       </>
                     ) : (
                       <>
                         <span className="material-symbols-outlined text-lg">cancel</span>
                         Cancel Order
                       </>
                     )}
                   </button>
                 )}
                 
                 {selectedOrder.status === 'delivered' && selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                   <div className="space-y-2">
                     <p className="text-sm font-medium text-text-subtle">Review Products</p>
                     {selectedOrder.order_items.map((item: any, index: number) => (
                       <button 
                         key={index}
                         onClick={() => {
                           setReviewProduct({
                             id: item.product_id,
                             name: item.products?.name || 'Product'
                           });
                         }}
                         className="w-full px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                       >
                         <span className="material-symbols-outlined text-lg">rate_review</span>
                         Review {item.products?.name || 'Product'}
                       </button>
                     ))}
                   </div>
                 )}
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Review Modal */}
       {reviewProduct && (
         <ReviewModal
           productId={reviewProduct.id}
           productName={reviewProduct.name}
           onClose={() => setReviewProduct(null)}
           onSubmit={handleSubmitReview}
         />
       )}
    </div>
  );
};

export default OrderTracking;