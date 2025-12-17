import React, { useState } from 'react';
import { View } from '@/types/types';
import { productService } from '@/services/productService';

interface AddProductProps {
  navigate: (view: View) => void;
}

const AddProduct: React.FC<AddProductProps> = ({ navigate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    price: '',
    unit: 'kg',
    stock_quantity: '',
    harvest_date: '',
    description: '',
    location: '',
    is_available: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    setError('');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await productService.createProduct({
        name: formData.name,
        category: formData.category as any,
        price: parseFloat(formData.price),
        unit: formData.unit,
        stock_quantity: parseInt(formData.stock_quantity),
        harvest_date: formData.harvest_date || undefined,
        description: formData.description || undefined,
        location: formData.location || undefined,
        is_available: formData.is_available
      });
      
      if (response.success) {
        navigate('farmer-products');
      } else {
        setError(response.message || 'Failed to create product');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail?.[0]?.msg || err.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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

           {error && (
             <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
               {error}
             </div>
           )}

           <div className="space-y-4">
               <label className="block">
                   <span className="text-sm font-medium text-text-main dark:text-white mb-1 block">Product Name</span>
                   <input 
                     type="text" 
                     name="name"
                     value={formData.name}
                     onChange={handleInputChange}
                     required
                     placeholder="e.g. Organic Tomatoes" 
                     className="w-full rounded-xl border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white" 
                   />
               </label>

               <label className="block">
                   <span className="text-sm font-medium text-text-main dark:text-white mb-1 block">Category</span>
                   <select 
                     name="category"
                     value={formData.category}
                     onChange={handleInputChange}
                     className="w-full rounded-xl border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                   >
                       <option>Vegetables</option>
                       <option>Fruits</option>
                       <option>Herbs</option>
                       <option>Dairy</option>
                       <option>Honey</option>
                   </select>
               </label>

               <div className="flex gap-4">
                    <label className="block flex-1">
                        <span className="text-sm font-medium text-text-main dark:text-white mb-1 block">Price per unit</span>
                        <input 
                          type="number" 
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          step="0.01"
                          placeholder="0.00" 
                          className="w-full rounded-xl border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white" 
                        />
                    </label>
                    <label className="block flex-1">
                        <span className="text-sm font-medium text-text-main dark:text-white mb-1 block">Stock (kg)</span>
                        <input 
                          type="number" 
                          name="stock_quantity"
                          value={formData.stock_quantity}
                          onChange={handleInputChange}
                          required
                          placeholder="0" 
                          className="w-full rounded-xl border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white" 
                        />
                    </label>
               </div>

               <label className="block">
                   <span className="text-sm font-medium text-text-main dark:text-white mb-1 block">Harvest Date</span>
                   <input 
                     type="date" 
                     name="harvest_date"
                     value={formData.harvest_date}
                     onChange={handleInputChange}
                     className="w-full rounded-xl border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white" 
                   />
               </label>

               <label className="block">
                   <span className="text-sm font-medium text-text-main dark:text-white mb-1 block">Location</span>
                   <input 
                     type="text" 
                     name="location"
                     value={formData.location}
                     onChange={handleInputChange}
                     placeholder="e.g. California" 
                     className="w-full rounded-xl border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-14 px-4 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white" 
                   />
               </label>

               <label className="block">
                   <span className="text-sm font-medium text-text-main dark:text-white mb-1 block">Description</span>
                   <textarea 
                     name="description"
                     value={formData.description}
                     onChange={handleInputChange}
                     rows={3}
                     placeholder="Product description..." 
                     className="w-full rounded-xl border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white" 
                   />
               </label>

               <div className="flex items-center justify-between p-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
                   <span className="font-medium text-text-main dark:text-white">Available for sale</span>
                   <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="is_available"
                          checked={formData.is_available}
                          onChange={handleInputChange}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                   </label>
               </div>
           </div>
       </main>

       <footer className="p-4 bg-background-light dark:bg-background-dark border-t border-border-light dark:border-border-dark sticky bottom-0">
           <button 
             onClick={handleSubmit} 
             disabled={isLoading || !formData.name || !formData.price || !formData.stock_quantity}
             className="w-full bg-primary text-white h-14 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
           >
               {isLoading ? (
                 <>
                   <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                   Saving...
                 </>
               ) : 'Save Product'}
           </button>
       </footer>
    </div>
  );
};

export default AddProduct;