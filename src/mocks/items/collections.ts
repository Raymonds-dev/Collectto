import type { Collection } from '@/types/collections';

/**
 * Mock collections for testing the create item flow
 * These are used to populate the collection selector during item creation
 */
export const MOCK_COLLECTIONS: Collection[] = [
  {
    collection_id: 'coll-1',
    user_id: 'user-1',
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
    user_id: 'user-1',
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
    user_id: 'user-1',
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
    user_id: 'user-1',
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
 * Get mock collection by ID for testing
 */
export const getMockCollectionById = (collectionId: string): Collection | undefined => {
  return MOCK_COLLECTIONS.find((col) => col.collection_id === collectionId);
};
