import type {
  Collection,
  CollectionService,
  CreateCollectionInput,
  UpdateCollectionInput,
} from '@/types/collections';
import { generateRandomId } from '@/utils/generateRandomId';

/**
 * Pre-populated mock collections for testing
 */
const MOCK_COLLECTIONS_DATA: Collection[] = [
  {
    collection_id: 'coll-1',
    user_id: 'mock-user-id',
    name: 'Carros Clássicos',
    description: 'Coleção de carros clássicos e antigos',
    cover_img_url:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&h=500&fit=crop',
    visibility: 'public',
    followers_count: 245,
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-05-05T19:00:00Z',
  },
  {
    collection_id: 'coll-2',
    user_id: 'mock-user-id',
    name: 'Sneakers',
    description: 'Coleção de tênis esportivos raros',
    cover_img_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
    visibility: 'public',
    followers_count: 512,
    is_active: true,
    created_at: '2024-02-20T14:30:00Z',
    updated_at: '2024-05-01T09:15:00Z',
  },
  {
    collection_id: 'coll-3',
    user_id: 'mock-user-id',
    name: 'Relógios Suíços',
    description: 'Relógios de pulso de luxo e precisão',
    cover_img_url:
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&h=500&fit=crop',
    visibility: 'private',
    followers_count: 89,
    is_active: true,
    created_at: '2024-03-10T08:45:00Z',
    updated_at: '2024-04-28T16:20:00Z',
  },
  {
    collection_id: 'coll-4',
    user_id: 'mock-user-id',
    name: 'Coleção de Vinis',
    description: 'Discos de vinil de rock e jazz',
    cover_img_url:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop',
    visibility: 'public',
    followers_count: 334,
    is_active: true,
    created_at: '2024-04-05T11:00:00Z',
    updated_at: '2024-05-02T13:45:00Z',
  },
];

/**
 * MockCollectionService - In-memory collection storage for development
 * Implements CollectionService interface for seamless API integration later
 * Pre-populated with mock collection data for testing
 */
export const createMockCollectionService = (userId = 'mock-user-id'): CollectionService => {
  const collections = new Map<string, Collection>();
  const itemCounts = new Map<string, number>();

  // Pre-populate with mock data
  MOCK_COLLECTIONS_DATA.forEach((col) => {
    collections.set(col.collection_id, { ...col, user_id: userId });
    itemCounts.set(col.collection_id, 0);
  });

  return {
    async create(input: CreateCollectionInput): Promise<Collection> {
      const collection: Collection = {
        collection_id: generateRandomId(),
        user_id: userId,
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
        (col) => col.user_id === userId && col.is_active
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
