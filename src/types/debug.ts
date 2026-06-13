import { ItemResponse } from './items';

/**
 * Shared types for Ephemeral Debug Mode
 */

export interface PostProjection {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    profilePictureUrl?: string;
  };
  item: ItemResponse;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export type MockFeedPost = {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUri: string;
  };
  content: string;
  publishedLabel: string;
  item: {
    id: string;
    collectionId: string;
    title: string;
    imageUri: string;
  };
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  sharesCount: number;
};

export interface FeedSourceSummary {
  id: string;
  username?: string | null;
  collectionName?: string | null;
  avatarUrl?: string | null;
  context: 'USER' | 'COLLECTION' | 'ITEM';
}

export interface FeedSummary {
  source: FeedSourceSummary;
  item: ItemResponse;
}

export interface FeedResponse {
  content: FeedSummary[];
  size: number;
  currentPage: number;
  hasNext: boolean;
}

export interface CommenterSummaryResponse {
  commentId: string;
  userId: string;
  username: string;
  profilePictureURL?: string | null;
  content: string;
  createdAt: string; // ISO date-time string
}

export interface ItemCommentPageResponse {
  commenterSummaries: CommenterSummaryResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

export interface CreateCommentRequest {
  content: string;
}

export interface CreateCommentResponse {
  commentId: string;
  itemId: string;
  userId: string;
  content: string;
  createdAt: string; // ISO date-time string
}
