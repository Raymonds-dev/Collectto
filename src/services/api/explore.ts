import type { ImageSourcePropType } from 'react-native';
import api, { getUserById } from '@/services/api/api';
import { isDebugModeEnabled, mockExploreService } from '@/services/debug';
import { debugSession } from '@/services/debug/debugSession';
import type { CollectionResponse } from '@/types/collections';
import type {
  ExploreAuthorSummary,
  ExploreCategory,
  ExploreFeedQuery,
  ExploreSpotlight,
  ExploreSpotlightType,
} from '@/types/explore';
import type { ItemPageResponse, ItemSummaryResponse } from '@/types/items';

const DEFAULT_EXPLORE_CATEGORIES: ExploreCategory[] = [
  { id: 'all', label: 'Todos' },
  { id: 'collections', label: 'Coleções' },
  { id: 'items', label: 'Itens' },
];

const toImageSources = (urls: string[]): ImageSourcePropType[] => {
  return urls.map((url) => ({ uri: url }));
};

type ExploreSpotlightApiEntry = {
  id: string;
  title?: string;
  subtitle?: string;
  caption?: string;
  postType?: ExploreSpotlightType;
  context?: string;
  postedBy?: ExploreAuthorSummary | string;
  postedAt?: string;
  images?: string[];
  imageUrls?: string[];
  tags?: string[];
  categoryId?: string;
  collectionId?: string;
  itemId?: string;
  height?: number;
};

type ExploreSpotlightsApiResponse = {
  content?: ExploreSpotlightApiEntry[];
  items?: ExploreSpotlightApiEntry[];
  size?: number;
  currentPage?: number;
  hasNext?: boolean;
  totalElements?: number;
  totalPages?: number;
};

const buildExploreParams = (query: ExploreFeedQuery): Record<string, string | number> => {
  const params: Record<string, string | number> = {
    page: query.page ?? 0,
    size: query.size ?? 24,
  };

  if (query.q) {
    params.q = query.q;
  }

  if (query.categoryId) {
    params.categoryId = query.categoryId;
  }

  if (query.postType) {
    params.postType = query.postType;
  }

  return params;
};

const resolvePostType = (entry: ExploreSpotlightApiEntry): ExploreSpotlightType => {
  if (entry.postType) {
    return entry.postType;
  }

  return entry.itemId ? 'item' : 'collection';
};

const resolvePostedBy = (postedBy?: ExploreAuthorSummary | string): string => {
  if (!postedBy) {
    return 'collectto';
  }

  return typeof postedBy === 'string' ? postedBy : postedBy.username;
};

const mapExploreSpotlight = (entry: ExploreSpotlightApiEntry): ExploreSpotlight => {
  const postType = resolvePostType(entry);
  const imageUrls = entry.images || entry.imageUrls || [];

  return {
    id: entry.id,
    postType,
    title: entry.title || entry.caption || entry.subtitle || 'Destaques',
    subtitle: entry.subtitle || entry.caption || '',
    caption: entry.caption || entry.subtitle || '',
    postedBy: resolvePostedBy(entry.postedBy),
    postedAt: entry.postedAt || 'agora',
    images: toImageSources(imageUrls.slice(0, 3)),
    tags: entry.tags || [],
    categoryId: entry.categoryId || (postType === 'item' ? 'items' : 'collections'),
    collectionId: entry.collectionId,
    itemId: entry.itemId,
    height: entry.height || 214,
  };
};

const getExploreSpotlightEntries = (
  data: ExploreSpotlightsApiResponse
): ExploreSpotlightApiEntry[] => {
  return data.content || data.items || [];
};

const getCollectionById = async (collectionId: string): Promise<CollectionResponse> => {
  return api.get<CollectionResponse>(`collections/${collectionId}`);
};

const getItemsByCollection = async (collectionId: string): Promise<ItemPageResponse> => {
  return api.get<ItemPageResponse>(`items/by-collection/${collectionId}`);
};

const findItemInCollection = async (
  collectionId: string,
  itemId: string
): Promise<ItemSummaryResponse | null> => {
  let currentPage = 0;

  while (true) {
    const itemsPage = await api.get<ItemPageResponse>(`items/by-collection/${collectionId}`, {
      params: { page: currentPage, size: 50 },
    });

    const foundItem = itemsPage.items.find((entry) => entry.id === itemId);

    if (foundItem) {
      return foundItem;
    }

    if (currentPage >= itemsPage.totalPages - 1) {
      return null;
    }

    currentPage += 1;
  }
};

