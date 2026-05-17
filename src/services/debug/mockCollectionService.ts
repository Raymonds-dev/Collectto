import {
  CollectionResponse,
  CollectionService,
  CreateCollectionRequest,
  UpdateCollectionRequest,
} from '@/types/collections';
import { debugSession } from './debugSession';

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
      tags: input.tags,
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
    return debugSession.collections.filter((c) => c.userId === debugSession.currentUser?.id);
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

  getItemCount: async (collectionId: string): Promise<number> => {
    return debugSession.items.filter((i) => i.collectionId === collectionId).length;
  },
};
