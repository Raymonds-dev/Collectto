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
