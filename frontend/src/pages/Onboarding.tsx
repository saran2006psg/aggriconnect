import React from 'react';
import { Role } from '@/types/types';

interface OnboardingProps {
  onRoleSelect: (role: Role) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onRoleSelect }) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between p-6 sm:p-8">
      <header className="flex flex-col items-center gap-2 pt-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 text-primary">
          <span className="material-symbols-outlined !text-5xl">potted_plant</span>
        </div>
        <h1 className="text-text-main dark:text-white tracking-tight text-3xl font-bold leading-tight">AgriConnect</h1>
      </header>

      <main className="flex flex-1 flex-col justify-center gap-6 max-w-md mx-auto w-full">
        <div className="text-center mb-4">
          <p className="text-text-main/90 dark:text-white/90 text-lg font-normal leading-normal">
            How will you be using our app?
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => onRoleSelect('farmer')}
            className="flex flex-col items-center gap-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6 text-center transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-100"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary/20 text-secondary">
              <span className="material-symbols-outlined !text-3xl">agriculture</span>
            </div>
            <div className="flex flex-col">
              <p className="text-text-main dark:text-white text-lg font-semibold leading-normal">I am a Farmer</p>
              <p className="text-primary text-base font-normal leading-normal">Sell your fresh produce directly</p>
            </div>
          </button>

          <button 
            onClick={() => onRoleSelect('consumer')}
            className="flex flex-col items-center gap-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6 text-center transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-100"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-primary">
              <span className="material-symbols-outlined !text-3xl">shopping_basket</span>
            </div>
            <div className="flex flex-col">
              <p className="text-text-main dark:text-white text-lg font-semibold leading-normal">I am a Consumer</p>
              <p className="text-primary text-base font-normal leading-normal">Buy fresh from local farms</p>
            </div>
          </button>

           <button 
            onClick={() => onRoleSelect('admin')}
            className="mt-4 text-sm text-text-subtle hover:text-primary transition-colors"
          >
            Access as Admin
          </button>
        </div>
      </main>

      <footer className="pb-4">
        <p className="text-text-main/60 dark:text-white/60 text-sm font-normal leading-normal text-center">
          By continuing, you agree to our <a href="#" className="underline hover:text-primary">Terms of Service</a> & <a href="#" className="underline hover:text-primary">Privacy Policy</a>
        </p>
      </footer>
    </div>
  );
};

export default Onboarding;