import React, { useState, useEffect } from 'react';
import { productService } from '@/services/productService';
import { bulkOrderService, BulkOrderItem } from '@/services/bulkOrderService';
import { Product } from '@/types/types';
import Toast from '@/components/Toast';

interface BulkOrderProps {
  navigate: (path: string) => void;
}

const BulkOrder: React.FC<BulkOrderProps> = ({ navigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<BulkOrderItem[]>([]);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<'Restaurant' | 'Hotel' | 'Caterer'>('Restaurant');
  const [businessLocation, setBusinessLocation] = useState('');
  const [budgetMax, setBudgetMax] = useState(2500);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productService.getAllProducts();
      if (response.success && response.data.items) {
        setProducts(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    const existing = selectedItems.find(item => item.product_id === product.id);
    if (existing) {
      setSelectedItems(selectedItems.filter(item => item.product_id !== product.id));
    } else {
      setSelectedItems([...selectedItems, {
        product_id: product.id,
        product_name: product.name,
        quantity: 10,
        unit: product.unit,
        frequency: 'Weekly',
        price_per_unit: product.price
      }]);
    }
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    setSelectedItems(selectedItems.map(item =>
      item.product_id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const updateItemFrequency = (productId: string, frequency: 'Daily' | 'Weekly' | 'One-time') => {
    setSelectedItems(selectedItems.map(item =>
      item.product_id === productId ? { ...item, frequency } : item
    ));
  };

  const removeItem = (productId: string) => {
    setSelectedItems(selectedItems.filter(item => item.product_id !== productId));
  };

  const calculateEstimatedTotal = () => {
    return selectedItems.reduce((total, item) => {
      const basePrice = (item.price_per_unit || 0) * item.quantity;
      const multiplier = item.frequency === 'Daily' ? 30 : item.frequency === 'Weekly' ? 4 : 1;
      return total + (basePrice * multiplier);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!businessName || !businessLocation || selectedItems.length === 0) {
      setToastMessage('Please fill all required fields and select at least one product');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setIsLoading(true);
    try {
      const estimatedTotal = calculateEstimatedTotal();
      const response = await bulkOrderService.createBulkOrder({
        business_name: businessName,
        business_type: businessType,
        business_location: businessLocation,
        items: selectedItems,
        budget_min: estimatedTotal * 0.8,
        budget_max: Math.max(budgetMax, estimatedTotal * 1.2)
      });

      if (response.success) {
        setToastMessage('Bulk order request sent successfully! Farmers will respond soon.');
        setToastType('success');
        setShowToast(true);
        setTimeout(() => navigate('/home'), 2000);
      } else {
        setToastMessage(response.message || 'Failed to create bulk order');
        setToastType('error');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Failed to create bulk order:', error);
      setToastMessage('Failed to send bulk order request');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedTotal = calculateEstimatedTotal();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
       <header className="flex items-center p-4 sticky top-0 z-10 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md">
           <button onClick={() => navigate('/home')} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
               <span className="material-symbols-outlined text-text-main dark:text-white">arrow_back</span>
           </button>
           <h1 className="flex-1 text-center font-bold text-lg text-text-main dark:text-white pr-10">Bulk Order Request</h1>
       </header>

       <main className="flex-1 p-4 pb-32 space-y-8">
           <section>
               <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">Business Details</h2>
               <div className="space-y-4">
                   <div className="relative">
                       <span className="absolute left-4 top-4 material-symbols-outlined text-text-subtle">storefront</span>
                       <input 
                         type="text" 
                         placeholder="Business Name" 
                         value={businessName}
                         onChange={(e) => setBusinessName(e.target.value)}
                         className="w-full h-14 pl-12 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark focus:ring-primary focus:border-primary dark:text-white" 
                       />
                   </div>
                   <div className="relative">
                       <span className="absolute left-4 top-4 material-symbols-outlined text-text-subtle">category</span>
                       <select 
                         value={businessType}
                         onChange={(e) => setBusinessType(e.target.value as any)}
                         className="w-full h-14 pl-12 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark focus:ring-primary focus:border-primary dark:text-white appearance-none"
                       >
                           <option>Restaurant</option>
                           <option>Hotel</option>
                           <option>Caterer</option>
                       </select>
                   </div>
                   <div className="relative">
                       <span className="absolute left-4 top-4 material-symbols-outlined text-text-subtle">location_on</span>
                       <input 
                         type="text" 
                         placeholder="Business Location" 
                         value={businessLocation}
                         onChange={(e) => setBusinessLocation(e.target.value)}
                         className="w-full h-14 pl-12 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark focus:ring-primary focus:border-primary dark:text-white" 
                       />
                   </div>
               </div>
           </section>

           <section>
               <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">Select Products ({selectedItems.length})</h2>
               {isLoadingProducts ? (
                 <div className="grid grid-cols-2 gap-4">
                   {[...Array(4)].map((_, i) => (
                     <div key={i} className="h-40 bg-surface-light dark:bg-surface-dark rounded-xl animate-pulse"></div>
                   ))}
                 </div>
               ) : (
                 <div className="grid grid-cols-2 gap-4">
                   {products.map((product) => {
                     const isSelected = selectedItems.some(item => item.product_id === product.id);
                     return (
                       <button
                         key={product.id}
                         onClick={() => handleProductSelect(product)}
                         className={`relative p-3 rounded-xl border-2 transition-all text-left ${
                           isSelected 
                             ? 'border-primary bg-primary/10' 
                             : 'border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:border-primary/50'
                         }`}
                       >
                         {isSelected && (
                           <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                             <span className="material-symbols-outlined text-white text-sm">check</span>
                           </div>
                         )}
                         <img 
                           src={product.image_url || product.image} 
                           alt={product.name}
                           className="w-full h-20 object-cover rounded-lg mb-2"
                         />
                         <p className="font-bold text-sm text-text-main dark:text-white truncate">{product.name}</p>
                         <p className="text-xs text-primary font-bold">${product.price}/{product.unit}</p>
                         {product.stock_quantity !== undefined && (
                           <p className={`text-[10px] ${product.stock_quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                             {product.stock_quantity > 0 ? `${product.stock_quantity} available` : 'Out of stock'}
                           </p>
                         )}
                       </button>
                     );
                   })}
                 </div>
               )}
           </section>

           {selectedItems.length > 0 && (
             <section>
               <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">Order Details</h2>
               <div className="space-y-3">
                 {selectedItems.map((item) => (
                   <div key={item.product_id} className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark">
                     <div className="flex items-center justify-between mb-3">
                       <p className="font-bold text-text-main dark:text-white">{item.product_name}</p>
                       <button onClick={() => removeItem(item.product_id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full p-1">
                         <span className="material-symbols-outlined text-lg">close</span>
                       </button>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                       <div>
                         <p className="text-xs font-bold mb-1 ml-1 text-text-subtle">Quantity ({item.unit})</p>
                         <div className="flex h-10 border border-border-light dark:border-border-dark rounded-lg overflow-hidden bg-background-light dark:bg-background-dark">
                           <button 
                             onClick={() => updateItemQuantity(item.product_id, item.quantity - 5)}
                             className="px-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-text-main dark:text-white"
                           >
                             -
                           </button>
                           <input 
                             type="number" 
                             value={item.quantity}
                             onChange={(e) => updateItemQuantity(item.product_id, parseInt(e.target.value) || 1)}
                             className="w-full text-center border-none bg-transparent h-full focus:ring-0 text-text-main dark:text-white" 
                           />
                           <button 
                             onClick={() => updateItemQuantity(item.product_id, item.quantity + 5)}
                             className="px-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-text-main dark:text-white"
                           >
                             +
                           </button>
                         </div>
                       </div>
                       <div>
                         <p className="text-xs font-bold mb-1 ml-1 text-text-subtle">Frequency</p>
                         <select 
                           value={item.frequency}
                           onChange={(e) => updateItemFrequency(item.product_id, e.target.value as any)}
                           className="w-full h-10 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary text-text-main dark:text-white text-sm px-2"
                         >
                           <option>Weekly</option>
                           <option>Daily</option>
                           <option>One-time</option>
                         </select>
                       </div>
                     </div>
                     <div className="mt-2 text-xs text-text-subtle">
                       Est. {item.frequency === 'Daily' ? 'Monthly' : item.frequency === 'Weekly' ? 'Monthly' : 'Total'}: 
                       <span className="font-bold text-primary ml-1">
                         ${((item.price_per_unit || 0) * item.quantity * (item.frequency === 'Daily' ? 30 : item.frequency === 'Weekly' ? 4 : 1)).toFixed(2)}
                       </span>
                     </div>
                   </div>
                 ))}
               </div>
             </section>
           )}

           <section>
               <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">Budget Range</h2>
               <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark">
                 <div className="flex justify-between mb-2">
                   <span className="text-sm text-text-subtle">Estimated Total</span>
                   <span className="font-bold text-primary text-lg">${estimatedTotal.toFixed(2)}/month</span>
                 </div>
                 <div className="flex justify-between mb-2 font-bold text-text-main dark:text-white text-sm">
                   <span>Min: ${(estimatedTotal * 0.8).toFixed(0)}</span>
                   <span>Max: ${budgetMax}</span>
                 </div>
                 <input 
                   type="range" 
                   min={Math.max(500, estimatedTotal * 1.1)} 
                   max="10000" 
                   step="100"
                   value={budgetMax}
                   onChange={(e) => setBudgetMax(parseInt(e.target.value))}
                   className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" 
                 />
                 <p className="text-xs text-text-subtle mt-2">Adjust maximum budget for farmer quotes</p>
               </div>
           </section>
       </main>

       <footer className="p-4 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md border-t border-border-light dark:border-border-dark fixed bottom-0 left-0 right-0 z-20">
           <button 
             onClick={handleSubmit}
             disabled={isLoading || selectedItems.length === 0 || !businessName || !businessLocation}
             className="w-full bg-primary text-white h-14 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
           >
             {isLoading ? (
               <>
                 <span className="material-symbols-outlined animate-spin">progress_activity</span>
                 Sending...
               </>
             ) : (
               <>
                 <span className="material-symbols-outlined">send</span>
                 Send Request to Farmers
               </>
             )}
           </button>
           {selectedItems.length > 0 && (
             <p className="text-center text-xs text-text-subtle mt-2">
               {selectedItems.length} product{selectedItems.length !== 1 ? 's' : ''} selected • Est. ${estimatedTotal.toFixed(2)}/month
             </p>
           )}
       </footer>

       {showToast && (
         <Toast
           message={toastMessage}
           type={toastType}
           onClose={() => setShowToast(false)}
         />
       )}
    </div>
  );
};

export default BulkOrder;