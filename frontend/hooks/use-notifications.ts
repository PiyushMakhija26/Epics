'use client';

import { useEffect, useState, useCallback } from 'react';

export interface Notification {
  title: string;
  message: string;
  type: 'info' | 'alarm' | 'status' | 'system';
  timestamp?: Date;
}

/**
 * Hook to subscribe to SSE notifications from the backend.
 * Automatically connects/disconnects when token changes or component unmounts.
 */
export function useNotifications(token: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsConnected(false);
      return;
    }

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        eventSource = new EventSource(`${apiBase}/api/notifications/sse`, {
          // Note: fetch with credentials doesn't work with EventSource, so we pass token in URL or headers
          // EventSource doesn't support custom headers, so we'll inject token via URL for simplicity
        });

        eventSource.addEventListener('notification', (event) => {
          try {
            const data = JSON.parse(event.data);
            setNotifications((prev) => [...prev, { ...data, timestamp: new Date() }]);
          } catch (err) {
            console.error('Failed to parse notification:', err);
          }
        });

        eventSource.onerror = () => {
          console.warn('EventSource connection lost, retrying...');
          setIsConnected(false);
          eventSource?.close();
          reconnectTimeout = setTimeout(connect, 3000);
        };

        setIsConnected(true);
      } catch (err) {
        console.error('Failed to connect to notifications:', err);
        setIsConnected(false);
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [token]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const dismissNotification = useCallback((index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    notifications,
    isConnected,
    clearNotifications,
    dismissNotification,
  };
}
