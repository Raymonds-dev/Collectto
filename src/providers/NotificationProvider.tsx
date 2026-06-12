import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { NotificationSummary } from '@/types/notifications';
import { isDebugModeEnabled } from '@/services/debug/debugFlags';
import { getNotifications } from '@/services/api/notificationService';
import { acceptFollowRequest, declineFollowRequest } from '@/services/api/api';

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

const MOCK_NOTIFICATIONS: NotificationSummary[] = [
  {
    notificationId: 'mock-notif-1',
    recipientId: 'current-user',
    actor: {
      id: 'mock-user-1',
      username: 'joao_silva',
      profilePictureUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80',
    },
    context: 'USER_FOLLOW_REQUESTED',
    reference: {
      id: 'mock-user-1',
      parentId: null,
      referenceImageUrl: null,
    },
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    notificationId: 'mock-notif-2',
    recipientId: 'current-user',
    actor: {
      id: 'mock-user-2',
      username: 'maria_oliveira',
      profilePictureUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80',
    },
    context: 'USER_ACCEPTED_FOLLOW_REQUEST',
    reference: {
      id: 'mock-user-2',
      parentId: null,
      referenceImageUrl: null,
    },
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    notificationId: 'mock-notif-3',
    recipientId: 'current-user',
    actor: {
      id: 'mock-user-3',
      username: 'carlos_souza',
      profilePictureUrl:
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&h=80&q=80',
    },
    context: 'COLLECTION_FOLLOWED',
    reference: {
      id: 'collection-1',
      parentId: null,
      referenceImageUrl:
        'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=150&h=150&q=80',
    },
    read: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    notificationId: 'mock-notif-4',
    recipientId: 'current-user',
    actor: {
      id: 'mock-user-4',
      username: 'ana_clara',
      profilePictureUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80&q=80',
    },
    context: 'ITEM_COMMENTED',
    reference: {
      id: 'item-1',
      parentId: 'collection-1',
      referenceImageUrl:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&h=150&q=80',
    },
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<NotificationSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      if (isDebugModeEnabled()) {
        // Return seed mock notifications in debug mode
        setNotifications(MOCK_NOTIFICATIONS);
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
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Optimistically update notifications to read
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // Note: Since there is no mark-as-read API endpoint in the backend api, we only persist locally.
  }, []);

  const acceptRequest = useCallback(async (followerId: string) => {
    try {
      if (!isDebugModeEnabled()) {
        await acceptFollowRequest(followerId);
      }
      // Update local state to accepted status
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.context === 'USER_FOLLOW_REQUESTED' && n.actor.id === followerId) {
            return {
              ...n,
              read: true,
              // We tag the notificationId with an accepted flag in-memory
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
      if (!isDebugModeEnabled()) {
        await declineFollowRequest(followerId);
      }
      // Update local state to declined status
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.context === 'USER_FOLLOW_REQUESTED' && n.actor.id === followerId) {
            return {
              ...n,
              read: true,
              // We tag the notificationId with a declined flag in-memory
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
