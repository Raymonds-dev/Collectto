import { debugSession } from './debugSession';
import { deriveFeedPosts } from './postDerivation';
import {
  CreateCommentResponse,
  FeedResponse,
  ItemCommentPageResponse,
  PostProjection,
} from '@/types/debug';
import api from '@/services/api/api';
import { Comment as CommentType } from '@/types/comments';
import { addCommentToPost, deleteCommentFromPost, getCommentsByPostId } from '@/mocks/comments';
import { extractBasePostId } from '@/utils/extractBasePostId';
import { isDebugModeEnabled } from './debugFlags';

export const mockPostService = {
  getFeed: async (page: number = 0, size: number = 10): Promise<PostProjection[]> => {
    if (isDebugModeEnabled()) {
      const user = debugSession.currentUser;
      if (!user) return [];

      const feedItems = debugSession.items.filter((item) => {
        const collection = debugSession.collections.find((c) => c.id === item.collectionId);
        if (!collection) return false;
        if (collection.isSystem) return false;
        if (collection.visibility === 'PRIVATE') return false;
        return true;
      });

      return deriveFeedPosts(feedItems, user);
    }

    try {
      const response = await api.get<FeedResponse>('social/feed', {
        params: { page, size },
      });
      if (!response || !response.content) return [];

      return response.content.map((summary) => ({
        id: `post-${summary.item.id}`,
        author: {
          id: summary.source.id,
          name: summary.source.username || summary.source.collectionName || 'Colecionador',
          username: summary.source.username || 'colecionador',
          profilePictureUrl: summary.source.avatarUrl || undefined,
        },
        item: summary.item,
        likesCount: summary.item.likesCount || 0,
        commentsCount: summary.item.commentsCount || 0,
        isLiked: false,
        createdAt: summary.item.createdAt,
      }));
    } catch (error) {
      console.warn('Error fetching feed from API, falling back to mock:', error);
      const user = debugSession.currentUser;
      if (!user) return [];

      const feedItems = debugSession.items.filter((item) => {
        const collection = debugSession.collections.find((c) => c.id === item.collectionId);
        if (!collection) return false;
        if (collection.isSystem) return false;
        if (collection.visibility === 'PRIVATE') return false;
        return true;
      });

      return deriveFeedPosts(feedItems, user);
    }
  },

  getFeedSync: (): PostProjection[] => {
    const user = debugSession.currentUser;
    if (!user) return [];

    const feedItems = debugSession.items.filter((item) => {
      const collection = debugSession.collections.find((c) => c.id === item.collectionId);
      if (!collection) return false;
      if (collection.isSystem) return false;
      if (collection.visibility === 'PRIVATE') return false;
      return true;
    });

    return deriveFeedPosts(feedItems, user);
  },

  likePost: async (postId: string): Promise<void> => {
    const itemId = postId.replace('post-', '');
    if (isDebugModeEnabled()) {
      const item = debugSession.items.find((i) => i.id === itemId);
      if (item) {
        item.likesCount = (item.likesCount || 0) + 1;
      }
      return;
    }

    try {
      await api.post(`items/like/${itemId}`);
    } catch (error) {
      console.warn('Error sending like to API:', error);
      const item = debugSession.items.find((i) => i.id === itemId);
      if (item) {
        item.likesCount = (item.likesCount || 0) + 1;
      } else {
        throw error;
      }
    }
  },

  unlikePost: async (postId: string): Promise<void> => {
    const itemId = postId.replace('post-', '');
    if (isDebugModeEnabled()) {
      const item = debugSession.items.find((i) => i.id === itemId);
      if (item && item.likesCount && item.likesCount > 0) {
        item.likesCount--;
      }
      return;
    }

    try {
      await api.delete(`items/like/${itemId}`);
    } catch (error) {
      console.warn('Error sending unlike to API:', error);
      const item = debugSession.items.find((i) => i.id === itemId);
      if (item && item.likesCount && item.likesCount > 0) {
        item.likesCount--;
      } else {
        throw error;
      }
    }
  },

  getComments: async (postId: string): Promise<CommentType[]> => {
    if (isDebugModeEnabled()) {
      const basePostId = extractBasePostId(postId);
      const comments = getCommentsByPostId(basePostId);
      const currentUser = debugSession.currentUser;
      return comments.map((c) => ({
        ...c,
        isAuthor: currentUser
          ? c.authorId === currentUser.id || c.authorId === 'current-user'
          : c.isAuthor,
      }));
    }

    const itemId = postId.replace('post-', '');
    try {
      const response = await api.get<ItemCommentPageResponse>(`items/comments/${itemId}`);
      if (!response || !response.commenterSummaries) return [];

      const currentUser = debugSession.currentUser;
      return response.commenterSummaries.map((summary) => ({
        id: summary.commentId,
        postId,
        authorId: summary.userId,
        createdAt: new Date(summary.createdAt).getTime(),
        text: summary.content,
        authorName: summary.username,
        authorAvatar:
          summary.profilePictureURL ||
          `https://via.placeholder.com/44?text=${summary.username[0].toUpperCase()}`,
        publishedLabel: 'agora',
        isAuthor: currentUser ? summary.userId === currentUser.id : false,
      }));
    } catch (error) {
      console.warn('Error fetching comments from API, falling back to mock:', error);
      const basePostId = extractBasePostId(postId);
      const comments = getCommentsByPostId(basePostId);
      const currentUser = debugSession.currentUser;
      return comments.map((c) => ({
        ...c,
        isAuthor: currentUser
          ? c.authorId === currentUser.id || c.authorId === 'current-user'
          : c.isAuthor,
      }));
    }
  },

  createComment: async (postId: string, text: string): Promise<CommentType> => {
    if (isDebugModeEnabled()) {
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
    }

    const itemId = postId.replace('post-', '');
    try {
      const response = await api.post<CreateCommentResponse>(`items/comment/${itemId}`, {
        content: text,
      });
      const currentUser = debugSession.currentUser;
      return {
        id: response.commentId,
        postId,
        authorId: response.userId,
        createdAt: new Date(response.createdAt).getTime(),
        text: response.content,
        authorName: currentUser?.username || 'Você',
        authorAvatar: currentUser?.profilePictureUrl || 'https://via.placeholder.com/44?text=VOCÊ',
        publishedLabel: 'agora',
        isAuthor: true,
      };
    } catch (error) {
      console.warn('Error creating comment on API, falling back to mock:', error);
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
    }
  },

  deleteComment: async (postId: string, commentId: string): Promise<void> => {
    if (isDebugModeEnabled()) {
      const basePostId = extractBasePostId(postId);
      deleteCommentFromPost(basePostId, commentId);
      return;
    }

    try {
      await api.delete(`items/comment/${commentId}`);
    } catch (error) {
      console.warn('Error deleting comment from API, falling back to mock:', error);
      const basePostId = extractBasePostId(postId);
      deleteCommentFromPost(basePostId, commentId);
    }
  },
};

export type PostService = typeof mockPostService;
