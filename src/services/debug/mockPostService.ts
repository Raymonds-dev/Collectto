import { debugSession } from './debugSession';
import { deriveFeedPosts } from './postDerivation';
import type { PostProjection } from '@/types/debug';
import type { Comment as CommentType } from '@/types/comments';
import type { PostService } from '@/types/posts';
import { addCommentToPost, deleteCommentFromPost, getCommentsByPostId } from '@/mocks/comments';
import { extractBasePostId } from '@/utils/extractBasePostId';

export const mockPostService: PostService = {
  getFeed: async (page: number = 0, size: number = 10): Promise<PostProjection[]> => {
    const user = debugSession.currentUser;
    if (!user) return [];

    const feedItems = debugSession.items.filter((item) => {
      const collection = debugSession.collections.find((c) => c.id === item.collectionId);
      if (!collection) return false;
      if (collection.isSystem) return false;

      // Show our own items, or items from users we follow (if public)
      if (item.userId === user.id) {
        return true;
      }
      if (debugSession.follows.includes(item.userId) && collection.visibility === 'PUBLIC') {
        return true;
      }
      return false;
    });

    const allPosts = deriveFeedPosts(feedItems, user);
    const start = page * size;
    const end = start + size;
    return allPosts.slice(start, end);
  },

  getFeedSync: (): PostProjection[] => {
    const user = debugSession.currentUser;
    if (!user) return [];

    const feedItems = debugSession.items.filter((item) => {
      const collection = debugSession.collections.find((c) => c.id === item.collectionId);
      if (!collection) return false;
      if (collection.isSystem) return false;

      if (item.userId === user.id) {
        return true;
      }
      if (debugSession.follows.includes(item.userId) && collection.visibility === 'PUBLIC') {
        return true;
      }
      return false;
    });

    return deriveFeedPosts(feedItems, user);
  },

  likePost: async (postId: string): Promise<void> => {
    const itemId = extractBasePostId(postId);
    const item = debugSession.items.find((i) => i.id === itemId);
    if (item) {
      item.likesCount = (item.likesCount || 0) + 1;
    }
  },

  unlikePost: async (postId: string): Promise<void> => {
    const itemId = extractBasePostId(postId);
    const item = debugSession.items.find((i) => i.id === itemId);
    if (item && item.likesCount && item.likesCount > 0) {
      item.likesCount--;
    }
  },

  getComments: async (postId: string): Promise<CommentType[]> => {
    const basePostId = extractBasePostId(postId);
    const comments = getCommentsByPostId(basePostId);
    const currentUser = debugSession.currentUser;
    return comments.map((c) => ({
      ...c,
      isAuthor: currentUser
        ? c.authorId === currentUser.id || c.authorId === 'current-user'
        : c.isAuthor,
    }));
  },

  createComment: async (postId: string, text: string): Promise<CommentType> => {
    const currentUser = debugSession.currentUser;
    const newComment: CommentType = {
      id: `mock-comment-${Date.now()}`,
      postId,
      authorId: currentUser?.id || 'current-user',
      text,
      createdAt: Date.now(),
      authorName: currentUser?.username || 'Você',
      authorAvatar: currentUser?.profilePictureUrl || 'https://via.placeholder.com/44?text=VOCÊ',
      publishedLabel: 'agora',
      isAuthor: true,
    };
    const basePostId = extractBasePostId(postId);
    addCommentToPost(basePostId, newComment);
    return newComment;
  },

  deleteComment: async (postId: string, commentId: string): Promise<void> => {
    const basePostId = extractBasePostId(postId);
    deleteCommentFromPost(basePostId, commentId);
  },
};
