/**
 * Item API Service Contract
 *
 * Handles item CRUD operations with pagination, caching, and retry logic.
 * Production implementation: src/services/api/itemAPIService.ts
 */

import type {
  ItemResponse,
  ItemPageResponse,
  CreateItemRequest,
  UpdateItemRequest,
  MoveItemCommand,
  MoveItemsBulkCommand,
  MoveItemsResponse,
  DeleteItemsBulkResponse,
} from '@/types';

export interface IItemAPIService {
  /**
   * Fetch items in collection with pagination
   *
   * @param collectionId - Collection ID
   * @param page - Page number (0-indexed)
   * @param size - Items per page (default 10)
   * @returns ItemPageResponse with paginated results
   * @throws Error on 401, 403, 404 (collection not found), 5xx (retry)
   *
   * Caching: 5-minute TTL per page with stale-while-revalidate
   * Retry: Yes (transient errors)
   */
  getItemsByCollection(
    collectionId: string,
    page: number,
    size: number
  ): Promise<ItemPageResponse>;

  /**
   * Fetch single item with full details
   *
   * @param collectionId - Collection ID (for authorization check)
   * @param itemId - Item ID
   * @returns ItemResponse with full data (includes likesCount, commentsCount, attributes)
   * @throws Error on 401, 403, 404, 5xx (retry)
   *
   * Caching: 5-minute TTL with stale-while-revalidate
   * Retry: Yes
   */
  getItem(collectionId: string, itemId: string): Promise<ItemResponse>;

  /**
   * Create new item in collection
   *
   * @param data - CreateItemRequest (collectionId, name, optional description, dates, images, attributes, tags)
   * @returns Created ItemResponse
   * @throws Error on 400 (validation), 401, 403, 404 (collection not found), 5xx (retry)
   *
   * Caching: Invalidate items list for collection on success
   * Retry: Yes
   */
  createItem(data: CreateItemRequest): Promise<ItemResponse>;

  /**
   * Update existing item
   *
   * @param itemId - Item ID
   * @param data - UpdateItemRequest (partial update)
   * @returns Updated ItemResponse
   * @throws Error on 400, 401, 403 (not owner), 404, 5xx (retry)
   *
   * Caching: Invalidate item + items list on success
   * Retry: Yes
   */
  updateItem(itemId: string, data: UpdateItemRequest): Promise<ItemResponse>;

  /**
   * Delete single item
   *
   * @param itemId - Item ID
   * @returns void
   * @throws Error on 401, 403 (not owner), 404, 5xx (retry)
   *
   * Caching: Invalidate item + items list on success
   * Retry: Yes
   */
  deleteItem(itemId: string): Promise<void>;

  /**
   * Move single item to another collection
   *
   * @param command - MoveItemCommand (itemId, targetCollectionId, sourceCollectionId optional)
   * @returns Moved ItemResponse
   * @throws Error on 400 (invalid target), 401, 403, 404, 5xx (retry)
   *
   * Caching: Invalidate source + target collection items lists on success
   * Retry: Yes
   */
  moveItem(command: MoveItemCommand): Promise<ItemResponse>;

  /**
   * Move multiple items to another collection (bulk operation)
   *
   * @param command - MoveItemsBulkCommand (itemIds[], targetCollectionId, sourceCollectionId optional)
   * @returns MoveItemsResponse with success count + failed IDs
   * @throws Error on 400, 401, 403, 404, 5xx (retry)
   *
   * Caching: Invalidate source + target collection items lists on success
   * Retry: Yes
   */
  moveItemsBulk(command: MoveItemsBulkCommand): Promise<MoveItemsResponse>;

  /**
   * Delete multiple items (bulk operation)
   *
   * @param itemIds - Array of item IDs to delete
   * @returns DeleteItemsBulkResponse with deleted count + failed IDs
   * @throws Error on 401, 403, 404, 5xx (retry)
   *
   * Caching: Invalidate items list for affected collections on success
   * Retry: Yes
   */
  deleteItemsBulk(itemIds: string[]): Promise<DeleteItemsBulkResponse>;

  /**
   * Like item (increment likesCount)
   *
   * @param itemId - Item ID
   * @returns Updated ItemResponse
   * @throws Error on 401, 403, 404, 409 (already liked), 5xx (retry)
   *
   * Retry: Yes
   */
  likeItem(itemId: string): Promise<ItemResponse>;

  /**
   * Unlike item (decrement likesCount)
   *
   * @param itemId - Item ID
   * @returns Updated ItemResponse
   * @throws Error on 401, 403, 404, 5xx (retry)
   *
   * Retry: Yes
   */
  unlikeItem(itemId: string): Promise<ItemResponse>;

  /**
   * Clear cached item data
   */
  clearCache(itemId?: string, collectionId?: string): Promise<void>;
}

/**
 * Implementation notes:
 *
 * 1. Endpoints:
 *    - GET /items/by-collection/{collectionId}?page={page}&size={size}
 *    - GET /items/{collectionId}/{itemId} (full detail)
 *    - POST /items/create
 *    - PATCH /items/{itemId}
 *    - DELETE /items/{itemId}
 *    - POST /items/move (bulk)
 *    - DELETE /items (bulk)
 *    - POST /items/{itemId}/like
 *    - DELETE /items/{itemId}/like
 *
 * 2. Error context:
 *    - 400 → "Invalid item data. Check required fields."
 *    - 401 → "Session expired. Please log in again."
 *    - 403 → "You don't have permission to modify this item."
 *    - 404 → "Item or collection not found."
 *    - 409 → "Invalid operation (e.g., moving to same collection)."
 *    - 5xx → "Server unavailable. Retrying..."
 *
 * 3. Bulk operations:
 *    - moveItemsBulk: Partial success allowed (return failed IDs)
 *    - deleteItemsBulk: Partial success allowed (return failed IDs)
 *    - On partial failure: Show "Moved X items, Y failed" message
 *
 * 4. Pagination:
 *    - Same as collections: 0-indexed pages, size param
 *    - Key format: `items_${collectionId}_page_${page}`
 *
 * 5. Like operations:
 *    - Optimistic update: increment likesCount locally before API call
 *    - On error: Rollback likesCount, show error message
 *    - No retry on 409 (already liked/unliked)
 *
 * 6. Validation:
 *    - Client validates: dates (≤ today), image URLs, required fields
 *    - Server validates: business rules, permissions
 */
