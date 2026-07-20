export type NotificationType =
  | 'USER_FOLLOW_REQUESTED'
  | 'USER_ACCEPTED_FOLLOW_REQUEST'
  | 'COLLECTION_FOLLOWED'
  | 'ITEM_COMMENTED'
  | 'ITEM_LIKED';

export interface ActorSummary {
  id: string;
  username: string;
  profilePictureUrl: string | null;
}

export interface ReferenceSummary {
  id: string;
  parentId: string | null;
  referenceImageUrl: string | null;
}

export interface NotificationSummary {
  notificationId: string;
  recipientId: string;
  actor: ActorSummary;
  context: NotificationType;
  reference: ReferenceSummary | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationPageResponse {
  notifications: NotificationSummary[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

export interface UserFollowResponse {
  followerId: string;
  followedId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
}
