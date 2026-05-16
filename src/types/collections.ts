export type CollectionVisibility = 'PUBLIC' | 'PRIVATE' | 'FRIENDS';

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

export interface CollectionResponse {
  id: string;
  userId: string;
  name: string;
  description: string;
  coverImageURL?: string;
  visibility: CollectionVisibility;
  followersCount: number;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionSummaryResponse {
  id: string;
  name: string;
  imagesURL: string[];
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
  getItemCount(collectionId: string): Promise<number>;
}

export type Collection = CollectionResponse;
export type CreateCollectionInput = CreateCollectionRequest;
export type UpdateCollectionInput = UpdateCollectionRequest;
