import React, { useState } from 'react';
import { View } from '../types';

interface SubscriptionsProps {
  navigate: (view: View) => void;
}

const Subscriptions: React.FC<SubscriptionsProps> = ({ navigate }) => {
  const [frequency, setFrequency] = useState<'Weekly' | 'Monthly'>('Weekly');

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col pb-24">
       <header className="flex items-center p-4 sticky top-0 z-10 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-sm">
           <button onClick={() => navigate('consumer-home')} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
               <span className="material-symbols-outlined text-text-main dark:text-white">arrow_back_ios_new</span>
           </button>
           <h1 className="flex-1 text-center font-bold text-lg text-text-main dark:text-white pr-10">Farm Box</h1>
       </header>

       <main className="flex-1 p-4">
           <h1 className="text-3xl font-bold text-text-main dark:text-white mb-6">Choose Your<br/>Plan</h1>

           {/* Frequency Toggle */}
           <div className="flex p-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-full mb-8 relative">
                <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-full transition-all duration-300 ${frequency === 'Weekly' ? 'left-1' : 'left-[calc(50%+2px)]'}`}></div>
                <button onClick={() => setFrequency('Weekly')} className={`flex-1 py-3 text-sm font-bold rounded-full z-10 transition-colors ${frequency === 'Weekly' ? 'text-white' : 'text-text-subtle'}`}>Weekly</button>
                <button onClick={() => setFrequency('Monthly')} className={`flex-1 py-3 text-sm font-bold rounded-full z-10 transition-colors ${frequency === 'Monthly' ? 'text-white' : 'text-text-subtle'}`}>Monthly</button>
           </div>

           {/* Filter Chips */}
           <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
                <button className="px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-bold whitespace-nowrap">All Items</button>
                <button className="px-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-full text-sm font-medium whitespace-nowrap">Fruits</button>
                <button className="px-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-full text-sm font-medium whitespace-nowrap">Vegetables</button>
           </div>

           {/* Items List */}
           <div className="space-y-4">
               {[
                   { name: 'Organic Apples', price: 2.50, img: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?auto=format&fit=crop&q=80&w=200', qty: 1 },
                   { name: 'Carrots', price: 1.80, img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=200', qty: 2 },
                   { name: 'Avocado', price: 1.50, img: 'https://images.unsplash.com/photo-1523049673856-38866f859572?auto=format&fit=crop&q=80&w=200', qty: 0 },
                   { name: 'Broccoli', price: 2.00, img: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&q=80&w=200', qty: 1 }
               ].map((item, idx) => (
                   <div key={idx} className="flex items-center gap-4 p-3 bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark">
                       <img src={item.img} className="h-16 w-16 rounded-xl object-cover" alt={item.name} />
                       <div className="flex-1">
                           <h3 className="font-bold text-text-main dark:text-white">{item.name}</h3>
                           <p className="text-sm text-text-subtle">${item.price.toFixed(2)} / unit</p>
                       </div>
                       <div className="flex items-center gap-3">
                           <button className="h-8 w-8 rounded-full border border-border-light dark:border-border-dark flex items-center justify-center text-lg">-</button>
                           <span className="font-bold w-4 text-center">{item.qty}</span>
                           <button className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-lg">+</button>
                       </div>
                   </div>
               ))}
           </div>
       </main>

       {/* Floating Summary */}
       <div className="fixed bottom-0 left-0 right-0 p-4">
           <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md rounded-2xl border border-border-light dark:border-border-dark shadow-2xl p-4 flex items-center justify-between">
               <div>
                   <p className="text-xs text-text-subtle">Total / {frequency.toLowerCase()}</p>
                   <p className="text-2xl font-bold text-text-main dark:text-white">$8.10</p>
                   <p className="text-[10px] text-primary font-medium mt-1">Next: Tue, Oct 26</p>
               </div>
               <button onClick={() => navigate('consumer-home')} className="h-12 px-8 bg-primary text-white font-bold rounded-full shadow-lg shadow-primary/30 active:scale-95 transition-transform">
                   Subscribe
               </button>
           </div>
       </div>
    </div>
  );
};

export default Subscriptions;