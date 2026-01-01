import React, { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      if (response.success && response.data) {
        // Backend returns array directly in data, not data.items
        const items = Array.isArray(response.data) ? response.data : (response.data.items || []);
        setNotifications(items.slice(0, 10)); // Show latest 10
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications(prev => prev.map(n => 
          n.id === notification.id ? { ...n, is_read: true } : n
        ));
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  };

  const handleMarkAllRead = async () => {
    setIsLoading(true);
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(
        unreadNotifications.map(n => notificationService.markAsRead(n.id))
      );
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: any = {
      'order_placed': 'receipt',
      'order_confirmed': 'task_alt',
      'order_processing': 'package_2',
      'order_shipped': 'local_shipping',
      'order_delivered': 'check_circle',
      'order_cancelled': 'cancel',
      'payment': 'payments',
      'system': 'info'
    };
    return icons[type] || 'notifications';
  };

  const getNotificationColor = (type: string) => {
    const colors: any = {
      'order_placed': 'text-blue-600',
      'order_confirmed': 'text-green-600',
      'order_processing': 'text-purple-600',
      'order_shipped': 'text-primary',
      'order_delivered': 'text-green-600',
      'order_cancelled': 'text-red-600',
      'payment': 'text-yellow-600',
      'system': 'text-gray-600'
    };
    return colors[type] || 'text-gray-600';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative flex items-center justify-center h-10 w-10 rounded-full bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <span className="material-symbols-outlined text-text-main dark:text-white">
          notifications
        </span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          <div className="absolute right-0 mt-2 w-80 md:w-96 bg-background-light dark:bg-background-dark rounded-2xl shadow-2xl border border-border-light dark:border-border-dark z-50 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-border-light dark:border-border-dark flex items-center justify-between">
              <h3 className="font-bold text-text-main dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={isLoading}
                  className="text-xs text-primary hover:underline disabled:opacity-50"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-text-subtle">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">
                    notifications_off
                  </span>
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border-light dark:divide-border-dark">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 cursor-pointer hover:bg-surface-light dark:hover:bg-surface-dark transition-colors ${
                        !notification.is_read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${
                          !notification.is_read ? 'bg-primary/10' : 'bg-gray-100 dark:bg-gray-800'
                        } flex items-center justify-center`}>
                          <span className={`material-symbols-outlined text-lg ${
                            !notification.is_read ? 'text-primary' : getNotificationColor(notification.type)
                          }`}>
                            {getNotificationIcon(notification.type)}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium ${
                              !notification.is_read ? 'text-text-main dark:text-white' : 'text-text-subtle'
                            } line-clamp-1`}>
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-text-subtle line-clamp-2 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-text-subtle mt-1">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-border-light dark:border-border-dark">
                <button
                  onClick={() => setShowDropdown(false)}
                  className="w-full text-center text-xs text-primary hover:underline font-medium"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
