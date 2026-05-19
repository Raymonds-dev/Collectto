export interface UpdateItemRequest {
  id: string;
  name?: string;
  description?: string | null;
  acquisitionDate?: string | null; // YYYY-MM-DD
  imageFilesUrls?: string[] | null; // null = keep existing, [] = remove all
  attributes?: Record<string, unknown> | null;
  tags?: string[] | null;
}

export interface UpdateItemResponse {
  // Mirrors ItemResponse from API; include minimal fields used by frontend
  id: string;
  collectionId?: string | null;
  userId: string;
  name: string;
  description?: string | null;
  imageFilesUrls?: string[];
  attributes?: Record<string, unknown>;
  tags?: string[];
  updatedAt?: string;
}
