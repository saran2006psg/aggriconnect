import React, { useState } from 'react';
import { View } from '../types';

interface FarmerOrdersProps {
  navigate: (view: View) => void;
}

const FarmerOrders: React.FC<FarmerOrdersProps> = ({ navigate }) => {
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed' | 'Cancelled'>('All');

  const orders = [
      { id: 'ORD-001', customer: 'Jane Doe', items: '3 items', total: 24.50, status: 'Pending', time: '10:30 AM', type: 'Pickup' },
      { id: 'ORD-002', customer: 'Mike Ross', items: '1 item', total: 12.00, status: 'Completed', time: '09:15 AM', type: 'Delivery' },
      { id: 'ORD-003', customer: 'Rachel Zane', items: '5 items', total: 45.20, status: 'Pending', time: 'Yesterday', type: 'Delivery' },
      { id: 'ORD-004', customer: 'Harvey S.', items: 'Bulk Order', total: 150.00, status: 'Completed', time: 'Yesterday', type: 'Pickup' },
      { id: 'ORD-005', customer: 'Louis Litt', items: '2 items', total: 18.50, status: 'Cancelled', time: 'Oct 20', type: 'Delivery' },
  ];

  const filteredOrders = orders.filter(o => filter === 'All' || o.status === filter);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

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
                {['All', 'Pending', 'Completed', 'Cancelled'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setFilter(tab as any)}
                        className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${filter === tab ? 'bg-primary text-white shadow-md' : 'text-text-subtle hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        {tab}
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
                   filteredOrders.map((order, idx) => (
                       <div key={idx} className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 border border-border-light dark:border-border-dark shadow-sm">
                           <div className="flex justify-between items-start mb-3">
                               <div className="flex items-center gap-3">
                                   <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                       <img src={`https://randomuser.me/api/portraits/thumb/men/${(idx % 50) + 10}.jpg`} alt="User" className="w-full h-full object-cover" />
                                   </div>
                                   <div>
                                       <p className="font-bold text-text-main dark:text-white">{order.customer}</p>
                                       <p className="text-xs text-text-subtle">{order.id} • {order.time}</p>
                                   </div>
                               </div>
                               <span className={`px-2 py-1 rounded-md text-xs font-bold ${getStatusStyle(order.status)}`}>
                                   {order.status}
                               </span>
                           </div>
                           
                           <div className="flex justify-between items-center py-2 border-t border-b border-border-light dark:border-border-dark my-2 border-dashed">
                               <span className="text-sm font-medium text-text-main dark:text-white">{order.items}</span>
                               <span className="text-sm font-bold text-text-main dark:text-white">${order.total.toFixed(2)}</span>
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