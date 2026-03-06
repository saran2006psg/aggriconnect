import React, { useState, useEffect } from 'react';
import { Product } from '@/types/types';
import { productService } from '@/services/productService';
import { authService } from '@/services/authService';

interface FarmerProductsProps {
  navigate: (path: string) => void;
  products: Product[];
}

const FarmerProducts: React.FC<FarmerProductsProps> = ({ navigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    price: '',
    unit: '',
    stock_quantity: '',
    description: '',
    location: '',
    harvest_date: '',
    is_available: true
  });

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
        // Transform backend response to match frontend expectations
        const transformedProducts = response.data.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          unit: item.unit,
          stock_quantity: item.stock_quantity,
          image: item.image_url || item.image || '/placeholder-product.jpg',
          description: item.description,
          location: item.farm_location || item.location,
          harvest_date: item.harvest_date,
          is_available: item.is_available,
          farmer: item.farmer,
          rating: item.rating || 0,
          reviews: item.reviews || 0
        }));
        setProducts(transformedProducts);
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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      unit: product.unit,
      stock_quantity: product.stock_quantity?.toString() || '0',
      description: product.description || '',
      location: product.location || '',
      harvest_date: product.harvest_date || '',
      is_available: product.is_available !== false
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;
    
    setIsLoading(true);
    try {
      const response = await productService.updateProduct(editingProduct.id, {
        name: editForm.name,
        category: editForm.category as any,
        price: parseFloat(editForm.price),
        unit: editForm.unit,
        stock_quantity: parseInt(editForm.stock_quantity),
        description: editForm.description || undefined,
        location: editForm.location || undefined,
        harvest_date: editForm.harvest_date || undefined,
        is_available: editForm.is_available
      });
      
      if (response.success) {
        await loadProducts();
        setEditingProduct(null);
      } else {
        alert('Failed to update product');
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product');
    } finally {
      setIsLoading(false);
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
           <button onClick={() => navigate('/farmer-dashboard')} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
               <span className="material-symbols-outlined text-text-main dark:text-white">arrow_back_ios_new</span>
           </button>
           <h1 className="flex-1 text-center font-bold text-lg text-text-main dark:text-white pr-2">My Inventory</h1>
           <button onClick={() => navigate('/add-product')} className="p-2 rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-colors">
               <span className="material-symbols-outlined text-xl">add</span>
           </button>
       </header>

       <main className="flex-1 p-4">
           <div className="grid grid-cols-1 gap-4">
               {products.map((product) => {
                   const isOutOfStock = !product.stock_quantity || product.stock_quantity === 0;
                   const isLowStock = product.stock_quantity && product.stock_quantity > 0 && product.stock_quantity <= 5;
                   
                   return (
                   <div key={product.id} className={`flex gap-4 p-3 bg-surface-light dark:bg-surface-dark rounded-2xl border-2 shadow-sm transition-all ${
                     isOutOfStock ? 'border-red-200 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10' : 
                     isLowStock ? 'border-yellow-200 dark:border-yellow-900/30 bg-yellow-50/30 dark:bg-yellow-900/10' : 
                     'border-border-light dark:border-border-dark'
                   }`}>
                       <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 overflow-hidden shrink-0 relative flex items-center justify-center">
                           {product.image && product.image !== '/placeholder-product.jpg' ? (
                             <img 
                               src={product.image} 
                               onError={(e) => {
                                 e.currentTarget.style.display = 'none';
                               }}
                               className={`w-full h-full object-cover absolute inset-0 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
                               alt={product.name} 
                             />
                           ) : (
                             <span className={`material-symbols-outlined text-4xl text-green-600 dark:text-green-300 ${isOutOfStock ? 'opacity-40' : ''}`}>
                               potted_plant
                             </span>
                           )}
                           <div className={`absolute bottom-0 left-0 right-0 text-white text-[10px] font-bold text-center py-1 backdrop-blur-sm z-10 ${
                             isOutOfStock ? 'bg-red-500' : 
                             isLowStock ? 'bg-yellow-500' : 
                             'bg-green-500/80'
                           }`}>
                               {isOutOfStock ? '❌ OUT OF STOCK' : isLowStock ? `⚠️ LOW (${product.stock_quantity})` : `✅ ${product.stock_quantity} in stock`}
                           </div>
                       </div>
                       <div className="flex-1 flex flex-col">
                           <div className="flex justify-between items-start">
                               <div className="flex-1">
                                 <h3 className={`font-bold line-clamp-1 ${isOutOfStock ? 'text-red-600 dark:text-red-400' : 'text-text-main dark:text-white'}`}>
                                   {product.name}
                                 </h3>
                                 {isOutOfStock && (
                                   <span className="text-[10px] font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full inline-block mt-1">
                                     HIDDEN FROM CUSTOMERS
                                   </span>
                                 )}
                               </div>
                               <button className="text-text-subtle hover:text-primary ml-2">
                                   <span className="material-symbols-outlined text-lg">more_vert</span>
                               </button>
                           </div>
                           <p className="text-sm text-text-subtle mb-auto">{product.category}</p>
                           
                           <div className="flex items-center justify-between mt-2">
                               <p className="font-bold text-primary">${product.price.toFixed(2)} <span className="text-xs font-normal text-text-subtle">/ {product.unit}</span></p>
                               <div className="flex gap-2">
                                   {isOutOfStock && (
                                     <button 
                                       onClick={() => handleEdit(product)}
                                       className="h-8 px-3 rounded-lg bg-green-500 text-white font-semibold text-xs hover:bg-green-600 transition-colors flex items-center gap-1"
                                     >
                                       <span className="material-symbols-outlined text-sm">add</span>
                                       Restock
                                     </button>
                                   )}
                                   <button 
                                     onClick={() => handleEdit(product)}
                                     className="h-8 w-8 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark flex items-center justify-center text-text-subtle hover:text-primary transition-colors"
                                   >
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
               )}
           )}
           </div>
           
           {/* Empty State visual helper if needed, currently showing sample products */}
           {products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                    <span className="material-symbols-outlined text-5xl mb-2">inventory_2</span>
                    <p>No products added yet.</p>
                </div>
           )}
       </main>

       {/* Edit Modal */}
       {editingProduct && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
           <div className="bg-background-light dark:bg-background-dark rounded-t-3xl md:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div className="sticky top-0 bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark p-4 flex items-center justify-between">
               <h2 className="text-xl font-bold text-text-main dark:text-white">Edit Product</h2>
               <button onClick={() => setEditingProduct(null)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                 <span className="material-symbols-outlined">close</span>
               </button>
             </div>

             <div className="p-6 space-y-4">
               <label className="block">
                 <span className="text-sm font-medium text-text-main dark:text-white mb-1 block">Product Name</span>
                 <input
                   type="text"
                   name="name"
                   value={editForm.name}
                   onChange={handleEditChange}
                   className="w-full rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-12 px-4 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                 />
               </label>

               <label className="block">
                 <span className="text-sm font-medium text-text-main dark:text-white mb-1 block">Category</span>
                 <select
                   name="category"
                   value={editForm.category}
                   onChange={handleEditChange}
                   className="w-full rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-12 px-4 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                 >
                   <option value="Vegetables">Vegetables</option>
                   <option value="Fruits">Fruits</option>
                   <option value="Grains">Grains</option>
                   <option value="Dairy">Dairy</option>
                   <option value="Herbs">Herbs</option>
                   <option value="Other">Other</option>
                 </select>
               </label>

               <div className="grid grid-cols-2 gap-4">
                 <label className="block">
                   <span className="text-sm font-medium text-text-main dark:text-white mb-1 block">Price</span>
                   <input
                     type="number"
                     name="price"
                     value={editForm.price}
                     onChange={handleEditChange}
                     step="0.01"
                     className="w-full rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-12 px-4 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                   />
                 </label>

                 <label className="block">
                   <span className="text-sm font-medium text-text-main dark:text-white mb-1 block">Unit</span>
                   <select
                     name="unit"
                     value={editForm.unit}
                     onChange={handleEditChange}
                     className="w-full rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-12 px-4 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                   >
                     <option value="kg">kg</option>
                     <option value="g">g</option>
                     <option value="lb">lb</option>
                     <option value="piece">piece</option>
                     <option value="dozen">dozen</option>
                     <option value="bunch">bunch</option>
                   </select>
                 </label>
               </div>

               <label className="block">
                 <div className="flex items-center justify-between mb-1">
                   <span className="text-sm font-medium text-text-main dark:text-white">Stock Quantity</span>
                   {parseInt(editForm.stock_quantity) === 0 && (
                     <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                       OUT OF STOCK
                     </span>
                   )}
                   {parseInt(editForm.stock_quantity) > 0 && parseInt(editForm.stock_quantity) <= 5 && (
                     <span className="text-xs font-bold text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                       LOW STOCK
                     </span>
                   )}
                 </div>
                 <div className="flex gap-2">
                   <input
                     type="number"
                     name="stock_quantity"
                     value={editForm.stock_quantity}
                     onChange={(e) => {
                       handleEditChange(e);
                       // Auto-enable availability when restocking
                       if (parseInt(e.target.value) > 0) {
                         setEditForm(prev => ({ ...prev, is_available: true }));
                       }
                     }}
                     className="flex-1 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-12 px-4 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                   />
                   <button
                     type="button"
                     onClick={() => {
                       const newQty = parseInt(editForm.stock_quantity) + 10;
                       setEditForm(prev => ({ ...prev, stock_quantity: newQty.toString(), is_available: true }));
                     }}
                     className="h-12 px-4 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors whitespace-nowrap flex items-center gap-1"
                   >
                     <span className="material-symbols-outlined text-lg">add</span>
                     +10
                   </button>
                   <button
                     type="button"
                     onClick={() => {
                       const newQty = parseInt(editForm.stock_quantity) + 50;
                       setEditForm(prev => ({ ...prev, stock_quantity: newQty.toString(), is_available: true }));
                     }}
                     className="h-12 px-4 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors whitespace-nowrap flex items-center gap-1"
                   >
                     <span className="material-symbols-outlined text-lg">add</span>
                     +50
                   </button>
                 </div>
                 {parseInt(editForm.stock_quantity) === 0 && (
                   <p className="text-xs text-red-500 mt-1">⚠️ Product will be marked as OUT OF STOCK and hidden from customers</p>
                 )}
                 {parseInt(editForm.stock_quantity) > 0 && (
                   <p className="text-xs text-green-600 mt-1">✅ Product will be AVAILABLE for sale</p>
                 )}
               </label>

               <label className="block">
                 <span className="text-sm font-medium text-text-main dark:text-white mb-1 block">Description</span>
                 <textarea
                   name="description"
                   value={editForm.description}
                   onChange={handleEditChange}
                   rows={3}
                   className="w-full rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white resize-none"
                 />
               </label>

               <label className="block">
                 <span className="text-sm font-medium text-text-main dark:text-white mb-1 block">Location</span>
                 <input
                   type="text"
                   name="location"
                   value={editForm.location}
                   onChange={handleEditChange}
                   className="w-full rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-12 px-4 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                 />
               </label>

               <label className="block">
                 <span className="text-sm font-medium text-text-main dark:text-white mb-1 block">Harvest Date</span>
                 <input
                   type="date"
                   name="harvest_date"
                   value={editForm.harvest_date}
                   onChange={handleEditChange}
                   className="w-full rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-12 px-4 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white"
                 />
               </label>

               <label className="flex items-start gap-3 p-4 bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark">
                 <input
                   type="checkbox"
                   name="is_available"
                   checked={editForm.is_available}
                   onChange={handleEditChange}
                   disabled={parseInt(editForm.stock_quantity) === 0}
                   className="w-5 h-5 rounded border-border-light dark:border-border-dark text-primary focus:ring-2 focus:ring-primary mt-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                 />
                 <div className="flex-1">
                   <span className="text-sm font-medium text-text-main dark:text-white block">Product is visible to customers</span>
                   <p className="text-xs text-text-subtle mt-1">
                     {parseInt(editForm.stock_quantity) === 0 
                       ? "⚠️ Cannot make available when stock is 0. Add stock first!" 
                       : "When enabled, customers can browse and purchase this product"}
                   </p>
                 </div>
               </label>

               <div className="flex gap-3 pt-4">
                 <button
                   onClick={() => setEditingProduct(null)}
                   className="flex-1 h-12 rounded-xl border border-border-light dark:border-border-dark text-text-main dark:text-white font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={handleUpdate}
                   disabled={isLoading}
                   className="flex-1 h-12 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                 >
                   {isLoading ? (
                     <>
                       <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                       Updating...
                     </>
                   ) : 'Save Changes'}
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default FarmerProducts;