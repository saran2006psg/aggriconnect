import React, { useState } from 'react';
import { Role } from '@/types/types';

interface LoginProps {
  onLogin: () => void;
  onBack: () => void;
  role: Role;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack, role }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
        setIsLoading(false);
        onLogin();
    }, 1200);
  };

  const isFarmer = role === 'farmer';

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      {/* Header Image Area */}
      <div className={`relative h-48 w-full overflow-hidden ${isFarmer ? 'bg-secondary' : 'bg-primary'}`}>
         <img 
            src={isFarmer 
                ? "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000" 
                : "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000"
            } 
            className="w-full h-full object-cover opacity-40" 
            alt="Header"
         />
         <div className="absolute top-0 left-0 p-4 w-full">
            <button onClick={onBack} className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
         </div>
         <div className="absolute bottom-0 left-0 p-6 w-full bg-gradient-to-t from-background-light dark:from-background-dark to-transparent">
             <h1 className="text-3xl font-bold text-text-main dark:text-white">
                 {isLogin ? 'Welcome Back!' : 'Create Account'}
             </h1>
             <p className="text-text-main/80 dark:text-white/80 text-sm">
                 {isLogin 
                    ? `Sign in to access your ${isFarmer ? 'farm dashboard' : 'fresh finds'}.` 
                    : `Join AgriConnect as a ${role}.`}
             </p>
         </div>
      </div>

      <div className="flex-1 px-6 py-4 flex flex-col">
          {/* Social Login */}
          <div className="flex gap-4 mb-8">
              <button className="flex-1 h-12 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
                  <span className="text-sm font-semibold text-text-main dark:text-white">Google</span>
              </button>
              <button className="flex-1 h-12 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <span className="material-symbols-outlined text-text-main dark:text-white">apple</span>
                  <span className="text-sm font-semibold text-text-main dark:text-white">Apple</span>
              </button>
          </div>

          <div className="relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-light dark:border-border-dark"></div>
              </div>
              <span className="relative bg-background-light dark:bg-background-dark px-4 text-xs text-text-subtle uppercase tracking-wider">Or continue with</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                  <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
                      <div>
                        <label className="block text-xs font-bold text-text-subtle mb-1 uppercase">Full Name</label>
                        <input required type="text" placeholder="John Doe" className="w-full h-14 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark px-4 text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
                      </div>
                      
                      {isFarmer && (
                          <div>
                            <label className="block text-xs font-bold text-text-subtle mb-1 uppercase">Farm Name</label>
                            <input required type="text" placeholder="Green Acres" className="w-full h-14 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark px-4 text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
                          </div>
                      )}
                  </div>
              )}

              <div>
                <label className="block text-xs font-bold text-text-subtle mb-1 uppercase">Email Address</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-subtle">mail</span>
                    <input required type="email" placeholder="name@example.com" className="w-full h-14 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark pl-12 pr-4 text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-subtle mb-1 uppercase">Password</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-subtle">lock</span>
                    <input required type="password" placeholder="••••••••" className="w-full h-14 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark pl-12 pr-4 text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
                </div>
              </div>

              {isLogin && (
                  <div className="flex justify-end">
                      <button type="button" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Forgot Password?</button>
                  </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full h-14 rounded-xl font-bold text-white shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${isLoading ? 'bg-primary/70 cursor-wait' : 'bg-primary hover:bg-primary/90'}`}
              >
                  {isLoading ? (
                      <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                      isLogin ? 'Log In' : 'Create Account'
                  )}
              </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-auto pt-6 text-center">
              <p className="text-text-main dark:text-white text-sm">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={() => setIsLogin(!isLogin)} 
                    className="font-bold text-primary hover:underline"
                  >
                      {isLogin ? 'Sign Up' : 'Log In'}
                  </button>
              </p>
          </div>
      </div>
    </div>
  );
};

export default Login;