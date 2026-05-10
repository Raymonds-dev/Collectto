import type { Item } from '@/types/items';
import type { Collection } from '@/types/collections';

/**
 * Sample items for testing Phase 4 (Create Item in Existing Collection)
 */
export const mockItems: Item[] = [
  {
    item_id: 'item-001',
    collection_id: 'col-001',
    name: 'Vintage Leather Jacket',
    description: 'Classic brown leather jacket from the 1970s',
    acquisition_date: '2023-01-15',
    last_used_date: '2024-05-01',
    media_urls: ['file:///mock/item-001-photo-1.jpg', 'file:///mock/item-001-photo-2.jpg'],
    attributes: {
      condition: 'excellent',
      size: 'medium',
      brand: 'unknown',
    },
    likes_count: 5,
    comments_count: 2,
    is_active: true,
    created_at: '2023-01-15T00:00:00Z',
  },
  {
    item_id: 'item-002',
    collection_id: 'col-001',
    name: 'Retro Vinyl Record - Pink Floyd',
    description: 'The Dark Side of the Moon original pressing',
    acquisition_date: '2022-06-20',
    last_used_date: '2024-04-15',
    media_urls: ['file:///mock/item-002-photo-1.jpg'],
    attributes: {
      artist: 'Pink Floyd',
      genre: 'progressive-rock',
      year: '1973',
    },
    likes_count: 12,
    comments_count: 4,
    is_active: true,
    created_at: '2022-06-20T00:00:00Z',
  },
];

/**
 * Sample collections for testing Phase 4
 */
export const mockCollections: Collection[] = [
  {
    collection_id: 'col-001',
    user_id: 'user-001',
    name: 'Vintage Treasures',
    description: 'My collection of vintage items and collectibles',
    cover_img_url: 'file:///mock/collection-001-cover.jpg',
    visibility: 'private',
    followers_count: 2,
    is_active: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2024-05-01T00:00:00Z',
  },
  {
    collection_id: 'col-002',
    user_id: 'user-001',
    name: 'Gaming Collection',
    description: 'Retro gaming consoles and cartridges',
    cover_img_url: 'file:///mock/collection-002-cover.jpg',
    visibility: 'public',
    followers_count: 15,
    is_active: true,
    created_at: '2023-03-10T00:00:00Z',
    updated_at: '2024-04-20T00:00:00Z',
  },
  {
    collection_id: 'col-003',
    user_id: 'user-001',
    name: 'Photography Gear',
    description: 'Vintage cameras and lenses',
    cover_img_url: null,
    visibility: 'private',
    followers_count: 0,
    is_active: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-05-01T00:00:00Z',
  },
];

/**
 * Sample photo URIs for testing photo migration
 */
export const mockPhotoUris = [
  'file:///mock/collectto/photos/temp/photo-1.jpg',
  'file:///mock/collectto/photos/temp/photo-2.jpg',
  'file:///mock/collectto/photos/temp/photo-3.jpg',
];

/**
 * Test scenario: Create new item with existing collection
 */
export const testScenarioCreateItemWithCollection = {
  itemName: 'Test Vintage Watch',
  itemDescription: 'A beautiful Swiss chronograph',
  collectionId: 'col-001',
  photos: mockPhotoUris.slice(0, 2),
};

/**
 * Test scenario: Item with no description
 */
export const testScenarioItemNoDescription = {
  itemName: 'Antique Compass',
  itemDescription: '',
  collectionId: 'col-002',
  photos: [mockPhotoUris[0]],
};

/**
 * Test scenario: Item with multiple photos
 */
export const testScenarioMultiPhotoItem = {
  itemName: 'Multi-angle Photography Setup',
  itemDescription: 'Complete studio setup with lighting',
  collectionId: 'col-003',
  photos: mockPhotoUris,
};

export default {
  mockItems,
  mockCollections,
  mockPhotoUris,
  testScenarioCreateItemWithCollection,
  testScenarioItemNoDescription,
  testScenarioMultiPhotoItem,
};
