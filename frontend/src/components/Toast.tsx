import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', duration = 2000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div className={`${bgColor} text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2`}>
        <span className="material-symbols-outlined text-xl">{icon}</span>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
