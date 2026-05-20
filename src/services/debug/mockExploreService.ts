import { MOCK_EXPLORE_CATEGORIES, MOCK_EXPLORE_SPOTLIGHTS } from '@/mocks/explore';
import type { ExploreCategory, ExploreSpotlight } from '@/types/explore';
import { debugSession } from './debugSession';

const normalizeTag = (tag: string): string => {
  if (!tag) {
    return tag;
  }

  return tag.startsWith('#') ? tag : `#${tag}`;
};

const mapCollectionToSpotlight = (collection: any, user: any): ExploreSpotlight => {
  const images = (
    collection.coverImageUrls && collection.coverImageUrls.length
      ? collection.coverImageUrls
      : collection.coverImageURL
        ? [collection.coverImageURL]
        : []
  ) as string[];

  return {
    id: collection.id,
    postType: 'collection',
    title: collection.name,
    subtitle: collection.description || '',
    caption: collection.description || '',
    postedBy: user?.username ?? 'debug',
    postedById: user?.id,
    postedAt: 'agora',
    images: images.map((uri) => ({ uri })),
    tags: (collection.tags ?? []).map(normalizeTag),
    categoryId: 'collections',
    collectionId: collection.id,
    height: 210,
  } as ExploreSpotlight;
};

export const mockExploreService = {
  getCategories: async (): Promise<ExploreCategory[]> => {
    return MOCK_EXPLORE_CATEGORIES;
  },

  getSpotlights: async (): Promise<ExploreSpotlight[]> => {
    const base = MOCK_EXPLORE_SPOTLIGHTS as ExploreSpotlight[];

    // if debug session initialized, include the user's collections as spotlights
    if (debugSession.isInitialized && debugSession.currentUser) {
      const fromDebug = debugSession.collections.map((c) =>
        mapCollectionToSpotlight(c, debugSession.currentUser)
      );
      return [...fromDebug, ...base];
    }

    return base;
  },
};
