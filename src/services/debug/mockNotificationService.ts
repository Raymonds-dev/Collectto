import { debugSession } from './debugSession';
import type { NotificationPageResponse, NotificationService } from '@/types/notifications';

export const mockNotificationService: NotificationService = {
  getNotifications: async (
    page: number = 0,
    size: number = 20
  ): Promise<NotificationPageResponse> => {
    if (!debugSession.isInitialized) {
      debugSession.initialize();
    }
    const start = page * size;
    const end = start + size;
    const paginated = debugSession.notifications.slice(start, end);
    return {
      notifications: paginated,
      totalPages: Math.ceil(debugSession.notifications.length / size),
      totalElements: debugSession.notifications.length,
      currentPage: page,
    };
  },

  markAllAsRead: async (): Promise<void> => {
    debugSession.notifications = debugSession.notifications.map((n) => ({
      ...n,
      read: true,
    }));
  },

  acceptFollowRequest: async (followerId: string): Promise<void> => {
    debugSession.notifications = debugSession.notifications.map((n) => {
      if (n.context === 'USER_FOLLOW_REQUESTED' && n.actor.id === followerId) {
        return {
          ...n,
          read: true,
          notificationId: `${n.notificationId}-accepted`,
        };
      }
      return n;
    });

    if (debugSession.currentUser) {
      debugSession.currentUser.followersCount = (debugSession.currentUser.followersCount || 0) + 1;
      const me = debugSession.users.find((u) => u.id === debugSession.currentUser?.id);
      if (me) {
        me.followersCount = debugSession.currentUser.followersCount;
      }
    }
  },

  declineFollowRequest: async (followerId: string): Promise<void> => {
    debugSession.notifications = debugSession.notifications.map((n) => {
      if (n.context === 'USER_FOLLOW_REQUESTED' && n.actor.id === followerId) {
        return {
          ...n,
          read: true,
          notificationId: `${n.notificationId}-declined`,
        };
      }
      return n;
    });
  },
};
