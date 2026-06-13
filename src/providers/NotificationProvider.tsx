import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { NotificationSummary } from '@/types/notifications';
import { isDebugModeEnabled } from '@/services/debug/debugFlags';
import { getNotifications } from '@/services/api/notificationService';
import { acceptFollowRequest, declineFollowRequest } from '@/services/api/api';
import { useAuth } from '@/providers/AuthProvider';
import { mockNotificationService } from '@/services/debug/mockNotificationService';

export interface NotificationContextType {
  notifications: NotificationSummary[];
  unreadCount: number;
  loading: boolean;
  refreshing: boolean;
  fetchNotifications: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
  acceptRequest: (followerId: string) => Promise<void>;
  declineRequest: (followerId: string) => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    setRefreshing(true);
    try {
      if (isDebugModeEnabled()) {
        const response = await mockNotificationService.getNotifications(0, 50);
        setNotifications(response.notifications || []);
      } else {
        const response = await getNotifications(0, 50);
        setNotifications(response.notifications || []);
      }
    } catch (error) {
      console.error('[NotificationProvider] Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    // Optimistically update notifications to read
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    if (isDebugModeEnabled()) {
      await mockNotificationService.markAllAsRead();
    }
  }, []);

  const acceptRequest = useCallback(async (followerId: string) => {
    try {
      if (isDebugModeEnabled()) {
        await mockNotificationService.acceptFollowRequest(followerId);
      } else {
        await acceptFollowRequest(followerId);
      }
      // Update local state to accepted status
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.context === 'USER_FOLLOW_REQUESTED' && n.actor.id === followerId) {
            return {
              ...n,
              read: true,
              notificationId: `${n.notificationId}-accepted`,
            };
          }
          return n;
        })
      );
    } catch (error) {
      console.error('[NotificationProvider] Failed to accept follow request:', error);
      throw error;
    }
  }, []);

  const declineRequest = useCallback(async (followerId: string) => {
    try {
      if (isDebugModeEnabled()) {
        await mockNotificationService.declineFollowRequest(followerId);
      } else {
        await declineFollowRequest(followerId);
      }
      // Update local state to declined status
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.context === 'USER_FOLLOW_REQUESTED' && n.actor.id === followerId) {
            return {
              ...n,
              read: true,
              notificationId: `${n.notificationId}-declined`,
            };
          }
          return n;
        })
      );
    } catch (error) {
      console.error('[NotificationProvider] Failed to decline follow request:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const value = useMemo<NotificationContextType>(
    () => ({
      notifications,
      unreadCount,
      loading,
      refreshing,
      fetchNotifications,
      markAllAsRead,
      acceptRequest,
      declineRequest,
    }),
    [
      notifications,
      unreadCount,
      loading,
      refreshing,
      fetchNotifications,
      markAllAsRead,
      acceptRequest,
      declineRequest,
    ]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
