import React from 'react';
import { View } from '@/types/types';

interface OrderTrackingProps {
  navigate: (view: View) => void;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
       <header className="flex items-center p-4 sticky top-0 z-10">
           <button onClick={() => navigate('consumer-home')} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
               <span className="material-symbols-outlined text-text-main dark:text-white">arrow_back_ios_new</span>
           </button>
           <h1 className="flex-1 text-center font-bold text-lg text-text-main dark:text-white pr-10">Order Tracking</h1>
       </header>

       <main className="flex-1 p-4 pb-24">
           {/* Map Preview */}
           <div className="w-full aspect-video rounded-2xl bg-gray-200 dark:bg-gray-800 mb-6 overflow-hidden relative">
                <img src="https://media.wired.com/photos/59269cd37034dc5f91bec0f1/191:100/w_1280,c_limit/GoogleMapTA.jpg" className="w-full h-full object-cover opacity-80 grayscale" alt="Map" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white dark:bg-surface-dark p-3 rounded-xl shadow-lg flex items-center gap-3">
                         <img src="https://randomuser.me/api/portraits/men/85.jpg" className="h-10 w-10 rounded-full" alt="Driver" />
                         <div>
                             <p className="font-bold text-sm text-text-main dark:text-white">Leo M.</p>
                             <p className="text-xs text-text-subtle">Arriving in 15 mins</p>
                         </div>
                         <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                             <span className="material-symbols-outlined text-sm">call</span>
                         </div>
                    </div>
                </div>
           </div>

           {/* Status */}
           <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-border-light dark:border-border-dark mb-6">
               <div className="flex justify-between items-center mb-6">
                   <div>
                       <h2 className="font-bold text-lg text-text-main dark:text-white">Order #AC-2938</h2>
                       <p className="text-sm text-text-subtle">3 Items • $12.47</p>
                   </div>
                   <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">On The Way</span>
               </div>

               {/* Timeline */}
               <div className="relative pl-4 border-l-2 border-border-light dark:border-border-dark space-y-8">
                   <div className="relative">
                       <div className="absolute -left-[21px] top-0 h-4 w-4 rounded-full bg-primary ring-4 ring-white dark:ring-surface-dark"></div>
                       <p className="font-bold text-text-main dark:text-white text-sm leading-none">Order Placed</p>
                       <p className="text-xs text-text-subtle mt-1">10:30 AM</p>
                   </div>
                   <div className="relative">
                       <div className="absolute -left-[21px] top-0 h-4 w-4 rounded-full bg-primary ring-4 ring-white dark:ring-surface-dark"></div>
                       <p className="font-bold text-text-main dark:text-white text-sm leading-none">Order Confirmed</p>
                       <p className="text-xs text-text-subtle mt-1">10:35 AM</p>
                   </div>
                   <div className="relative">
                       <div className="absolute -left-[23px] top-[-2px] h-5 w-5 rounded-full bg-primary flex items-center justify-center text-white ring-4 ring-white dark:ring-surface-dark shadow-lg shadow-primary/40 animate-pulse">
                           <span className="material-symbols-outlined text-[12px]">local_shipping</span>
                       </div>
                       <p className="font-bold text-text-main dark:text-white text-sm leading-none text-primary">Out for Delivery</p>
                       <p className="text-xs text-text-subtle mt-1">11:15 AM</p>
                   </div>
                    <div className="relative opacity-50">
                       <div className="absolute -left-[21px] top-0 h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-600 ring-4 ring-white dark:ring-surface-dark"></div>
                       <p className="font-bold text-text-main dark:text-white text-sm leading-none">Delivered</p>
                       <p className="text-xs text-text-subtle mt-1">Est. 11:30 AM</p>
                   </div>
               </div>
           </div>
       </main>
       
       <footer className="p-4 bg-background-light dark:bg-background-dark sticky bottom-0">
           <button className="w-full h-14 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl font-bold text-text-main dark:text-white shadow-sm flex items-center justify-center gap-2">
               <span className="material-symbols-outlined">qr_code_scanner</span>
               View Order QR
           </button>
       </footer>
    </div>
  );
};

export default OrderTracking;