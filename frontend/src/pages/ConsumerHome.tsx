import React, { useState, useMemo } from 'react';
import { View, Product } from '@/types/types';

interface ConsumerHomeProps {
  navigate: (view: View) => void;
  cartCount: number;
  products: Product[];
  onProductSelect: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

const ConsumerHome: React.FC<ConsumerHomeProps> = ({ navigate, cartCount, products, onProductSelect, onAddToCart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Fruits', 'Vegetables', 'Dairy', 'Honey'];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col pb-20">
      {/* Top Bar */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 justify-between sticky top-0 z-20 backdrop-blur-md bg-opacity-90">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
          <div>
            <p className="text-xs text-text-subtle font-medium">Delivering to</p>
            <h2 className="text-text-main dark:text-white text-base font-bold leading-tight">Brooklyn, NY</h2>
          </div>
        </div>
        <button onClick={() => navigate('cart')} className="relative flex items-center justify-center h-12 w-12 rounded-full bg-surface-light dark:bg-surface-dark shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <span className="material-symbols-outlined text-text-main dark:text-white">shopping_cart</span>
          {cartCount > 0 && (
            <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-background-light dark:border-background-dark">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative flex items-center w-full h-14 rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm border border-border-light dark:border-border-dark focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
            <div className="flex items-center justify-center w-12 h-full text-text-subtle">
                <span className="material-symbols-outlined">search</span>
            </div>
            <input 
                type="text" 
                placeholder="Search for fruits, vegetables..." 
                className="w-full h-full bg-transparent border-none focus:ring-0 text-text-main dark:text-white placeholder:text-text-subtle outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
             {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="p-2 mr-2 text-text-subtle">
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>
            )}
        </div>
      </div>

      {/* Hero Carousel - Only show if no search */}
      {!searchTerm && selectedCategory === 'All' && (
        <div className="flex overflow-x-auto no-scrollbar px-4 pb-6 gap-4 snap-x">
             <div className="min-w-[85%] sm:min-w-[300px] bg-primary/10 dark:bg-primary/20 rounded-2xl p-5 flex flex-col justify-center snap-start">
                 <p className="text-primary font-bold text-lg">Weekly Deals</p>
                 <p className="text-text-main dark:text-white text-2xl font-bold mt-1">20% OFF</p>
                 <p className="text-text-subtle text-sm mt-1">On all organic root vegetables</p>
                 <button className="mt-4 bg-primary text-white px-6 py-2 rounded-full font-bold w-fit text-sm">Shop Now</button>
             </div>
             <div 
                className="min-w-[85%] sm:min-w-[300px] h-48 bg-cover bg-center rounded-2xl relative snap-start cursor-pointer overflow-hidden group"
                style={{backgroundImage: 'url("https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=1000")'}}
             >
                 <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors p-5 flex flex-col justify-end">
                    <p className="text-white font-bold text-xl">Fresh Tomatoes</p>
                    <p className="text-white/80 text-sm">Just harvested</p>
                 </div>
             </div>
        </div>
      )}

      {/* Categories */}
      <div className="flex gap-3 px-4 pb-6 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
            <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={`flex h-10 shrink-0 items-center justify-center px-6 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-surface-light dark:bg-surface-dark text-text-main dark:text-white border border-border-light dark:border-border-dark'}`}
            >
                {cat}
            </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-text-main dark:text-white">
                {searchTerm ? `Results for "${searchTerm}"` : `${selectedCategory} Near You`}
            </h3>
            <span className="text-xs text-text-subtle">{filteredProducts.length} items</span>
        </div>
        
        {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-text-subtle">
                <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
                <p>No products found</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-4">
                {filteredProducts.map((item) => (
                    <div key={item.id} onClick={() => onProductSelect(item)} className="flex flex-col gap-3 group cursor-pointer">
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <button 
                                className="absolute bottom-3 right-3 h-10 w-10 flex items-center justify-center rounded-full bg-primary text-white shadow-lg active:scale-95 transition-transform hover:bg-primary/90" 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onAddToCart(item, 1);
                                }}
                            >
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        </div>
                        <div>
                            <h3 className="text-text-main dark:text-white font-bold leading-tight line-clamp-1">{item.name}</h3>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-primary font-bold text-sm">${item.price.toFixed(2)} / {item.unit}</span>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-yellow-500 text-[14px]">star</span>
                                    <span className="text-xs text-text-subtle">{item.rating}</span>
                                </div>
                            </div>
                            <p className="text-xs text-text-subtle mt-1 truncate">{item.farmer}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark p-2 pb-safe z-30">
          <div className="flex justify-around items-center">
              <button onClick={() => navigate('consumer-home')} className="flex flex-col items-center gap-1 p-2 text-primary">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>home</span>
                  <span className="text-[10px] font-bold">Home</span>
              </button>
              <button onClick={() => navigate('bulk-order')} className="flex flex-col items-center gap-1 p-2 text-text-subtle dark:text-gray-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">inventory_2</span>
                  <span className="text-[10px] font-medium">Bulk</span>
              </button>
              <button onClick={() => navigate('order-tracking')} className="flex flex-col items-center gap-1 p-2 text-text-subtle dark:text-gray-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">receipt_long</span>
                  <span className="text-[10px] font-medium">Orders</span>
              </button>
              <button onClick={() => navigate('profile')} className="flex flex-col items-center gap-1 p-2 text-text-subtle dark:text-gray-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">person</span>
                  <span className="text-[10px] font-medium">Profile</span>
              </button>
          </div>
      </div>
    </div>
  );
};

export default ConsumerHome;