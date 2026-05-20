/**
 * Collection API Service Contract
 *
 * Handles collection CRUD operations with pagination, caching, and retry logic.
 * Production implementation: src/services/api/collectionAPIService.ts
 */

import type {
  CollectionResponse,
  CollectionPageResponse,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  DeleteCollectionRequest,
  DeleteCollectionResponse,
  DeleteCollectionItemsStrategy,
} from '@/types';

export interface ICollectionAPIService {
  /**
   * Fetch collections for authenticated user with pagination
   *
   * @param userId - User ID
   * @param page - Page number (0-indexed)
   * @param size - Items per page (default 10)
   * @returns CollectionPageResponse with paginated results
   * @throws Error on 401, 403, 5xx (retry)
   *
   * Caching: 5-minute TTL per page with stale-while-revalidate
   * Retry: Yes (transient errors)
   */
  getCollectionsByUser(
    userId: string,
    page: number,
    size: number
  ): Promise<CollectionPageResponse>;

  /**
   * Fetch single collection by ID
   *
   * @param collectionId - Collection ID
   * @returns CollectionResponse
   * @throws Error on 401, 403, 404, 5xx (retry)
   *
   * Caching: 5-minute TTL with stale-while-revalidate
   * Retry: Yes
   */
  getCollection(collectionId: string): Promise<CollectionResponse>;

  /**
   * Create new collection
   *
   * @param data - CreateCollectionRequest (name, description, optional cover, tags)
   * @returns Created CollectionResponse
   * @throws Error on 400 (validation), 401, 403, 409 (duplicate name), 5xx (retry)
   *
   * Caching: Invalidate user's collection list on success
   * Retry: Yes
   */
  createCollection(data: CreateCollectionRequest): Promise<CollectionResponse>;

  /**
   * Update existing collection
   *
   * @param collectionId - Collection ID
   * @param data - UpdateCollectionRequest (partial update)
   * @returns Updated CollectionResponse
   * @throws Error on 400, 401, 403 (not owner), 404, 409 (duplicate), 5xx (retry)
   *
   * Caching: Invalidate collection cache + collection list on success
   * Retry: Yes
   */
  updateCollection(
    collectionId: string,
    data: UpdateCollectionRequest
  ): Promise<CollectionResponse>;

  /**
   * Delete collection with strategy (delete all items or move to uncategorized)
   *
   * @param request - DeleteCollectionRequest with strategy
   * @returns DeleteCollectionResponse or void
   * @throws Error on 400 (invalid strategy), 401, 403 (not owner), 404, 5xx (retry)
   *
   * Strategy handling:
   *   - DELETE_ALL_ITEMS: Remove all items in collection
   *   - MOVE_TO_UNCATEGORIZED: Move items to another collection (uncategorizedCollectionId required)
   *
   * Caching: Invalidate collection + items + collection list on success
   * Retry: Yes
   */
  deleteCollection(
    request: DeleteCollectionRequest
  ): Promise<DeleteCollectionResponse | void>;

  /**
   * Follow collection (for discovery)
   *
   * @param collectionId - Collection to follow
   * @returns Updated CollectionResponse with new followersCount
   * @throws Error on 401, 403, 404, 409 (already following), 5xx (retry)
   *
   * Retry: Yes
   */
  followCollection(collectionId: string): Promise<CollectionResponse>;

  /**
   * Unfollow collection
   *
   * @param collectionId - Collection to unfollow
   * @returns void
   * @throws Error on 401, 403, 404, 5xx (retry)
   *
   * Retry: Yes
   */
  unfollowCollection(collectionId: string): Promise<void>;

  /**
   * Clear cached collection data
   */
  clearCache(collectionId?: string, userId?: string): Promise<void>;
}

/**
 * Implementation notes:
 *
 * 1. Endpoints:
 *    - GET /collections/by-user/{userId}?page={page}&size={size}
 *    - GET /collections/{collectionId}
 *    - POST /collections/create
 *    - PATCH /collections/{collectionId}
 *    - DELETE /collections/{collectionId} (with body: DeleteCollectionRequest)
 *    - POST /collections/follow/{collectionId}
 *    - DELETE /collections/follow/{collectionId}
 *
 * 2. Error context:
 *    - 400 → "Invalid request. Check required fields."
 *    - 401 → "Session expired. Please log in again."
 *    - 403 → "You don't have permission to modify this collection."
 *    - 404 → "Collection not found."
 *    - 409 → "Collection name already in use or invalid delete strategy."
 *    - 5xx → "Server unavailable. Retrying..."
 *
 * 3. Delete strategy:
 *    - Client validates strategy before API call
 *    - If MOVE_TO_UNCATEGORIZED: uncategorizedCollectionId must be provided
 *    - Use mockCollectionService.deleteWithStrategy pattern as reference (not import)
 *
 * 4. Pagination:
 *    - 0-indexed pages: page=0 first page
 *    - Offset: page * size
 *    - Total: totalPages, totalElements
 *
 * 5. Caching:
 *    - Each page cached separately: key = `collections_${userId}_page_${page}`
 *    - On create/update/delete: invalidate all pages for user
 */
