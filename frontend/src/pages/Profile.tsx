import React, { useState } from 'react';
import { View, Role } from '@/types/types';

interface ProfileProps {
  navigate: (view: View) => void;
  role: Role;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ navigate, role, onLogout }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col pb-24 transition-colors duration-300">
       <header className="flex items-center p-4 sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
           <button 
             onClick={() => role === 'farmer' ? navigate('farmer-dashboard') : navigate('consumer-home')} 
             className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
           >
               <span className="material-symbols-outlined text-text-main dark:text-white">arrow_back_ios_new</span>
           </button>
           <h1 className="flex-1 text-center font-bold text-lg text-text-main dark:text-white pr-10">My Profile</h1>
       </header>

       <main className="flex-1 p-4 space-y-6">
           {/* Profile Header */}
           <div className="flex flex-col items-center justify-center pt-2">
               <div className="relative">
                   <div className="h-24 w-24 rounded-full border-4 border-surface-light dark:border-surface-dark shadow-xl overflow-hidden">
                       <img 
                         src={role === 'farmer' 
                           ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
                           : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                         } 
                         className="w-full h-full object-cover" 
                         alt="Profile" 
                       />
                   </div>
                   <button className="absolute bottom-0 right-0 h-8 w-8 bg-primary text-white rounded-full border-2 border-background-light dark:border-background-dark flex items-center justify-center shadow-md">
                       <span className="material-symbols-outlined text-sm">edit</span>
                   </button>
               </div>
               <h2 className="mt-4 text-xl font-bold text-text-main dark:text-white">
                 {role === 'farmer' ? 'John Appleseed' : 'Jane Doe'}
               </h2>
               <div className="flex items-center gap-2 mt-1">
                   <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">
                     {role === 'farmer' ? 'Farmer' : 'Consumer'}
                   </span>
                   <span className="text-sm text-text-subtle">
                     {role === 'farmer' ? 'Green Valley Farm, CA' : 'Brooklyn, NY'}
                   </span>
               </div>
           </div>

           {/* Account Settings */}
           <section>
               <h3 className="px-1 text-sm font-bold text-text-subtle uppercase tracking-wider mb-2">Account Settings</h3>
               <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
                   <button className="w-full flex items-center gap-4 p-4 border-b border-border-light dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                       <span className="material-symbols-outlined text-text-subtle">person</span>
                       <span className="flex-1 text-left text-text-main dark:text-white font-medium">Personal Information</span>
                       <span className="material-symbols-outlined text-text-subtle text-sm">arrow_forward_ios</span>
                   </button>
                   <button className="w-full flex items-center gap-4 p-4 border-b border-border-light dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                       <span className="material-symbols-outlined text-text-subtle">location_on</span>
                       <span className="flex-1 text-left text-text-main dark:text-white font-medium">Addresses</span>
                       <span className="material-symbols-outlined text-text-subtle text-sm">arrow_forward_ios</span>
                   </button>
                   <button className="w-full flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                       <span className="material-symbols-outlined text-text-subtle">credit_card</span>
                       <span className="flex-1 text-left text-text-main dark:text-white font-medium">Payment Methods</span>
                       <span className="material-symbols-outlined text-text-subtle text-sm">arrow_forward_ios</span>
                   </button>
               </div>
           </section>

           {/* App Preferences */}
           <section>
               <h3 className="px-1 text-sm font-bold text-text-subtle uppercase tracking-wider mb-2">Preferences</h3>
               <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
                   <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark">
                       <div className="flex items-center gap-4">
                           <span className="material-symbols-outlined text-text-subtle">notifications</span>
                           <span className="text-text-main dark:text-white font-medium">Notifications</span>
                       </div>
                       <button 
                         onClick={() => setNotifications(!notifications)} 
                         className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${notifications ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                       >
                           <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${notifications ? 'left-6' : 'left-1'}`}></div>
                       </button>
                   </div>
                   <div className="flex items-center justify-between p-4">
                       <div className="flex items-center gap-4">
                           <span className="material-symbols-outlined text-text-subtle">dark_mode</span>
                           <span className="text-text-main dark:text-white font-medium">Dark Mode</span>
                       </div>
                       <button 
                         onClick={toggleDarkMode} 
                         className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${darkMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                       >
                           <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${darkMode ? 'left-6' : 'left-1'}`}></div>
                       </button>
                   </div>
               </div>
           </section>

           {/* Support */}
           <section>
               <h3 className="px-1 text-sm font-bold text-text-subtle uppercase tracking-wider mb-2">Support</h3>
               <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
                   <button className="w-full flex items-center gap-4 p-4 border-b border-border-light dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                       <span className="material-symbols-outlined text-text-subtle">help</span>
                       <span className="flex-1 text-left text-text-main dark:text-white font-medium">Help Center</span>
                   </button>
                   <button className="w-full flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                       <span className="material-symbols-outlined text-text-subtle">info</span>
                       <span className="flex-1 text-left text-text-main dark:text-white font-medium">About Us</span>
                   </button>
               </div>
           </section>

           <button 
             onClick={onLogout}
             className="w-full h-14 mt-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
           >
               <span className="material-symbols-outlined">logout</span>
               Log Out
           </button>

           <p className="text-center text-xs text-text-subtle pt-4">Version 2.4.0 (Build 102)</p>
       </main>
    </div>
  );
};

export default Profile;