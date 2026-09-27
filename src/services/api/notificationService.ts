import api, { acceptFollowRequest, declineFollowRequest } from './api';
import type { NotificationPageResponse, NotificationService } from '@/types/notifications';

export const getNotifications = async (
  page: number = 0,
  size: number = 20,
  sortBy: string = 'CREATED_AT_DESC'
): Promise<NotificationPageResponse> => {
  return api.get<NotificationPageResponse>('notifications', {
    params: { page, size, sortBy },
  });
};

export const apiNotificationService: NotificationService = {
  getNotifications: async (
    page: number = 0,
    size: number = 20
  ): Promise<NotificationPageResponse> => {
    return getNotifications(page, size);
  },

  markAllAsRead: async (): Promise<void> => {
    // API endpoint call or no-op fallback
    try {
      await api.patch('notifications/read-all');
    } catch {
      // Ignored if API endpoint is not present
    }
  },

  acceptFollowRequest: async (followerId: string): Promise<void> => {
    await acceptFollowRequest(followerId);
  },

  declineFollowRequest: async (followerId: string): Promise<void> => {
    await declineFollowRequest(followerId);
  },
};
