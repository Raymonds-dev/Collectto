import { CreateItemRequest, ItemResponse, ItemService, UpdateItemRequest } from '@/types/items';
import { debugSession } from './debugSession';

export const mockItemService: ItemService = {
  create: async (input: CreateItemRequest): Promise<ItemResponse> => {
    const newItem: ItemResponse = {
      id: `item-${Date.now()}`,
      collectionId: input.collectionId,
      userId: debugSession.currentUser?.id || '',
      name: input.name,
      description: input.description || '',
      acquisitionDate: input.acquisitionDate,
      lastUsedDate: input.lastUsedDate,
      imageFilesUrls: input.imageFilesUrls || [],
      attributes: input.attributes,
      likesCount: 0,
      commentsCount: 0,
      tags: input.tags,
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
};
