import React from 'react';
import { View, CartItem } from '../types';

interface CartProps {
  navigate: (view: View) => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
}

const Cart: React.FC<CartProps> = ({ navigate, cart, onUpdateQuantity }) => {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 0 ? 2.99 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col pb-28">
      <header className="flex items-center p-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark sticky top-0 z-10">
           <button onClick={() => navigate('consumer-home')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
               <span className="material-symbols-outlined text-text-main dark:text-white">arrow_back_ios_new</span>
           </button>
           <h1 className="flex-1 text-center font-bold text-lg text-text-main dark:text-white pr-10">My Cart</h1>
       </header>

       <main className="flex-1 p-4">
           {cart.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-center">
                   <div className="h-24 w-24 bg-surface-light dark:bg-surface-dark rounded-full flex items-center justify-center mb-4">
                       <span className="material-symbols-outlined text-4xl text-text-subtle">shopping_basket</span>
                   </div>
                   <h2 className="text-xl font-bold text-text-main dark:text-white mb-2">Your cart is empty</h2>
                   <p className="text-text-subtle mb-6">Looks like you haven't added anything yet.</p>
                   <button onClick={() => navigate('consumer-home')} className="px-8 py-3 bg-primary text-white rounded-full font-bold shadow-lg hover:bg-primary/90 transition-colors">Start Shopping</button>
               </div>
           ) : (
               <>
                {/* Items */}
                <div className="space-y-4">
                    {cart.map((item) => (
                        <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm">
                            <div className="h-20 w-20 rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0">
                                <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <h3 className="font-bold text-text-main dark:text-white line-clamp-1">{item.name}</h3>
                                <p className="text-sm text-text-subtle">${item.price.toFixed(2)} / {item.unit}</p>
                                <p className="text-xs text-text-subtle mt-1">{item.farmer}</p>
                            </div>
                            <div className="flex flex-col items-end justify-center gap-2">
                                <div className="flex items-center gap-3 bg-background-light dark:bg-background-dark rounded-full p-1 border border-border-light dark:border-border-dark">
                                    <button onClick={() => onUpdateQuantity(item.id, -1)} className="h-7 w-7 rounded-full bg-white dark:bg-surface-dark shadow-sm flex items-center justify-center text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">-</button>
                                    <span className="text-sm font-bold w-4 text-center text-text-main dark:text-white">{item.quantity}</span>
                                    <button onClick={() => onUpdateQuantity(item.id, 1)} className="h-7 w-7 rounded-full bg-white dark:bg-surface-dark shadow-sm flex items-center justify-center text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">+</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Coupon */}
                <div className="mt-6 flex gap-2">
                    <input type="text" placeholder="Promo Code" className="flex-1 rounded-xl border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-12 px-4 focus:ring-1 focus:ring-primary focus:border-primary dark:text-white outline-none" />
                    <button className="px-6 h-12 bg-surface-light dark:bg-surface-dark border border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors">Apply</button>
                </div>

                {/* Bill Details */}
                <div className="mt-6 p-4 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark space-y-2 shadow-sm">
                    <h3 className="font-bold text-lg mb-2 text-text-main dark:text-white">Bill Details</h3>
                    <div className="flex justify-between text-text-subtle text-sm">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-text-subtle text-sm">
                        <span>Delivery Fee</span>
                        <span>${deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border-light dark:border-border-dark my-2"></div>
                    <div className="flex justify-between font-bold text-lg text-text-main dark:text-white">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Delivery & Payment Preview */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer">
                        <span className="material-symbols-outlined text-primary mb-1">local_shipping</span>
                        <p className="font-bold text-primary">Home Delivery</p>
                        <p className="text-xs text-text-subtle">45 mins</p>
                    </div>
                    <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="material-symbols-outlined text-text-main dark:text-white mb-1">storefront</span>
                        <p className="font-bold text-text-main dark:text-white">Store Pickup</p>
                    </div>
                </div>
               </>
           )}
       </main>

       {cart.length > 0 && (
        <footer className="fixed bottom-0 left-0 right-0 p-4 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark z-20">
            <button onClick={() => navigate('order-tracking')} className="w-full h-14 bg-primary text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-between px-6 active:scale-[0.98] transition-transform hover:bg-primary/90">
                <span>Place Order</span>
                <span>${total.toFixed(2)}</span>
            </button>
        </footer>
       )}
    </div>
  );
};

export default Cart;