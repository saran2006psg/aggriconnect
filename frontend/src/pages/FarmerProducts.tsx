import React, { useState, useEffect } from 'react';
import { View, Product } from '@/types/types';
import { productService } from '@/services/productService';
import { authService } from '@/services/authService';

interface FarmerProductsProps {
  navigate: (view: View) => void;
  products: Product[];
}

const FarmerProducts: React.FC<FarmerProductsProps> = ({ navigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const user = authService.getCurrentUserFromStorage();
      const response = await productService.getAllProducts({
        farmerId: user?.id
      });
      if (response.success) {
        setProducts(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product');
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
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col pb-24">
       <header className="flex items-center p-4 sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
           <button onClick={() => navigate('farmer-dashboard')} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
               <span className="material-symbols-outlined text-text-main dark:text-white">arrow_back_ios_new</span>
           </button>
           <h1 className="flex-1 text-center font-bold text-lg text-text-main dark:text-white pr-2">My Inventory</h1>
           <button onClick={() => navigate('add-product')} className="p-2 rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-colors">
               <span className="material-symbols-outlined text-xl">add</span>
           </button>
       </header>

       <main className="flex-1 p-4">
           <div className="grid grid-cols-1 gap-4">
               {products.map((product) => (
                   <div key={product.id} className="flex gap-4 p-3 bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
                       <div className="h-24 w-24 rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0 relative">
                           <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                           <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-1 backdrop-blur-sm">
                               In Stock
                           </div>
                       </div>
                       <div className="flex-1 flex flex-col">
                           <div className="flex justify-between items-start">
                               <h3 className="font-bold text-text-main dark:text-white line-clamp-1">{product.name}</h3>
                               <button className="text-text-subtle hover:text-primary">
                                   <span className="material-symbols-outlined text-lg">more_vert</span>
                               </button>
                           </div>
                           <p className="text-sm text-text-subtle mb-auto">{product.category}</p>
                           
                           <div className="flex items-center justify-between mt-2">
                               <p className="font-bold text-primary">${product.price.toFixed(2)} <span className="text-xs font-normal text-text-subtle">/ {product.unit}</span></p>
                               <div className="flex gap-2">
                                   <button className="h-8 w-8 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark flex items-center justify-center text-text-subtle hover:text-primary transition-colors">
                                       <span className="material-symbols-outlined text-lg">edit</span>
                                   </button>
                                   <button 
                                     onClick={() => handleDelete(product.id)} 
                                     className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center justify-center text-red-500 hover:text-red-600 transition-colors"
                                   >
                                       <span className="material-symbols-outlined text-lg">delete</span>
                                   </button>
                               </div>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
           
           {/* Empty State visual helper if needed, currently showing sample products */}
           {products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                    <span className="material-symbols-outlined text-5xl mb-2">inventory_2</span>
                    <p>No products added yet.</p>
                </div>
           )}
       </main>
    </div>
  );
};

export default FarmerProducts;