const mapCollectionToSpotlight = async (
  collection: CollectionResponse
): Promise<ExploreSpotlight> => {
  const author = await getUserById(collection.userId);
  const itemsPage = await getItemsByCollection(collection.id).catch(() => null);

  const imageUrls = collection.coverImageUrls?.length
    ? collection.coverImageUrls
    : collection.coverImageURL
      ? [collection.coverImageURL]
      : itemsPage?.items?.flatMap((item) => item.imageFilesUrls || []) || [];

  return {
    id: collection.id,
    postType: 'collection',
    title: collection.name,
    subtitle: collection.description,
    caption: collection.description,
    postedBy: author.username,
    postedById: author.id,
    postedAt: collection.createdAt,
    images: toImageSources(imageUrls.slice(0, 3)),
    tags: collection.tags || [],
    categoryId: 'collections',
    collectionId: collection.id,
    height: 214,
  };
};

const mapItemSummaryToSpotlight = async (
  collectionId: string,
  item: ItemSummaryResponse
): Promise<ExploreSpotlight> => {
  const collection = await getCollectionById(collectionId);
  const author = await getUserById(collection.userId);

  return {
    id: item.id,
    postType: 'item',
    title: item.name,
    subtitle: undefined,
    caption: undefined,
    postedBy: author.username,
    postedById: author.id,
    postedAt: collection.createdAt,
    images: toImageSources(item.imageFilesUrls.slice(0, 3)),
    tags: collection.tags || [],
    categoryId: 'items',
    collectionId,
    itemId: item.id,
    height: 214,
  };
};

export const getExploreCategories = async (): Promise<ExploreCategory[]> => {
  if (isDebugModeEnabled()) {
    return mockExploreService.getCategories();
  }

  // Não existe endpoint dedicado ainda. Mantemos fallback local até o backend expor isso.
  return DEFAULT_EXPLORE_CATEGORIES;
};

export const getExploreSpotlights = async (
  query: ExploreFeedQuery = {}
): Promise<ExploreSpotlight[]> => {
  if (isDebugModeEnabled()) {
    return mockExploreService.getSpotlights();
  }

  const data = await api.get<ExploreSpotlightsApiResponse>('social/explore', {
    params: buildExploreParams(query),
  });

  return getExploreSpotlightEntries(data).map(mapExploreSpotlight);
};

export const getExploreCollectionSpotlight = async (
  collectionId: string
): Promise<ExploreSpotlight> => {
  if (isDebugModeEnabled()) {
    const spotlight = debugSession.collections.find((collection) => collection.id === collectionId);
    if (spotlight) {
      const imageUrls = [
        ...(spotlight.coverImageUrls || []),
        ...(spotlight.coverImageURL ? [spotlight.coverImageURL] : []),
      ];

      return {
        id: spotlight.id,
        postType: 'collection',
        title: spotlight.name,
        subtitle: spotlight.description,
        caption: spotlight.description,
        postedBy: debugSession.currentUser?.username || spotlight.userId,
        postedById: debugSession.currentUser?.id,
        postedAt: spotlight.createdAt,
        images: toImageSources(imageUrls),
        tags: spotlight.tags || [],
        categoryId: 'collections',
        collectionId: spotlight.id,
        height: 214,
      };
    }

    return mockExploreService.getSpotlights().then((items) => {
      const fallback = items.find(
        (item) => item.collectionId === collectionId && item.postType === 'collection'
      );
      if (!fallback) {
        throw new Error('Explore spotlight not found in debug mode.');
      }
      return fallback;
    });
  }

  const collection = await getCollectionById(collectionId);
  return mapCollectionToSpotlight(collection);
};

export const getExploreItemSpotlight = async (
  collectionId: string,
  itemId: string
): Promise<ExploreSpotlight> => {
  if (isDebugModeEnabled()) {
    const item = debugSession.items.find(
      (entry) => entry.id === itemId && entry.collectionId === collectionId
    );
    if (!item) {
      throw new Error('Explore item not found in debug mode.');
    }

    return {
      id: item.id,
      postType: 'item',
      title: item.name,
      subtitle: item.description,
      caption: item.description,
      postedBy: debugSession.currentUser?.username || item.userId,
      postedById: debugSession.currentUser?.id,
      postedAt: item.createdAt,
      images: toImageSources(item.imageFilesUrls.slice(0, 3)),
      tags: item.tags || [],
      categoryId: 'items',
      collectionId,
      itemId: item.id,
      height: 214,
    };
  }

  const item = await findItemInCollection(collectionId, itemId);

  if (!item) {
    throw new Error('Item not found in collection.');
  }

  return mapItemSummaryToSpotlight(collectionId, item);
};

export const getExploreCardPreview = async (
  input:
    | { postType: 'collection'; collectionId: string }
    | { postType: 'item'; collectionId: string; itemId: string }
): Promise<ExploreSpotlight> => {
  if (input.postType === 'collection') {
    return getExploreCollectionSpotlight(input.collectionId);
  }

  return getExploreItemSpotlight(input.collectionId, input.itemId);
};
