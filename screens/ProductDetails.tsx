import React, { useState } from 'react';
import { View, Product } from '../types';

interface ProductDetailsProps {
  navigate: (view: View) => void;
  product: Product;
  onAddToCart: (item: Product, qty: number) => void;
  cartItemCount: number;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ navigate, product, onAddToCart, cartItemCount }) => {
  const [quantity, setQuantity] = useState(1);

  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => Math.max(1, q - 1));

  return (
    <div className="relative min-h-screen bg-background-light dark:bg-background-dark pb-28">
      {/* Header */}
      <div className="sticky top-0 z-20 flex justify-between items-center p-4">
          <button onClick={() => navigate('consumer-home')} className="h-10 w-10 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-text-main dark:text-white shadow-sm hover:scale-105 transition-transform">
              <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <div className="flex gap-2">
            <button onClick={() => navigate('cart')} className="relative h-10 w-10 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-text-main dark:text-white shadow-sm hover:scale-105 transition-transform">
                <span className="material-symbols-outlined">shopping_cart</span>
                {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white dark:border-black">
                    {cartItemCount}
                    </span>
                )}
            </button>
            <button className="h-10 w-10 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-text-main dark:text-white shadow-sm hover:scale-105 transition-transform">
                <span className="material-symbols-outlined">share</span>
            </button>
          </div>
      </div>

      {/* Image */}
      <div className="absolute top-0 left-0 w-full h-[45vh] z-0">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-b-[2rem]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent opacity-90 h-full w-full top-[50%]"></div>
      </div>

      <div className="relative z-10 mt-[35vh] px-6">
          <div className="bg-surface-light dark:bg-surface-dark rounded-[2rem] p-6 shadow-xl border border-border-light dark:border-border-dark/50">
              <div className="flex justify-between items-start mb-2">
                  <h1 className="text-3xl font-bold text-text-main dark:text-white leading-tight w-2/3">{product.name}</h1>
                  <p className="text-2xl font-bold text-primary">${product.price} <span className="text-sm text-text-subtle font-normal">/ {product.unit}</span></p>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between py-4 border-b border-border-light dark:border-border-dark">
                  <span className="text-text-main dark:text-white font-medium">Quantity</span>
                  <div className="flex items-center gap-4">
                      <button onClick={decrement} className="h-10 w-10 rounded-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <span className="material-symbols-outlined">remove</span>
                      </button>
                      <span className="font-bold text-xl text-text-main dark:text-white w-8 text-center">{quantity}</span>
                      <button onClick={increment} className="h-10 w-10 rounded-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <span className="material-symbols-outlined">add</span>
                      </button>
                  </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-4 py-4">
                  <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">calendar_today</span>
                      </div>
                      <div>
                          <p className="text-xs text-text-subtle">Harvest Date</p>
                          <p className="font-bold text-text-main dark:text-white">Yesterday</p>
                      </div>
                  </div>
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                          <span className="material-symbols-outlined">eco</span>
                      </div>
                      <div>
                          <p className="text-xs text-text-subtle">Type</p>
                          <p className="font-bold text-text-main dark:text-white">Organic & Fresh</p>
                      </div>
                  </div>
                  <div className="p-3 bg-background-light dark:bg-background-dark rounded-xl text-sm text-text-main dark:text-white leading-relaxed">
                      {product.description || "Freshly harvested from local sustainable farms. Guaranteed quality and taste."}
                  </div>
              </div>

              {/* Farmer Profile */}
              <div className="mt-4 p-4 rounded-xl bg-background-light dark:bg-background-dark flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">agriculture</span>
                  </div>
                  <div className="flex-1">
                      <p className="font-bold text-text-main dark:text-white">{product.farmer}</p>
                      <p className="text-sm text-text-subtle">{product.location || 'Local Farm'}</p>
                      <div className="flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-yellow-500 text-[16px]">star</span>
                          <span className="text-xs font-bold text-text-main dark:text-white">{product.rating}</span>
                      </div>
                  </div>
                  <button className="px-4 py-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-full text-xs font-bold text-text-main dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">qr_code_2</span>
                      View QR
                  </button>
              </div>
          </div>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md p-4 border-t border-border-light dark:border-border-dark z-20">
          <div className="flex gap-4 max-w-md mx-auto">
              <button 
                onClick={() => navigate('subscriptions')}
                className="flex-1 h-14 rounded-full border border-primary text-primary font-bold hover:bg-primary/5 active:scale-[0.98] transition-all"
              >
                  Subscribe
              </button>
              <button 
                onClick={() => {
                    onAddToCart(product, quantity);
                    navigate('cart');
                }}
                className="flex-1 h-14 rounded-full bg-primary text-white font-bold shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex flex-col items-center justify-center leading-none"
              >
                  <span>Add to Cart</span>
                  <span className="text-[10px] font-normal opacity-80">${(product.price * quantity).toFixed(2)}</span>
              </button>
          </div>
      </div>
    </div>
  );
};

export default ProductDetails;