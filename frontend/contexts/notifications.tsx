'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications as useNotificationsHook, Notification } from '@/hooks/use-notifications';

interface NotificationsContextType {
  notifications: Notification[];
  isConnected: boolean;
  clearNotifications: () => void;
  dismissNotification: (index: number) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({
  children,
  token,
}: {
  children: ReactNode;
  token: string | null;
}) {
  const notifs = useNotificationsHook(token);

  return (
    <NotificationsContext.Provider value={notifs}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return ctx;
}
