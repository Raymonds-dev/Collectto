/**
 * ItemService Contract aligned with the Swagger API.
 *
 * @file specs/003-ephemeral-debug-mode/contracts/items.contract.ts
 */

export interface CreateItemRequest {
  collectionId: string;
  name: string;
  description?: string;
  acquisitionDate?: string;
  lastUsedDate?: string;
  imageFilesUrls?: string[];
  attributes?: Record<string, unknown>;
  tags?: string[];
}

export interface UpdateItemRequest {
  id: string;
  name?: string;
  description?: string;
  acquisitionDate?: string;
  imageFilesUrls?: string[] | null;
  attributes?: Record<string, unknown>;
  tags?: string[];
}

export interface ItemResponse {
  id: string;
  collectionId: string;
  userId: string;
  name: string;
  description: string;
  acquisitionDate?: string;
  lastUsedDate?: string;
  imageFilesUrls: string[];
  attributes?: Record<string, unknown>;
  likesCount: number;
  commentsCount: number;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemSummaryResponse {
  id: string;
  name: string;
  imagesURL: string[];
}

export interface ItemPageResponse {
  items: ItemSummaryResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

export interface ItemService {
  create(input: CreateItemRequest): Promise<ItemResponse>;
  getById(collectionId: string, itemId: string): Promise<ItemResponse>;
  getByCollection(
    collectionId: string,
    page?: number,
    size?: number,
    sortBy?: string
  ): Promise<ItemPageResponse>;
  update(input: UpdateItemRequest): Promise<ItemResponse>;
  delete(itemId: string): Promise<void>;
}
