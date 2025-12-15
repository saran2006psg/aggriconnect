import React from 'react';
import { View } from '../types';

interface AddProductProps {
  navigate: (view: View) => void;
}

const AddProduct: React.FC<AddProductProps> = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
       <header className="flex items-center p-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark sticky top-0 z-10">
           <button onClick={() => navigate('farmer-dashboard')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
               <span className="material-symbols-outlined text-text-main dark:text-white">arrow_back_ios_new</span>
           </button>
           <h1 className="flex-1 text-center font-bold text-lg text-text-main dark:text-white pr-10">Add Product</h1>
       </header>

       <main className="flex-1 p-4 pb-24">
           {/* Image Upload */}
           <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex flex-col items-center justify-center text-text-subtle mb-6 cursor-pointer hover:border-primary transition-colors">
               <span className="material-symbols-outlined text-4xl mb-2">add_a_photo</span>
               <span className="font-medium">Upload Product Photo</span>
           </div>

           <div className="space-y-4">
               <label className="block">
                   <span className="text-sm font-medium text-text-main dark:text-white mb-1 block">Product Name</span>
                   <input type="text" placeholder="e.g. Organic Tomatoes" className="w-full rounded-xl border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white" />
               </label>

               <label className="block">
                   <span className="text-sm font-medium text-text-main dark:text-white mb-1 block">Category</span>
                   <select className="w-full rounded-xl border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white">
                       <option>Vegetables</option>
                       <option>Fruits</option>
                       <option>Herbs</option>
                       <option>Dairy</option>
                   </select>
               </label>

               <div className="flex gap-4">
                    <label className="block flex-1">
                        <span className="text-sm font-medium text-text-main dark:text-white mb-1 block">Price per unit</span>
                        <input type="number" placeholder="$0.00" className="w-full rounded-xl border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white" />
                    </label>
                    <label className="block flex-1">
                        <span className="text-sm font-medium text-text-main dark:text-white mb-1 block">Stock (kg)</span>
                        <input type="number" placeholder="0" className="w-full rounded-xl border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white" />
                    </label>
               </div>

               <label className="block">
                   <span className="text-sm font-medium text-text-main dark:text-white mb-1 block">Harvest Date</span>
                   <input type="date" className="w-full rounded-xl border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white" />
               </label>

               <div className="flex items-center justify-between p-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
                   <span className="font-medium text-text-main dark:text-white">Available for sale</span>
                   <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                   </label>
               </div>
           </div>
       </main>

       <footer className="p-4 bg-background-light dark:bg-background-dark border-t border-border-light dark:border-border-dark sticky bottom-0">
           <button onClick={() => navigate('farmer-dashboard')} className="w-full bg-primary text-white h-14 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform">
               Save Product
           </button>
       </footer>
    </div>
  );
};

export default AddProduct;