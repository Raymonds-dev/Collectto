import {
  CollectionResponse,
  CollectionService,
  CreateCollectionRequest,
  DeleteCollectionRequest,
  DeleteCollectionResponse,
  UpdateCollectionRequest,
} from '@/types/collections';
import { debugSession } from './debugSession';

const UNCATEGORIZED_NAME = 'Sem categoria';

export const mockCollectionService: CollectionService = {
  create: async (input: CreateCollectionRequest): Promise<CollectionResponse> => {
    const newCollection: CollectionResponse = {
      id: `collection-${Date.now()}`,
      userId: debugSession.currentUser?.id || '',
      name: input.name,
      description: input.description,
      coverImageURL: input.coverImageUrl || undefined,
      visibility: 'PUBLIC',
      followersCount: 0,
      tags: input.tags || undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    debugSession.collections.push(newCollection);
    return newCollection;
  },

  getById: async (collectionId: string): Promise<CollectionResponse | null> => {
    return debugSession.collections.find((c) => c.id === collectionId) || null;
  },

  getMe: async (): Promise<CollectionResponse[]> => {
    return debugSession.collections
      .filter((c) => c.userId === debugSession.currentUser?.id)
      .sort((a, b) => {
        if (a.isSystem === b.isSystem) return 0;
        return a.isSystem ? 1 : -1;
      });
  },

  update: async (
    collectionId: string,
    input: UpdateCollectionRequest
  ): Promise<CollectionResponse> => {
    const idx = debugSession.collections.findIndex((c) => c.id === collectionId);
    if (idx === -1) throw new Error('Collection not found');
    const updated = {
      ...debugSession.collections[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    debugSession.collections[idx] = updated;
    return updated;
  },

  delete: async (collectionId: string): Promise<void> => {
    debugSession.collections = debugSession.collections.filter((c) => c.id !== collectionId);
  },

  deleteWithStrategy: async (
    request: DeleteCollectionRequest
  ): Promise<DeleteCollectionResponse> => {
    const collection = debugSession.collections.find((c) => c.id === request.collectionId);
    if (!collection) throw new Error('Collection not found');

    const affectedItems = debugSession.items.filter((i) => i.collectionId === request.collectionId);

    if (request.strategy === 'MOVE_TO_UNCATEGORIZED') {
      const uncategorized = debugSession.collections.find(
        (c) => c.isSystem && c.name === UNCATEGORIZED_NAME
      );
      if (!uncategorized) throw new Error('Uncategorized collection not found');

      for (const item of affectedItems) {
        item.collectionId = uncategorized.id;
        item.updatedAt = new Date().toISOString();
      }

      debugSession.collections = debugSession.collections.filter(
        (c) => c.id !== request.collectionId
      );

      return {
        success: true,
        deletedCollectionId: request.collectionId,
        movedItemsCount: affectedItems.length,
      };
    }

    // DELETE_ALL_ITEMS strategy
    const deletedItemIds = affectedItems.map((i) => i.id);
    debugSession.items = debugSession.items.filter((i) => !deletedItemIds.includes(i.id));
    debugSession.collections = debugSession.collections.filter(
      (c) => c.id !== request.collectionId
    );

    return {
      success: true,
      deletedCollectionId: request.collectionId,
      deletedItemsCount: deletedItemIds.length,
    };
  },

  getItemCount: async (collectionId: string): Promise<number> => {
    return debugSession.items.filter((i) => i.collectionId === collectionId).length;
  },

  getUncategorized: async (): Promise<CollectionResponse> => {
    const uncategorized = debugSession.collections.find(
      (c) =>
        c.isSystem && c.name === UNCATEGORIZED_NAME && c.userId === debugSession.currentUser?.id
    );
    if (uncategorized) return uncategorized;

    // Auto-create if not found
    const newUncategorized: CollectionResponse = {
      id: `uncategorized-${Date.now()}`,
      userId: debugSession.currentUser?.id || '',
      name: UNCATEGORIZED_NAME,
      description: 'Itens sem coleção definida.',
      visibility: 'PRIVATE',
      followersCount: 0,
      tags: [],
      isActive: true,
      isSystem: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    debugSession.collections.push(newUncategorized);
    return newUncategorized;
  },
};
