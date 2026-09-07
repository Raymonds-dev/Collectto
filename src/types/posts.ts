import type { Comment } from './comments';
import type { PostProjection } from './debug';

/**
 * Service strategy interface for social feed, post likes, and comments.
 * Implemented by apiPostService (live HTTP backend) and mockPostService (in-memory debug).
 */
export interface PostService {
  getFeed: (page?: number, size?: number) => Promise<PostProjection[]>;
  getFeedSync?: () => PostProjection[];
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  getComments: (postId: string) => Promise<Comment[]>;
  createComment: (postId: string, text: string) => Promise<Comment>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
}
