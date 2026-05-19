import { debugSession } from './debugSession';
import { deriveFeedPosts } from './postDerivation';
import { PostProjection } from '@/types/debug';

export const mockPostService = {
  getFeed: async (): Promise<PostProjection[]> => {
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
    // postId is `post-${item.id}`
    const itemId = postId.replace('post-', '');
    const item = debugSession.items.find((i) => i.id === itemId);
    if (item) {
      item.likesCount = (item.likesCount || 0) + 1;
    }
  },

  unlikePost: async (postId: string): Promise<void> => {
    const itemId = postId.replace('post-', '');
    const item = debugSession.items.find((i) => i.id === itemId);
    if (item && item.likesCount && item.likesCount > 0) {
      item.likesCount--;
    }
  },
};

export type PostService = typeof mockPostService;
