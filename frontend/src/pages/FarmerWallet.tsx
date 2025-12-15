import React, { useState, useEffect } from 'react';
import { View } from '@/types/types';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';

interface FarmerWalletProps {
  navigate: (view: View) => void;
}

const FarmerWallet: React.FC<FarmerWalletProps> = ({ navigate }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API data fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const transactions = [
    { id: 1, type: 'credit', title: 'Order #ORD-001 - Jane Doe', date: 'Today, 10:30 AM', amount: 24.50 },
    { id: 2, type: 'credit', title: 'Order #ORD-003 - Rachel Zane', date: 'Yesterday, 2:15 PM', amount: 45.20 },
    { id: 3, type: 'debit', title: 'Payout to Bank ****4242', date: 'Oct 24, 2023', amount: 150.00 },
    { id: 4, type: 'credit', title: 'Bulk Order #BLK-992', date: 'Oct 22, 2023', amount: 500.00 },
  ];

  const payouts = [
      { id: 'PO-101', date: 'Oct 24, 2023', amount: 150.00, destination: 'Bank ****4242', status: 'Completed' },
      { id: 'PO-102', date: 'Oct 15, 2023', amount: 320.50, destination: 'Bank ****4242', status: 'Pending' },
      { id: 'PO-103', date: 'Oct 01, 2023', amount: 450.00, destination: 'Bank ****4242', status: 'Failed' },
  ];

  const earningsData = [
    { name: 'Mon', amount: 45.20 },
    { name: 'Tue', amount: 120.50 },
    { name: 'Wed', amount: 85.00 },
    { name: 'Thu', amount: 24.50 },
    { name: 'Fri', amount: 350.00 },
    { name: 'Sat', amount: 180.00 },
    { name: 'Sun', amount: 500.00 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600 dark:text-green-400';
      case 'Pending': return 'text-yellow-600 dark:text-yellow-400';
      case 'Failed': return 'text-red-600 dark:text-red-400';
      default: return 'text-text-subtle';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500';
      case 'Pending': return 'bg-yellow-500';
      case 'Failed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col pb-6">
        <header className="flex items-center p-4 sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
           <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse"></div>
           <div className="flex-1 flex justify-center pr-10">
               <div className="h-6 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse"></div>
           </div>
       </header>

       <main className="flex-1 p-4 space-y-6">
           {/* Balance Card Skeleton */}
           <div className="h-64 rounded-2xl bg-gray-200 dark:bg-white/10 animate-pulse w-full"></div>
           
           {/* Quick Stats Skeleton */}
           <div className="grid grid-cols-2 gap-4">
               <div className="h-32 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse"></div>
               <div className="h-32 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse"></div>
           </div>

           {/* Chart Skeleton */}
           <div className="h-64 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse w-full"></div>

           {/* Transactions Skeleton */}
           <div>
               <div className="h-6 w-48 bg-gray-200 dark:bg-white/10 rounded mb-4 animate-pulse"></div>
               <div className="space-y-4">
                   {[1, 2, 3].map((i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark">
                           <div className="flex items-center gap-3 w-full">
                               <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse shrink-0"></div>
                               <div className="space-y-2 w-full">
                                   <div className="h-4 w-3/4 bg-gray-200 dark:bg-white/10 rounded animate-pulse"></div>
                                   <div className="h-3 w-1/2 bg-gray-200 dark:bg-white/10 rounded animate-pulse"></div>
                               </div>
                           </div>
                           <div className="h-5 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse shrink-0 ml-4"></div>
                       </div>
                   ))}
               </div>
           </div>

           {/* Payouts Skeleton */}
           <div>
               <div className="flex justify-between mb-4">
                    <div className="h-6 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse"></div>
               </div>
               <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
                   {[1, 2].map((i) => (
                       <div key={i} className="p-4 flex items-center justify-between border-b border-border-light dark:border-border-dark last:border-0">
                           <div className="flex items-center gap-3 w-full">
                               <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse shrink-0"></div>
                               <div className="space-y-2 w-full">
                                   <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded animate-pulse"></div>
                                   <div className="h-3 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse"></div>
                               </div>
                           </div>
                           <div className="space-y-2 shrink-0 ml-4 flex flex-col items-end">
                               <div className="h-4 w-20 bg-gray-200 dark:bg-white/10 rounded animate-pulse"></div>
                               <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse"></div>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
       </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col pb-6">
       <header className="flex items-center p-4 sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
           <button onClick={() => navigate('farmer-dashboard')} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
               <span className="material-symbols-outlined text-text-main dark:text-white">arrow_back_ios_new</span>
           </button>
           <h1 className="flex-1 text-center font-bold text-lg text-text-main dark:text-white pr-10">Wallet</h1>
       </header>

       <main className="flex-1 p-4 space-y-6">
           {/* Balance Card */}
           <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white shadow-lg shadow-primary/20">
               <p className="text-white/80 font-medium mb-1">Total Balance</p>
               <h2 className="text-4xl font-bold mb-6">$1,250.75</h2>
               <div className="flex gap-4">
                   <button className="flex-1 bg-white text-primary font-bold h-12 rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform">
                       <span className="material-symbols-outlined">download</span>
                       Withdraw
                   </button>
                   <button className="flex-1 bg-white/20 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 backdrop-blur-sm active:scale-95 transition-transform">
                       <span className="material-symbols-outlined">add_card</span>
                       Top Up
                   </button>
               </div>
           </div>

           {/* Quick Stats */}
           <div className="grid grid-cols-2 gap-4">
               <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark">
                   <div className="flex justify-between items-start mb-2">
                       <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                           <span className="material-symbols-outlined text-sm">trending_up</span>
                       </div>
                       <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">arrow_upward</span>
                            12%
                       </span>
                   </div>
                   <p className="text-xs text-text-subtle">This Month</p>
                   <p className="font-bold text-lg text-text-main dark:text-white">+$842.00</p>
               </div>
               <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark">
                   <div className="flex justify-between items-start mb-2">
                       <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                           <span className="material-symbols-outlined text-sm">pending</span>
                       </div>
                       <span className="text-[10px] font-medium text-text-subtle bg-background-light dark:bg-black/20 px-1.5 py-0.5 rounded-md">
                            ~2 days
                       </span>
                   </div>
                   <p className="text-xs text-text-subtle">Pending</p>
                   <p className="font-bold text-lg text-text-main dark:text-white">$120.50</p>
               </div>
           </div>

           {/* Earnings Chart */}
           <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
               <h3 className="font-bold text-lg text-text-main dark:text-white mb-4">Earnings Overview</h3>
               <div className="h-48 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={earningsData}>
                           <defs>
                               <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#6A994E" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#6A994E" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <Tooltip 
                             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                             itemStyle={{ color: '#6A994E', fontWeight: 'bold' }}
                             formatter={(value: number) => [`$${value.toFixed(2)}`, 'Earnings']}
                           />
                           <Area type="monotone" dataKey="amount" stroke="#6A994E" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </div>

           {/* Transactions */}
           <div>
               <h3 className="font-bold text-lg text-text-main dark:text-white mb-4">Recent Transactions</h3>
               <div className="space-y-4">
                   {transactions.map((tx) => (
                       <div key={tx.id} className="flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark">
                           <div className="flex items-center gap-3">
                               <div className={`h-10 w-10 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                                   <span className="material-symbols-outlined">
                                       {tx.type === 'credit' ? 'arrow_downward' : 'arrow_upward'}
                                   </span>
                               </div>
                               <div>
                                   <p className="font-bold text-sm text-text-main dark:text-white line-clamp-1">{tx.title}</p>
                                   <p className="text-xs text-text-subtle">{tx.date}</p>
                               </div>
                           </div>
                           <span className={`font-bold ${tx.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-text-main dark:text-white'}`}>
                               {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                           </span>
                       </div>
                   ))}
               </div>
           </div>

           {/* Payout History */}
           <div>
               <div className="flex items-center justify-between mb-4 pt-2">
                   <h3 className="font-bold text-lg text-text-main dark:text-white">Payout History</h3>
                   <button className="text-primary text-sm font-bold hover:underline">View All</button>
               </div>
               <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
                   {payouts.map((payout, idx) => (
                       <div key={payout.id} className={`p-4 flex items-center justify-between ${idx !== payouts.length - 1 ? 'border-b border-border-light dark:border-border-dark' : ''} hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}>
                           <div className="flex items-center gap-3">
                               <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                   <span className="material-symbols-outlined">account_balance</span>
                               </div>
                               <div>
                                   <p className="font-bold text-sm text-text-main dark:text-white">{payout.destination}</p>
                                   <div className="flex items-center gap-2 text-xs text-text-subtle">
                                       <span>{payout.date}</span>
                                       <span className="w-1 h-1 rounded-full bg-text-subtle/50"></span>
                                       <span className="font-mono">ID: {payout.id}</span>
                                   </div>
                               </div>
                           </div>
                           <div className="text-right">
                               <p className="font-bold text-text-main dark:text-white">${payout.amount.toFixed(2)}</p>
                               <div className="flex items-center justify-end gap-1">
                                   <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(payout.status)}`}></span>
                                   <p className={`text-xs font-medium ${getStatusColor(payout.status)}`}>{payout.status}</p>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
       </main>
    </div>
  );
};

export default FarmerWallet;