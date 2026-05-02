export interface Collection {
  collection_id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_img_url: string | null;
  visibility: 'private' | 'shared' | 'public';
  followers_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
  cover_img_url?: string | null;
  visibility?: 'private' | 'shared' | 'public';
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string;
  cover_img_url?: string;
  visibility?: 'private' | 'shared' | 'public';
}

export interface CollectionService {
  /** Create a new collection */
  create(input: CreateCollectionInput): Promise<Collection>;

  /** Get collection by ID */
  getById(collectionId: string): Promise<Collection | null>;

  /** Get authenticated user's collections */
  getMe(): Promise<Collection[]>;

  /** Update collection metadata */
  update(collectionId: string, input: UpdateCollectionInput): Promise<Collection>;

  /** Delete collection (soft delete via is_active flag) */
  delete(collectionId: string): Promise<void>;

  /** Get item count in collection */
  getItemCount(collectionId: string): Promise<number>;
}
