import api from './api';
import type { NotificationPageResponse } from '@/types/notifications';

export const getNotifications = async (
  page: number = 0,
  size: number = 20,
  sortBy: string = 'CREATED_AT_DESC'
): Promise<NotificationPageResponse> => {
  return api.get<NotificationPageResponse>('notifications', {
    params: { page, size, sortBy },
  });
};
