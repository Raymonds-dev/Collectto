export type Visibility = 'PUBLIC' | 'PRIVATE' | 'FRIENDS';

export interface UpdateCollectionRequest {
  id: string;
  name?: string;
  description?: string | null;
  coverImageUrl?: string | null; // null = keep existing, empty string = remove
  visibility?: Visibility;
  tags?: string[] | null;
}

export interface UpdateCollectionResponse {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  coverImageUrl?: string | null;
  visibility?: Visibility;
  tags?: string[];
  updatedAt?: string;
}
