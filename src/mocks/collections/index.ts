import { v4 as uuidv4 } from 'uuid';
import type {
  Collection,
  CollectionService,
  CreateCollectionInput,
  UpdateCollectionInput,
} from '@/types/collections';

/**
 * MockCollectionService - In-memory collection storage for development
 * Implements CollectionService interface for seamless API integration later
 */
export const createMockCollectionService = (): CollectionService => {
  const collections = new Map<string, Collection>();
  const currentUserId = 'mock-user-id';
  const itemCounts = new Map<string, number>();

  return {
    async create(input: CreateCollectionInput): Promise<Collection> {
      const collection: Collection = {
        collection_id: uuidv4(),
        user_id: currentUserId,
        name: input.name,
        description: input.description ?? null,
        cover_img_url: input.cover_img_url ?? null,
        visibility: input.visibility ?? 'private',
        followers_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      collections.set(collection.collection_id, collection);
      itemCounts.set(collection.collection_id, 0);
      return collection;
    },

    async getById(collectionId: string): Promise<Collection | null> {
      return collections.get(collectionId) ?? null;
    },

    async getMe(): Promise<Collection[]> {
      return Array.from(collections.values()).filter(
        (col) => col.user_id === currentUserId && col.is_active
      );
    },

    async update(collectionId: string, input: UpdateCollectionInput): Promise<Collection> {
      const collection = collections.get(collectionId);
      if (!collection) {
        throw new Error(`Collection not found: ${collectionId}`);
      }

      const updated: Collection = {
        ...collection,
        ...input,
        updated_at: new Date().toISOString(),
      };

      collections.set(collectionId, updated);
      return updated;
    },

    async delete(collectionId: string): Promise<void> {
      const collection = collections.get(collectionId);
      if (!collection) {
        throw new Error(`Collection not found: ${collectionId}`);
      }

      collection.is_active = false;
    },

    async getItemCount(collectionId: string): Promise<number> {
      return itemCounts.get(collectionId) ?? 0;
    },
  };
};

// Barrel export
export type {
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
  CollectionService,
} from '@/types/collections';
