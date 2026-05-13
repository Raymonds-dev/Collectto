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
