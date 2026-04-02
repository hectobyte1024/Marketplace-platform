import React, { useEffect } from 'react';
import { useNotificationStore } from '../stores/index.js';

export const NotificationCenter: React.FC = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  useEffect(() => {
    // Auto-remove notifications after 5 seconds
    const timers = notifications.map((notif) => {
      return setTimeout(() => {
        removeNotification(notif.id);
      }, 5000);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [notifications, removeNotification]);

  const getIconAndColor = (type: string) => {
    switch (type) {
      case 'success':
        return { icon: '✓', color: 'bg-green-50 border-green-200 text-green-800' };
      case 'error':
        return { icon: '✕', color: 'bg-red-50 border-red-200 text-red-800' };
      case 'booking':
        return { icon: '📋', color: 'bg-blue-50 border-blue-200 text-blue-800' };
      default:
        return { icon: 'ℹ', color: 'bg-gray-50 border-gray-200 text-gray-800' };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notif) => {
        const { icon, color } = getIconAndColor(notif.type);
        return (
          <div
            key={notif.id}
            className={`border rounded-lg p-4 ${color} animate-slide-in`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1">{notif.title}</div>
                <div className="text-sm opacity-90">{notif.message}</div>
              </div>
              <button
                onClick={() => removeNotification(notif.id)}
                className="text-lg opacity-50 hover:opacity-100 transition"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
