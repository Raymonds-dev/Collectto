export interface ItemResponse {
  id: string;                      // UUID
  collectionId: string;            // UUID of parent collection
  userId: string;                  // UUID of item owner
  name: string;                    // Required
  description: string;             // Optional, defaults to ''
  acquisitionDate?: string;        // ISO 8601, optional
  lastUsedDate?: string;           // ISO 8601, optional
  imageFilesUrls: string[];        // Array of image URLs (typically 1-3)
  attributes?: Record<string, unknown>; // Custom key-value attributes
  likesCount: number;              // Read-only, social feature
  commentsCount: number;           // Read-only, social feature
  tags: string[];                  // Array of tags
  isActive: boolean;               // Soft delete flag
  createdAt: string;               // ISO 8601 timestamp
  updatedAt: string;               // ISO 8601 timestamp
}

export interface CreateItemRequest {
  name: string;                    // Required
  description?: string;            // Optional
  collectionId: string;            // Required UUID
  tags?: string[];                 // Optional
  imageFilesUrls?: string[];       // Optional array (from presigned URLs)
  acquisitionDate?: string;        // Optional ISO 8601
  lastUsedDate?: string;           // Optional ISO 8601
  attributes?: Record<string, unknown>; // Optional custom attributes
}

export interface UpdateItemRequest {
  name?: string;                   // Partial update
  description?: string;
  tags?: string[];
  imageFilesUrls?: string[];
  acquisitionDate?: string;
  lastUsedDate?: string;
  attributes?: Record<string, unknown>;
}

export interface MoveItemCommand {
  itemId: string;
  targetCollectionId: string;
}

export interface MoveItemResponse {
  success: boolean;
  itemId: string;
  fromCollectionId: string;
  toCollectionId: string;
}

export interface DeleteItemsBulkResponse {
  success: boolean;
  deletedItemIds: string[];
  failedItemIds?: string[];
}
