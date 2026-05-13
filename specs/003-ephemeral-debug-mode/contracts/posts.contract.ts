/**
 * PostService Contract aligned with the Swagger API.
 *
 * @file specs/003-ephemeral-debug-mode/contracts/posts.contract.ts
 */

export interface PostAuthor {
  id: string;
  name: string;
  username: string;
  profilePictureUrl?: string;
}

export interface PostItemPreview {
  id: string;
  collectionId: string;
  name: string;
  description: string;
  imageFilesUrls: string[];
}

export interface PostProjection {
  id: string;
  author: PostAuthor;
  item: PostItemPreview;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface FeedOptions {
  page?: number;
  size?: number;
  sortBy?: 'CREATED_AT_DESC' | 'CREATED_AT_ASC' | 'LIKES_DESC' | 'LIKES_ASC';
}

export interface PostService {
  getFeed(options?: FeedOptions): Promise<PostProjection[]>;
  getByUser(userId: string, options?: FeedOptions): Promise<PostProjection[]>;
  getByCollection(collectionId: string, options?: FeedOptions): Promise<PostProjection[]>;
  getById(postId: string): Promise<PostProjection>;
  like(postId: string): Promise<void>;
  unlike(postId: string): Promise<void>;
  isLiked(postId: string): Promise<boolean>;
}
