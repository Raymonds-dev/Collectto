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
import { debugSession } from './debugSession';

export const mockItemService: ItemService = {
  create: async (input: CreateItemRequest): Promise<ItemResponse> => {
    const newItem: ItemResponse = {
      id: `item-${Date.now()}`,
      collectionId: input.collectionId,
      userId: debugSession.currentUser?.id || '',
      name: input.name,
      description: input.description || '',
      acquisitionDate: input.acquisitionDate || undefined,
      lastUsedDate: input.lastUsedDate || undefined,
      imageFilesUrls: input.imageFilesUrls || [],
      attributes: input.attributes || undefined,
      likesCount: 0,
      commentsCount: 0,
      tags: input.tags || undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    debugSession.items.push(newItem);
    return newItem;
  },

  getById: async (itemId: string): Promise<ItemResponse | null> => {
    return debugSession.items.find((i) => i.id === itemId) || null;
  },

  getByCollection: async (collectionId: string): Promise<ItemResponse[]> => {
    return debugSession.items.filter((i) => i.collectionId === collectionId);
  },

  update: async (itemId: string, input: UpdateItemRequest): Promise<ItemResponse> => {
    const idx = debugSession.items.findIndex((i) => i.id === itemId);
    if (idx === -1) throw new Error('Item not found');
    const updated = {
      ...debugSession.items[idx],
      ...input,
      imageFilesUrls: input.imageFilesUrls || debugSession.items[idx].imageFilesUrls,
      updatedAt: new Date().toISOString(),
    };
    debugSession.items[idx] = updated;
    return updated;
  },

  delete: async (itemId: string): Promise<void> => {
    debugSession.items = debugSession.items.filter((i) => i.id !== itemId);
  },

  getUserItems: async (userId: string): Promise<ItemResponse[]> => {
    return debugSession.items.filter((i) => i.userId === userId);
  },

  moveItem: async (command: MoveItemCommand): Promise<ItemResponse> => {
    const idx = debugSession.items.findIndex((i) => i.id === command.itemId);
    if (idx === -1) throw new Error('Item not found');

    // Prevent move to same collection (no-op)
    if (debugSession.items[idx].collectionId === command.targetCollectionId) {
      return debugSession.items[idx];
    }

    const targetCollection = debugSession.collections.find(
      (c) => c.id === command.targetCollectionId
    );
    if (!targetCollection) throw new Error('Target collection not found');

    const updated = {
      ...debugSession.items[idx],
      collectionId: command.targetCollectionId,
      updatedAt: new Date().toISOString(),
    };
    debugSession.items[idx] = updated;
    return updated;
  },

  moveItemsBulk: async (command: MoveItemsBulkCommand): Promise<MoveItemsResponse> => {
    const targetCollection = debugSession.collections.find(
      (c) => c.id === command.targetCollectionId
    );
    if (!targetCollection) throw new Error('Target collection not found');

    const movedItemIds: string[] = [];
    const failedItemIds: string[] = [];

    for (const itemId of command.itemIds) {
      const idx = debugSession.items.findIndex((i) => i.id === itemId);
      if (idx === -1) {
        failedItemIds.push(itemId);
        continue;
      }

      debugSession.items[idx] = {
        ...debugSession.items[idx],
        collectionId: command.targetCollectionId,
        updatedAt: new Date().toISOString(),
      };
      movedItemIds.push(itemId);
    }

    return {
      success: failedItemIds.length === 0,
      movedItemIds,
      failedItemIds: failedItemIds.length > 0 ? failedItemIds : undefined,
    };
  },

  deleteItemsBulk: async (itemIds: string[]): Promise<DeleteItemsBulkResponse> => {
    const existingIds = new Set(debugSession.items.map((i) => i.id));
    const deletedItemIds: string[] = [];
    const failedItemIds: string[] = [];

    for (const id of itemIds) {
      if (existingIds.has(id)) {
        deletedItemIds.push(id);
      } else {
        failedItemIds.push(id);
      }
    }

    debugSession.items = debugSession.items.filter((i) => !deletedItemIds.includes(i.id));

    return {
      success: failedItemIds.length === 0,
      deletedItemIds,
      failedItemIds: failedItemIds.length > 0 ? failedItemIds : undefined,
    };
  },
};
