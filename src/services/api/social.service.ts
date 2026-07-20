import api from './api';
import { isDebugModeEnabled } from '../debug/debugFlags';
import { debugSession } from '../debug/debugSession';
import { MOCK_EXPLORE_SPOTLIGHTS } from '@/mocks/explore';
import type {
  ExploreGlobalSearchResponse,
  ExploreTagSearchResponse,
  ExploreTagSearchResult,
} from '@/types/explore';

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

const stripTagPrefix = (value: string): string => {
  return value.replace(/^#/, '').trim();
};

const normalizeSearchTerm = (value: string): string => {
  return value.trim().toLowerCase();
};

const getDebugExploreCorpus = async (): Promise<ExploreCard[]> => {
  if (!debugSession.isInitialized) {
    debugSession.initialize();
  }

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

  return [...collectionsCards, ...itemsCards, ...fallbackCards];
};

const searchDebugGlobal = async (
  term: string,
  page: number,
  size: number
): Promise<ExploreGlobalSearchResponse> => {
  const normalizedTerm = normalizeSearchTerm(term);
  const corpus = await getDebugExploreCorpus();

  const results = Array.from(
    new Set(
      corpus
        .filter((card) => {
          const searchableValues = [
            card.title || '',
            card.description || '',
            card.subtitle || '',
            card.caption || '',
            card.username || '',
            card.postedBy || '',
            ...(card.tags || []),
          ].map((value) => value.toLowerCase());

          return searchableValues.some((value) => value.includes(normalizedTerm));
        })
        .map((card) => card.title || card.description || card.postedBy || '')
        .filter((value) => value.length > 0)
    )
  );

  const start = page * size;

  return {
    content: results.slice(start, start + size),
    size,
    currentPage: page,
    hasNext: start + size < results.length,
  };
};

const searchDebugByTag = async (
  term: string,
  page: number,
  size: number
): Promise<ExploreTagSearchResponse> => {
  const normalizedTerm = normalizeSearchTerm(stripTagPrefix(term));
  const corpus = await getDebugExploreCorpus();
  const tagMap = new Map<string, ExploreTagSearchResult>();

  corpus.forEach((card) => {
    card.tags.forEach((tag) => {
      const tagName = stripTagPrefix(tag);
      const normalizedTag = tagName.toLowerCase();

      if (!normalizedTag.includes(normalizedTerm)) {
        return;
      }

      const existingTag = tagMap.get(normalizedTag);

      if (existingTag) {
        existingTag.usageCount += 1;
        return;
      }

      tagMap.set(normalizedTag, {
        id: normalizedTag,
        name: tagName,
        usageCount: 1,
      });
    });
  });

  const results = Array.from(tagMap.values()).sort((left, right) => {
    if (right.usageCount !== left.usageCount) {
      return right.usageCount - left.usageCount;
    }

    return left.name.localeCompare(right.name);
  });

  const totalElements = results.length;
  const totalPages = totalElements > 0 ? Math.ceil(totalElements / size) : 0;
  const start = page * size;

  return {
    content: results.slice(start, start + size),
    totalPages,
    totalElements,
    currentPage: page,
  };
};

export const socialService = {
  getExplore: async (page: number, size: number): Promise<ExploreResponse> => {
    if (isDebugModeEnabled()) {
      const allCards = await getDebugExploreCorpus();

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

  searchExplore: async (
    term: string,
    page = 0,
    size = 10
  ): Promise<ExploreGlobalSearchResponse> => {
    if (isDebugModeEnabled()) {
      return searchDebugGlobal(term, page, size);
    }

    return api.get<ExploreGlobalSearchResponse>('social/search', {
      params: { term, page, size },
    });
  },

  searchExploreByTag: async (
    term: string,
    page = 0,
    size = 5
  ): Promise<ExploreTagSearchResponse> => {
    if (isDebugModeEnabled()) {
      return searchDebugByTag(term, page, size);
    }

    return api.get<ExploreTagSearchResponse>('social/search/by-tag', {
      params: { term: stripTagPrefix(term), page, size },
    });
  },
};
