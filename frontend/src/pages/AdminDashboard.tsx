import React from 'react';
import { View } from '@/types/types';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminDashboardProps {
  navigate: (view: View) => void;
}

const data = [
  { name: 'Mon', uv: 40 },
  { name: 'Tue', uv: 60 },
  { name: 'Wed', uv: 45 },
  { name: 'Thu', uv: 90 },
  { name: 'Fri', uv: 75 },
  { name: 'Sat', uv: 50 },
  { name: 'Sun', uv: 80 },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
       <header className="p-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10 border-b border-border-light dark:border-border-dark">
            <h1 className="text-xl font-bold text-text-main dark:text-white">Admin Dashboard</h1>
            <div className="relative">
                <span className="material-symbols-outlined text-text-main dark:text-white">notifications</span>
                <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-background-light dark:border-background-dark"></span>
            </div>
       </header>

       <main className="flex-1 p-4 space-y-6">
           {/* Stats Grid */}
           <div className="grid grid-cols-2 gap-4">
               {[
                   { label: 'Total Farmers', val: '152', icon: 'agriculture' },
                   { label: 'Total Consumers', val: '845', icon: 'groups' },
                   { label: "Today's Orders", val: '34', icon: 'shopping_basket' },
                   { label: 'Active Subs', val: '98', icon: 'autorenew' }
               ].map((stat, i) => (
                   <div key={i} className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                       <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                           <span className="material-symbols-outlined text-lg">{stat.icon}</span>
                       </div>
                       <p className="text-2xl font-bold text-text-main dark:text-white">{stat.val}</p>
                       <p className="text-xs text-text-subtle font-medium">{stat.label}</p>
                   </div>
               ))}
           </div>

           {/* Chart */}
           <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
               <div className="mb-4">
                   <p className="font-bold text-lg text-text-main dark:text-white">Orders This Week</p>
                   <p className="text-3xl font-bold text-primary">150 Orders</p>
               </div>
               <div className="h-40 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={data}>
                           <defs>
                               <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#6A994E" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#6A994E" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
                           <Tooltip />
                           <Area type="monotone" dataKey="uv" stroke="#6A994E" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
           </div>

           {/* Top Locations */}
           <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
               <p className="font-bold text-lg text-text-main dark:text-white mb-4">Top Locations</p>
               <div className="space-y-4">
                   {[
                       { name: 'New York', pct: '90%' },
                       { name: 'Chicago', pct: '60%' },
                       { name: 'Houston', pct: '45%' },
                   ].map((loc, i) => (
                       <div key={i} className="grid grid-cols-[80px_1fr] items-center gap-4">
                           <span className="text-sm font-medium text-text-subtle">{loc.name}</span>
                           <div className="h-2 w-full bg-background-light dark:bg-black/20 rounded-full overflow-hidden">
                               <div className="h-full bg-primary rounded-full" style={{width: loc.pct}}></div>
                           </div>
                       </div>
                   ))}
               </div>
           </div>

           {/* Issues */}
           <div>
               <h2 className="font-bold text-lg text-text-main dark:text-white mb-3 px-1">Recent Issues</h2>
               <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
                   {[
                       { title: 'Dispute #1024', status: 'Pending', icon: 'report', color: 'text-accent bg-accent/10' },
                       { title: 'Feedback #1023', status: 'Resolved', icon: 'chat', color: 'text-primary bg-primary/10' },
                   ].map((issue, i) => (
                       <div key={i} className="flex items-center gap-4 p-4 border-b border-border-light dark:border-border-dark last:border-0 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
                           <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${issue.color}`}>
                               <span className="material-symbols-outlined">{issue.icon}</span>
                           </div>
                           <div className="flex-1">
                               <p className="font-bold text-text-main dark:text-white">{issue.title}</p>
                               <p className="text-xs text-text-subtle">{issue.status} • 2h ago</p>
                           </div>
                           <span className="material-symbols-outlined text-text-subtle">chevron_right</span>
                       </div>
                   ))}
               </div>
           </div>
       </main>

       {/* Floating Nav for Demo to go back */}
       <div className="fixed bottom-6 right-6 z-20">
           <button onClick={() => navigate('onboarding')} className="h-14 w-14 rounded-full bg-text-main text-white shadow-xl flex items-center justify-center">
               <span className="material-symbols-outlined">logout</span>
           </button>
       </div>
    </div>
  );
};

export default AdminDashboard;