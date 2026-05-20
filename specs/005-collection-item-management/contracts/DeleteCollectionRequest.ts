export type DeleteCollectionItemsStrategy = 'MOVE_TO_UNCATEGORIZED' | 'DELETE_ALL_ITEMS';

export interface DeleteCollectionRequest {
  collectionId: string;
  strategy: DeleteCollectionItemsStrategy;
  uncategorizedCollectionId?: string; // required when strategy is MOVE_TO_UNCATEGORIZED
}

export interface DeleteCollectionResponse {
  success: boolean;
  deletedCollectionId: string;
  movedItemsCount?: number;
  deletedItemsCount?: number;
}
