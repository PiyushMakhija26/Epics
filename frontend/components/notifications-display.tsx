'use client';

import React from 'react';
import { useNotifications } from '@/contexts/notifications';
import { AlertCircle, Bell, CheckCircle, Info, X } from 'lucide-react';

export default function NotificationsDisplay() {
  const { notifications, dismissNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notif, idx) => (
        <div
          key={idx}
          className={`flex gap-3 p-4 rounded-lg border-l-4 text-sm font-medium shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
            notif.type === 'alarm'
              ? 'bg-red-50 border-red-500 text-red-900'
              : notif.type === 'status'
              ? 'bg-blue-50 border-blue-500 text-blue-900'
              : notif.type === 'system'
              ? 'bg-yellow-50 border-yellow-500 text-yellow-900'
              : 'bg-gray-50 border-gray-500 text-gray-900'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {notif.type === 'alarm' && <AlertCircle className="w-5 h-5 text-red-500" />}
            {notif.type === 'status' && <CheckCircle className="w-5 h-5 text-blue-500" />}
            {notif.type === 'system' && <Bell className="w-5 h-5 text-yellow-500" />}
            {notif.type === 'info' && <Info className="w-5 h-5 text-gray-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{notif.title}</p>
            <p className="text-xs opacity-75 mt-1">{notif.message}</p>
          </div>
          <button
            onClick={() => dismissNotification(idx)}
            className="flex-shrink-0 ml-2 hover:opacity-70 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
