import api from './api';
import { isDebugModeEnabled } from '../debug/debugFlags';
import { debugSession } from '../debug/debugSession';
import { MOCK_EXPLORE_SPOTLIGHTS } from '@/mocks/explore';

export interface ExploreCard {
  id: string;
  context: string;
  imageUrls: any[];
  tags: string[];
  title?: string;
  description?: string;
  username?: string;
  userId?: string;
  postedBy?: string;
  postedById?: string;
  postedAt?: string;
  height?: number;
  subtitle?: string;
  caption?: string;
}

export interface ExploreResponse {
  content: ExploreCard[];
  size: number;
  currentPage: number;
  hasNext: boolean;
}

export const socialService = {
  getExplore: async (page: number, size: number): Promise<ExploreResponse> => {
    if (isDebugModeEnabled()) {
      if (!debugSession.isInitialized) {
        debugSession.initialize();
      }

      // Convert all public collections from debugSession into ExploreCard items
      const collectionsCards = debugSession.collections
        .filter((c: any) => !c.isSystem && c.visibility === 'PUBLIC')
        .map((c: any) => {
          const author = debugSession.users.find((u: any) => u.id === c.userId);
          const urls =
            c.coverImageUrls && c.coverImageUrls.length
              ? c.coverImageUrls
              : c.coverImageURL
                ? [c.coverImageURL]
                : [];
          return {
            id: c.id,
            context: 'COLLECTION',
            imageUrls: urls,
            tags: c.tags || [],
            title: c.name,
            description: c.description || '',
            username: author?.username || 'user',
            userId: c.userId,
            postedBy: author?.username || 'user',
            postedById: c.userId,
            postedAt: 'agora',
            height: 210,
          } satisfies ExploreCard;
        });

      // Convert all public items from debugSession into ExploreCard items
      const itemsCards = debugSession.items
        .filter((i: any) => {
          const col = debugSession.collections.find((c: any) => c.id === i.collectionId);
          return col && col.visibility === 'PUBLIC';
        })
        .map((i: any) => {
          const author = debugSession.users.find((u: any) => u.id === i.userId);
          return {
            id: i.id,
            context: 'ITEM',
            imageUrls: i.imageFilesUrls || [],
            tags: i.tags || [],
            title: i.name,
            description: i.description || '',
            username: author?.username || 'user',
            userId: i.userId,
            postedBy: author?.username || 'user',
            postedById: i.userId,
            postedAt: 'agora',
            height: 230,
          } satisfies ExploreCard;
        });

      // Load original fallback spotlights, converting them to ExploreCard shape
      const fallbackCards = MOCK_EXPLORE_SPOTLIGHTS.map((spot: any) => ({
        id: spot.id,
        context: spot.postType === 'item' ? 'ITEM' : 'COLLECTION',
        imageUrls: spot.images || [],
        tags: spot.tags || [],
        title: spot.title,
        description: spot.subtitle || spot.caption || '',
        username: spot.postedBy,
        userId: 'mock-user-id',
        postedBy: spot.postedBy,
        postedById: 'mock-user-id',
        postedAt: spot.postedAt || 'agora',
        height: spot.height || 214,
      })) satisfies ExploreCard[];

      const allCards = [...collectionsCards, ...itemsCards, ...fallbackCards];

      const start = page * size;
      const end = start + size;
      const paginated = allCards.slice(start, end);

      return {
        content: paginated,
        size,
        currentPage: page,
        hasNext: end < allCards.length,
      };
    }

    return api.get<ExploreResponse>('social/explore', {
      params: { page, size },
    });
  },
};
