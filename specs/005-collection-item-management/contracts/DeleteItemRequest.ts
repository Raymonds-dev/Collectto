export interface DeleteItemRequest {
  itemId: string;
}

export interface DeleteItemResponse {
  success: boolean;
  deletedItemId: string;
}
