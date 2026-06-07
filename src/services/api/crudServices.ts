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
  getItemsByCollection,
  updateCollection,
  updateItem,
} from '@/services/api/api';
import { api as client } from '@/services/api/client';
import { getSessionToken } from '@/services/storage/authSession';
import { ApiError } from '@/services/api/types';

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

export const apiCollectionService: CollectionService = {
  create: async (input: CreateCollectionRequest): Promise<CollectionResponse> => {
    return createCollection(input);
  },

  getById: async (collectionId: string): Promise<CollectionResponse | null> => {
    try {
      return await getCollection(collectionId);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getMe: async (): Promise<CollectionResponse[]> => {
    const userId = await getCurrentUserId();
    const response = await getCollectionsByUser(userId, 1, 100);
    return response.content || [];
  },

  update: async (
    collectionId: string,
    input: UpdateCollectionRequest
  ): Promise<CollectionResponse> => {
    return updateCollection(collectionId, input);
  },

  delete: async (collectionId: string): Promise<void> => {
    return deleteCollection(collectionId);
  },

  deleteWithStrategy: async (
    request: DeleteCollectionRequest
  ): Promise<DeleteCollectionResponse> => {
    // 1. Get all items in the collection
    const itemsResponse = await getItemsByCollection(request.collectionId, 1, 1000);
    const items = itemsResponse.content || [];

    if (request.strategy === 'MOVE_TO_UNCATEGORIZED') {
      const targetId = request.uncategorizedCollectionId;
      if (!targetId) {
        throw new Error('Coleção de destino não especificada para mover os itens.');
      }

      // Move items
      const itemIds = items.map((i) => i.id);
      await apiItemService.moveItemsBulk({
        itemIds,
        targetCollectionId: targetId,
        sourceCollectionId: request.collectionId,
      });

      // Delete the collection
      await deleteCollection(request.collectionId);

      return {
        success: true,
        deletedCollectionId: request.collectionId,
        movedItemsCount: items.length,
      };
    } else {
      // DELETE_ALL_ITEMS strategy
      // Delete items
      const itemIds = items.map((i) => i.id);
      await apiItemService.deleteItemsBulk(itemIds);

      // Delete the collection
      await deleteCollection(request.collectionId);

      return {
        success: true,
        deletedCollectionId: request.collectionId,
        deletedItemsCount: items.length,
      };
    }
  },

  getItemCount: async (collectionId: string): Promise<number> => {
    try {
      const response = await getItemsByCollection(collectionId, 1, 1);
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

    // Create if not exists
    return createCollection({
      name: UNCATEGORIZED_NAME,
      description: 'Itens sem coleção definida.',
      tags: [],
    });
  },
};

export const apiItemService: ItemService = {
  create: async (input: CreateItemRequest): Promise<ItemResponse> => {
    return createItem(input);
  },

  getById: async (itemId: string): Promise<ItemResponse | null> => {
    try {
      const userId = await getCurrentUserId();
      const items = await apiItemService.getUserItems(userId);
      return items.find((i) => i.id === itemId) || null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getByCollection: async (collectionId: string): Promise<ItemResponse[]> => {
    const response = await getItemsByCollection(collectionId, 1, 100);
    return response.content || [];
  },

  update: async (itemId: string, input: UpdateItemRequest): Promise<ItemResponse> => {
    return updateItem(itemId, input);
  },

  delete: async (itemId: string): Promise<void> => {
    return deleteItem(itemId);
  },

  getUserItems: async (userId: string): Promise<ItemResponse[]> => {
    const collections = await apiCollectionService.getMe();
    const allItems: ItemResponse[] = [];
    for (const col of collections) {
      try {
        const response = await getItemsByCollection(col.id, 1, 100);
        if (response && response.content) {
          allItems.push(...response.content);
        }
      } catch (error) {
        console.warn(`[apiItemService] Failed to fetch items for collection ${col.id}:`, error);
      }
    }
    return allItems;
  },

  moveItem: async (command: MoveItemCommand): Promise<ItemResponse> => {
    // If target is same as source, no-op
    if (command.sourceCollectionId === command.targetCollectionId) {
      const item = await apiItemService.getById(command.itemId);
      if (!item) throw new Error('Item não encontrado.');
      return item;
    }

    try {
      const response = await client.patch<ItemResponse>(`items/update/${command.itemId}`, {
        collectionId: command.targetCollectionId,
      });
      return response;
    } catch (error) {
      console.error('[apiItemService] Failed to move item via patch:', error);
      throw error;
    }
  },

  moveItemsBulk: async (command: MoveItemsBulkCommand): Promise<MoveItemsResponse> => {
    const movedItemIds: string[] = [];
    const failedItemIds: string[] = [];

    for (const itemId of command.itemIds) {
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
    }

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
