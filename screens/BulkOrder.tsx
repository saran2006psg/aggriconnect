import React from 'react';
import { View } from '../types';

interface BulkOrderProps {
  navigate: (view: View) => void;
}

const BulkOrder: React.FC<BulkOrderProps> = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
       <header className="flex items-center p-4 sticky top-0 z-10 bg-background-light/90 dark:bg-background-dark/90">
           <button onClick={() => navigate('consumer-home')} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
               <span className="material-symbols-outlined text-text-main dark:text-white">arrow_back</span>
           </button>
           <h1 className="flex-1 text-center font-bold text-lg text-text-main dark:text-white pr-10">Bulk Order</h1>
       </header>

       <main className="flex-1 p-4 pb-24 space-y-8">
           <section>
               <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">Business Details</h2>
               <div className="space-y-4">
                   <div className="relative">
                       <span className="absolute left-4 top-4 material-symbols-outlined text-text-subtle">storefront</span>
                       <input type="text" placeholder="Business Name" className="w-full h-14 pl-12 rounded-xl border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark focus:ring-primary focus:border-primary dark:text-white" />
                   </div>
                   <div className="relative">
                       <span className="absolute left-4 top-4 material-symbols-outlined text-text-subtle">category</span>
                       <select className="w-full h-14 pl-12 rounded-xl border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark focus:ring-primary focus:border-primary dark:text-white appearance-none">
                           <option>Restaurant</option>
                           <option>Hotel</option>
                           <option>Caterer</option>
                       </select>
                   </div>
                   <div className="relative">
                       <span className="absolute left-4 top-4 material-symbols-outlined text-text-subtle">location_on</span>
                       <input type="text" placeholder="Business Location" className="w-full h-14 pl-12 rounded-xl border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark focus:ring-primary focus:border-primary dark:text-white" />
                   </div>
               </div>
           </section>

           <section>
               <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">Requirements</h2>
               <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark space-y-4">
                   <div className="flex items-center gap-2">
                       <input type="text" placeholder="Product Name (e.g. Tomatoes)" className="flex-1 h-12 rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-4 focus:ring-primary focus:border-primary" />
                       <button className="h-8 w-8 text-text-subtle hover:text-red-500"><span className="material-symbols-outlined">close</span></button>
                   </div>
                   <div className="flex gap-4">
                       <div className="flex-1">
                           <p className="text-xs font-bold mb-1 ml-1 text-text-subtle">Quantity (kg)</p>
                           <div className="flex h-12 border border-border-light dark:border-border-dark rounded-lg overflow-hidden">
                               <button className="px-3 hover:bg-gray-100 dark:hover:bg-gray-800">-</button>
                               <input type="text" defaultValue="50" className="w-full text-center border-none bg-transparent h-full focus:ring-0" />
                               <button className="px-3 hover:bg-gray-100 dark:hover:bg-gray-800">+</button>
                           </div>
                       </div>
                       <div className="flex-1">
                            <p className="text-xs font-bold mb-1 ml-1 text-text-subtle">Frequency</p>
                            <select className="w-full h-12 rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary">
                                <option>Weekly</option>
                                <option>Daily</option>
                                <option>One-time</option>
                            </select>
                       </div>
                   </div>
                   <button className="w-full py-3 border-2 border-dashed border-primary/30 text-primary font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-primary/5">
                       <span className="material-symbols-outlined">add_circle</span>
                       Add Product
                   </button>
               </div>
           </section>

           <section>
               <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">Budget Range</h2>
               <div className="px-2">
                   <div className="flex justify-between mb-2 font-bold text-primary">
                       <span>$500</span>
                       <span>$2,500</span>
                   </div>
                   <input type="range" min="100" max="5000" className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
               </div>
           </section>
       </main>

       <footer className="p-4 bg-background-light dark:bg-background-dark border-t border-border-light dark:border-border-dark sticky bottom-0">
           <button onClick={() => navigate('consumer-home')} className="w-full bg-primary text-white h-14 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform">
               Send Request to Farmers
           </button>
       </footer>
    </div>
  );
};

export default BulkOrder;