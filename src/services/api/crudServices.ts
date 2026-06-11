import {
  CollectionResponse,
  CollectionService,
  CreateCollectionRequest,
  DeleteCollectionRequest,
  DeleteCollectionResponse,
  UpdateCollectionRequest,
} from '@/types/collections';
import {
  CreateItemRequest,
  DeleteItemsBulkResponse,
  ItemResponse,
  ItemService,
  MoveItemCommand,
  MoveItemsBulkCommand,
  MoveItemsResponse,
  UpdateItemRequest,
} from '@/types/items';
import {
  createCollection,
  createItem,
  deleteCollection,
  deleteItem,
  getAuthenticatedUser,
  getCollection,
  getCollectionsByUser,
  getItem,
  getItemsByCollection,
  updateCollection,
  updateItem,
} from '@/services/api/api';
import { getSessionToken } from '@/services/storage/authSession';
import { ApiError } from '@/services/api/types';
import { getApiBaseUrl } from '@/services/api/env';

const UNCATEGORIZED_NAME = 'Sem categoria';

let cachedToken: string | null = null;
let cachedUserId: string | null = null;

const isUuid = (val: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

export const getCurrentUserId = async (): Promise<string> => {
  const token = await getSessionToken();
  if (!token) {
    cachedToken = null;
    cachedUserId = null;
    throw new Error('Sessão autenticada não encontrada.');
  }

  if (cachedToken === token && cachedUserId) {
    return cachedUserId;
  }

  const parts = token.split('.');
  if (parts.length < 2) {
    throw new Error('Token inválido.');
  }
  const payload = parts[1];
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const paddingLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(paddingLength);
  const decoded =
    typeof globalThis.atob === 'function'
      ? globalThis.atob(padded)
      : Buffer.from(padded, 'base64').toString('binary');
  const claims = JSON.parse(decoded);

  // 1. Try to find a claim that is a valid UUID
  for (const key of ['userId', 'uid', 'id', 'sub']) {
    const val = claims[key];
    if (typeof val === 'string' && isUuid(val)) {
      cachedToken = token;
      cachedUserId = val;
      return val;
    }
  }

  // 2. Fallback to fetching /users/me since token lacks UUID (e.g. sub contains email)
  try {
    const user = await getAuthenticatedUser();
    if (user && user.id && isUuid(user.id)) {
      cachedToken = token;
      cachedUserId = user.id;
      return user.id;
    }
  } catch (error) {
    console.error('[getCurrentUserId] Failed to fetch authenticated user profile:', error);
  }

  throw new Error('Não foi possível obter o identificador único (UUID) do usuário.');
};

/**
 * Resolves a potentially relative remote image URL to an absolute URL using the API base URL.
 */
const resolveRemoteImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (trimmed.length === 0) return undefined;
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('file://') ||
    trimmed.startsWith('content://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  // If it starts with absolute path on device, don't touch it
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('/collections/') &&
    !trimmed.startsWith('/items/') &&
    !trimmed.startsWith('/profiles/')
  ) {
    return trimmed;
  }
  const baseUrl = getApiBaseUrl();
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
  return `${cleanBase}/${cleanPath}`;
};

/**
 * Maps a raw collection object from the API to CollectionResponse.
 * Ensures relative URLs are resolved to absolute URLs.
 */
