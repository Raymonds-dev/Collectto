export type CollectionVisibility = 'PUBLIC' | 'PRIVATE' | 'UNLISTED';

export type DeleteCollectionItemsStrategy = 'MOVE_TO_UNCATEGORIZED' | 'DELETE_ALL_ITEMS';

export interface CreateCollectionRequest {
  name: string;
  description: string;
  coverImageUrl?: string | null;
  tags?: string[];
}

export interface UpdateCollectionRequest {
  id: string;
  name?: string;
  description?: string;
  coverImageUrl?: string | null;
  visibility?: CollectionVisibility;
  tags?: string[];
}

export interface DeleteCollectionRequest {
  collectionId: string;
  strategy: DeleteCollectionItemsStrategy;
  /** Required when strategy is MOVE_TO_UNCATEGORIZED */
  uncategorizedCollectionId?: string;
}

export interface DeleteCollectionResponse {
  success: boolean;
  deletedCollectionId: string;
  movedItemsCount?: number;
  deletedItemsCount?: number;
}

export interface CollectionResponse {
  id: string;
  userId: string;
  name: string;
  description: string;
  coverImageURL?: string;
  /** Optional array of image URLs for modern API responses */
  coverImageUrls?: string[];
  visibility: CollectionVisibility;
  followersCount: number;
  tags?: string[];
  isActive: boolean;
  /** True for system-managed collections like "Sem categoria" */
  isSystem?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionSummaryResponse {
  id: string;
  name: string;
  imageFilesUrls: string[];
}

export interface CollectionPageResponse {
  collections: CollectionSummaryResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

export interface CollectionService {
  create(input: CreateCollectionRequest): Promise<CollectionResponse>;
  getById(collectionId: string): Promise<CollectionResponse | null>;
  getMe(): Promise<CollectionResponse[]>;
  update(collectionId: string, input: UpdateCollectionRequest): Promise<CollectionResponse>;
  delete(collectionId: string): Promise<void>;
  deleteWithStrategy(request: DeleteCollectionRequest): Promise<DeleteCollectionResponse>;
  getItemCount(collectionId: string): Promise<number>;
  getUncategorized(): Promise<CollectionResponse>;
}

export type Collection = CollectionResponse;
export type CreateCollectionInput = CreateCollectionRequest;
export type UpdateCollectionInput = UpdateCollectionRequest;
