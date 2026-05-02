export interface Item {
  item_id: string;
  collection_id: string | null;
  name: string;
  description: string;
  acquisition_date: string | null;
  last_used_date: string | null;
  media_urls: string[];
  attributes: Record<string, unknown>;
  likes_count: number;
  comments_count: number;
  is_active: boolean;
  created_at: string;
}

export interface CreateItemInput {
  collection_id?: string | null;
  name: string;
  description?: string;
  acquisition_date?: string | null;
  media_urls: string[];
  attributes?: Record<string, unknown>;
}

export interface UpdateItemInput {
  name?: string;
  description?: string;
  collection_id?: string | null;
  acquisition_date?: string | null;
  attributes?: Record<string, unknown>;
}

export interface ItemService {
  /** Create a new item with photos and metadata */
  create(input: CreateItemInput): Promise<Item>;

  /** Get item by ID */
  getById(itemId: string): Promise<Item | null>;

  /** Get items by collection */
  getByCollection(collectionId: string): Promise<Item[]>;

  /** Update item metadata */
  update(itemId: string, input: UpdateItemInput): Promise<Item>;

  /** Delete item (soft delete via is_active flag) */
  delete(itemId: string): Promise<void>;

  /** Get items for authenticated user */
  getUserItems(userId: string): Promise<Item[]>;
}
