import api from '@/services/api/api';
import type { Comment as CommentType } from '@/types/comments';
import type {
  CreateCommentResponse,
  FeedResponse,
  ItemCommentPageResponse,
  PostProjection,
} from '@/types/debug';
import type { PostService } from '@/types/posts';
import { extractBasePostId } from '@/utils/extractBasePostId';
import { getSessionToken } from '@/services/storage/authSession';

const decodeUserIdFromToken = async (): Promise<string | null> => {
  try {
    const token = await getSessionToken();
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const decoded =
      typeof globalThis.atob === 'function'
        ? globalThis.atob(padded)
        : Buffer.from(padded, 'base64').toString('binary');
    const claims = JSON.parse(decoded);
    return claims.userId || claims.uid || claims.id || claims.sub || null;
  } catch {
    return null;
  }
};

export const apiPostService: PostService = {
  getFeed: async (page: number = 0, size: number = 10): Promise<PostProjection[]> => {
    const response = await api.get<FeedResponse>('social/feed', {
      params: { page, size },
    });

    if (!response || !response.content) {
      return [];
    }

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
  },

  likePost: async (postId: string): Promise<void> => {
    const itemId = extractBasePostId(postId);
    await api.post(`items/like/${itemId}`);
  },

  unlikePost: async (postId: string): Promise<void> => {
    const itemId = extractBasePostId(postId);
    await api.delete(`items/like/${itemId}`);
  },

  getComments: async (postId: string): Promise<CommentType[]> => {
    const itemId = extractBasePostId(postId);
    const response = await api.get<ItemCommentPageResponse>(`items/comments/${itemId}`);

    if (!response || !response.commenterSummaries) {
      return [];
    }

    const currentUserId = await decodeUserIdFromToken();

    return response.commenterSummaries.map((summary) => ({
      id: summary.commentId,
      postId,
      authorId: summary.userId,
      createdAt: new Date(summary.createdAt).getTime(),
      text: summary.content,
      authorName: summary.username,
      authorAvatar:
        summary.profilePictureURL ||
        `https://via.placeholder.com/44?text=${summary.username[0]?.toUpperCase() || 'U'}`,
      publishedLabel: 'agora',
      isAuthor: currentUserId ? summary.userId === currentUserId : false,
    }));
  },

  createComment: async (postId: string, text: string): Promise<CommentType> => {
    const itemId = extractBasePostId(postId);
    const response = await api.post<CreateCommentResponse>(`items/comment/${itemId}`, {
      content: text,
    });

    return {
      id: response.commentId,
      postId,
      authorId: response.userId,
      createdAt: new Date(response.createdAt).getTime(),
      text: response.content,
      authorName: 'Você',
      authorAvatar: 'https://via.placeholder.com/44?text=VOCÊ',
      publishedLabel: 'agora',
      isAuthor: true,
    };
  },

  deleteComment: async (_postId: string, commentId: string): Promise<void> => {
    await api.delete(`items/comment/${commentId}`);
  },
};