const mapCollectionResponse = (c: any, userId?: string): CollectionResponse => {
  // Resolve a capa da coleção (seja coverImageURL, coverImageUrl ou primeiro item de imagesURL)
  const rawCover = c.coverImageURL || c.coverImageUrl || (c.imagesURL && c.imagesURL[0]);
  const resolvedCoverImageURL = resolveRemoteImageUrl(rawCover);

  // Se houver coverImageUrls, mapeia eles, senão tenta do imagesURL, senão usa rawCover
  let resolvedCoverImageUrls: string[] = [];
  if (c.coverImageUrls && c.coverImageUrls.length > 0) {
    resolvedCoverImageUrls = c.coverImageUrls
      .map((url: any) => resolveRemoteImageUrl(url))
      .filter((url: string | null): url is string => !!url);
  } else if (c.imagesURL && c.imagesURL.length > 0) {
    resolvedCoverImageUrls = c.imagesURL
      .map((url: any) => resolveRemoteImageUrl(url))
      .filter((url: string | null): url is string => !!url);
  } else if (rawCover) {
    resolvedCoverImageUrls = [resolveRemoteImageUrl(rawCover)].filter(
      (url): url is string => !!url
    );
  }

  return {
    id: c.id,
    userId: c.userId || userId || '',
    name: c.name,
    description: c.description || '',
    coverImageURL: resolvedCoverImageURL,
    coverImageUrls: resolvedCoverImageUrls,
    visibility: c.visibility || 'PUBLIC',
    followersCount: c.followersCount || 0,
    tags: c.tags || [],
    isSystem: c.isSystem || false,
    isActive: c.isActive !== false,
    createdAt: c.createdAt || new Date().toISOString(),
    updatedAt: c.updatedAt || new Date().toISOString(),
  };
};

/**
 * Maps a raw item object from the API to ItemResponse.
 * Ensures relative URLs are resolved to absolute URLs and handles imagesURL vs imageFilesUrls discrepancy.
 */
