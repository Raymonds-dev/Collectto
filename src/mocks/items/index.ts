import { v4 as uuidv4 } from 'uuid';
import type { CreateItemInput, Item, ItemService, UpdateItemInput } from '@/types/items';

/**
 * MockItemService - In-memory item storage for development
 * Implements ItemService interface for seamless API integration later
 */
export const createMockItemService = (): ItemService => {
  const items = new Map<string, Item>();

  return {
    async create(input: CreateItemInput): Promise<Item> {
      const item: Item = {
        item_id: uuidv4(),
        collection_id: input.collection_id ?? null,
        name: input.name,
        description: input.description ?? '',
        acquisition_date: input.acquisition_date ?? null,
        last_used_date: null,
        media_urls: input.media_urls,
        attributes: input.attributes ?? {},
        likes_count: 0,
        comments_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      items.set(item.item_id, item);
      return item;
    },

    async getById(itemId: string): Promise<Item | null> {
      return items.get(itemId) ?? null;
    },

    async getByCollection(collectionId: string): Promise<Item[]> {
      return Array.from(items.values()).filter(
        (item) => item.collection_id === collectionId && item.is_active
      );
    },

    async update(itemId: string, input: UpdateItemInput): Promise<Item> {
      const item = items.get(itemId);
      if (!item) {
        throw new Error(`Item not found: ${itemId}`);
      }

      const updated: Item = {
        ...item,
        ...input,
      };

      items.set(itemId, updated);
      return updated;
    },

    async delete(itemId: string): Promise<void> {
      const item = items.get(itemId);
      if (!item) {
        throw new Error(`Item not found: ${itemId}`);
      }

      item.is_active = false;
    },

    async getUserItems(userId: string): Promise<Item[]> {
      return Array.from(items.values()).filter((item) => item.is_active);
    },
  };
};
