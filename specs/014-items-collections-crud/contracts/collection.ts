export type VisibilityType = 'PUBLIC' | 'PRIVATE' | 'UNLISTED';

export interface CollectionResponse {
  id: string;                      // UUID
  userId: string;                  // UUID of collection owner
  name: string;                    // 1-255 chars, unique per user
  description: string;             // 0-1000 chars
  coverImageURL?: string;          // Optional image URL (from presigned upload)
  visibility: VisibilityType;      // PUBLIC | PRIVATE | UNLISTED
  followersCount: number;          // Read-only, managed by backend
  tags: string[];                  // Array of category tags
  isActive: boolean;               // Soft delete flag
  isSystem?: boolean;              // Optional: true for 'Uncategorized' system collection
  createdAt: string;               // ISO 8601 timestamp
  updatedAt: string;               // ISO 8601 timestamp
}

export interface CreateCollectionRequest {
  name: string;                    // Required
  description?: string;            // Optional
  tags?: string[];                 // Optional
  coverImageUrl?: string;          // Optional (handled by presigned URLs)
  visibility?: VisibilityType;     // Optional, defaults to PUBLIC
}

export interface UpdateCollectionRequest {
  name?: string;                   // Partial update
  description?: string;
  tags?: string[];
  coverImageUrl?: string;
  visibility?: VisibilityType;
}

export interface DeleteCollectionResponse {
  success: boolean;
  deletedCollectionId: string;
  deletedItemsCount?: number;
  movedItemsCount?: number;
}