const mapItemResponse = (item: any, collectionId?: string, userId?: string): ItemResponse => {
  const rawUrls = item.imageFilesUrls || item.imagesURL || item.images || [];
  const urlsArray = Array.isArray(rawUrls) ? rawUrls : typeof rawUrls === 'string' ? [rawUrls] : [];

  const resolvedUrls = urlsArray
    .map((img: string) => resolveRemoteImageUrl(img))
    .filter((url): url is string => !!url);

  return {
    id: item.id,
    collectionId: item.collectionId || collectionId || '',
    userId: item.userId || userId || '',
    name: item.name,
    description: item.description || '',
    acquisitionDate: item.acquisitionDate,
    lastUsedDate: item.lastUsedDate,
    imageFilesUrls: resolvedUrls,
    attributes: item.attributes || {},
    likesCount: item.likesCount || 0,
    commentsCount: item.commentsCount || 0,
    tags: item.tags || [],
    isActive: item.isActive !== false,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
};

export const apiCollectionService: CollectionService = {
  create: async (input: CreateCollectionRequest): Promise<CollectionResponse> => {
    const response = await createCollection(input);
    return mapCollectionResponse(response);
  },

  getById: async (collectionId: string): Promise<CollectionResponse | null> => {
    try {
      const response = await getCollection(collectionId);
      return response ? mapCollectionResponse(response) : null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getMe: async (): Promise<CollectionResponse[]> => {
    const userId = await getCurrentUserId();
    const response = await getCollectionsByUser(userId, 0, 100);
    const rawCollections = response.collections || response.content || [];
    return rawCollections.map((c: any) => mapCollectionResponse(c, userId));
  },

  update: async (
    collectionId: string,
    input: UpdateCollectionRequest
  ): Promise<CollectionResponse> => {
    const response = await updateCollection(collectionId, input);
    return mapCollectionResponse(response);
  },

  delete: async (collectionId: string): Promise<void> => {
    return deleteCollection(collectionId);
  },

  deleteWithStrategy: async (
    request: DeleteCollectionRequest
  ): Promise<DeleteCollectionResponse> => {
    // Na API real, simplesmente apaga a coleção diretamente
    await deleteCollection(request.collectionId);
    return {
      success: true,
      deletedCollectionId: request.collectionId,
    };
  },

  getItemCount: async (collectionId: string): Promise<number> => {
    try {
      const response = await getItemsByCollection(collectionId, 0, 1);
      return response.totalElements || 0;
    } catch {
      return 0;
    }
  },

  getUncategorized: async (): Promise<CollectionResponse> => {
    const collections = await apiCollectionService.getMe();
    const uncategorized = collections.find((c) => c.isSystem && c.name === UNCATEGORIZED_NAME);
    if (uncategorized) return uncategorized;

    // Check if there is one that is named UNCATEGORIZED_NAME even if not marked as isSystem
    const uncategorizedByName = collections.find((c) => c.name === UNCATEGORIZED_NAME);
    if (uncategorizedByName) return uncategorizedByName;

    // Retorna placeholder como fallback (criação desativada na API real)
    return {
      id: '',
      userId: '',
      name: UNCATEGORIZED_NAME,
      description: 'Itens sem coleção definida.',
      visibility: 'PRIVATE',
      followersCount: 0,
      tags: [],
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
};

export const apiItemService: ItemService = {
  create: async (input: CreateItemRequest): Promise<ItemResponse> => {
    const response = await createItem(input);
    return mapItemResponse(response, input.collectionId);
  },

  getById: async (itemId: string): Promise<ItemResponse | null> => {
    try {
      const userId = await getCurrentUserId();
      const collections = await apiCollectionService.getMe();
      for (const col of collections) {
        const response = await getItemsByCollection(col.id, 0, 100);
        const rawItems = response.items || response.content || [];
        const found = rawItems.find((i: any) => i.id === itemId);
        if (found) {
          // Fetch the full item details using getItem
          const fullItem = await getItem(col.id, itemId);
          return mapItemResponse(fullItem, col.id, userId);
        }
      }
      return null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getByCollection: async (collectionId: string): Promise<ItemResponse[]> => {
    const response = await getItemsByCollection(collectionId, 0, 100);
    const rawItems = response.items || response.content || [];
    return rawItems.map((item: any) => mapItemResponse(item, collectionId));
  },

  update: async (itemId: string, input: UpdateItemRequest): Promise<ItemResponse> => {
    const response = await updateItem(itemId, input);
    return mapItemResponse(response);
  },

  delete: async (itemId: string): Promise<void> => {
    return deleteItem(itemId);
  },

  getUserItems: async (userId: string): Promise<ItemResponse[]> => {
    const collections = await apiCollectionService.getMe();
    const allItems: ItemResponse[] = [];
    for (const col of collections) {
      try {
        const response = await getItemsByCollection(col.id, 0, 100);
        const rawItems = response.items || response.content || [];
        const mappedItems = rawItems.map((item: any) => mapItemResponse(item, col.id, userId));
        allItems.push(...mappedItems);
      } catch (error) {
        console.warn(`[apiItemService] Failed to fetch items for collection ${col.id}:`, error);
      }
    }
    return allItems;
  },

  moveItem: async (command: MoveItemCommand): Promise<ItemResponse> => {
    return apiItemService.update(command.itemId, {
      id: command.itemId,
      collectionId: command.targetCollectionId,
    });
  },

  moveItemsBulk: async (command: MoveItemsBulkCommand): Promise<MoveItemsResponse> => {
    const movedItemIds: string[] = [];
    const failedItemIds: string[] = [];

    await Promise.all(
      command.itemIds.map(async (itemId) => {
        try {
          await apiItemService.moveItem({
            itemId,
            targetCollectionId: command.targetCollectionId,
            sourceCollectionId: command.sourceCollectionId,
          });
          movedItemIds.push(itemId);
        } catch {
          failedItemIds.push(itemId);
        }
      })
    );

    return {
      success: failedItemIds.length === 0,
      movedItemIds,
      failedItemIds: failedItemIds.length > 0 ? failedItemIds : undefined,
    };
  },

  deleteItemsBulk: async (itemIds: string[]): Promise<DeleteItemsBulkResponse> => {
    const deletedItemIds: string[] = [];
    const failedItemIds: string[] = [];

    await Promise.all(
      itemIds.map(async (id) => {
        try {
          await deleteItem(id);
          deletedItemIds.push(id);
        } catch {
          failedItemIds.push(id);
        }
      })
    );

    return {
      success: failedItemIds.length === 0,
      deletedItemIds,
      failedItemIds: failedItemIds.length > 0 ? failedItemIds : undefined,
    };
  },
};
