export interface CreateItemRequest {
  collectionId: string;
  name: string;
  description?: string | null;
  acquisitionDate?: string | null;
  lastUsedDate?: string | null;
  imageFilesUrls?: string[] | null;
  attributes?: Record<string, unknown> | null;
  tags?: string[] | null;
}

export interface UpdateItemRequest {
  id: string;
  name?: string;
  description?: string;
  acquisitionDate?: string;
  imageFilesUrls?: string[] | null;
  attributes?: Record<string, unknown>;
  tags?: string[];
  collectionId?: string;
}

export interface MoveItemCommand {
  itemId: string;
  targetCollectionId: string;
  sourceCollectionId?: string;
}

export interface MoveItemsBulkCommand {
  itemIds: string[];
  targetCollectionId: string;
  sourceCollectionId?: string;
}

export interface MoveItemsResponse {
  success: boolean;
  movedItemIds: string[];
  failedItemIds?: string[];
}

export interface DeleteItemsBulkResponse {
  success: boolean;
  deletedItemIds: string[];
  failedItemIds?: string[];
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
  imageFilesUrls: string[];
}

export interface ItemPageResponse {
  items?: ItemSummaryResponse[];
  content?: ItemSummaryResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

export interface ItemService {
  create(input: CreateItemRequest): Promise<ItemResponse>;
  getById(itemId: string, collectionId?: string): Promise<ItemResponse | null>;
  getByCollection(collectionId: string): Promise<ItemResponse[]>;
  update(itemId: string, input: UpdateItemRequest): Promise<ItemResponse>;
  delete(itemId: string): Promise<void>;
  getUserItems(userId: string): Promise<ItemResponse[]>;
  moveItem(command: MoveItemCommand): Promise<ItemResponse>;
  moveItemsBulk(command: MoveItemsBulkCommand): Promise<MoveItemsResponse>;
  deleteItemsBulk(itemIds: string[]): Promise<DeleteItemsBulkResponse>;
}

export type Item = ItemResponse;
export type CreateItemInput = CreateItemRequest;
export type UpdateItemInput = UpdateItemRequest;
