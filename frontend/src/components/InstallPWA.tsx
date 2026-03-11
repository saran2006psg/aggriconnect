import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstall(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('✅ App installed');
    }

    setDeferredPrompt(null);
    setShowInstall(false);
  };

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
            📱
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Install AgriConnect</h3>
            <p className="text-sm text-white/90 mb-3">
              Install our app for a better experience and offline access!
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-white text-green-600 font-semibold py-2 px-4 rounded-lg hover:bg-green-50 transition-colors"
              >
                Install
              </button>
              <button
                onClick={() => setShowInstall(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowInstall(false)}
            className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

// IsAppInstalled helper
export const useIsAppInstalled = (): boolean => {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  return isInstalled;
};
