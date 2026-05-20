/**
 * Profile Service Contract
 *
 * Handles user profile fetching and updates with caching + retry logic.
 * Production implementation: src/services/api/profileService.ts
 */

import type {
  UserResponse,
  UpdateUserRequest,
} from '@/types';

export interface IProfileService {
  /**
   * Fetch user profile by ID
   *
   * @param userId - User ID to fetch
   * @returns UserResponse with profile data
   * @throws Error on 401 (re-auth), 403 (forbidden), 404 (not found), 5xx (retry)
   *
   * Caching: 5-minute TTL with stale-while-revalidate
   * Retry: Yes (transient errors only: 5xx, timeouts)
   */
  getProfile(userId: string): Promise<UserResponse>;

  /**
   * Update authenticated user profile
   *
   * @param userId - User ID to update (from auth context)
   * @param data - Partial user update (name, bio, pictures, birthdate, etc.)
   * @returns Updated UserResponse
   * @throws Error on 400 (validation), 401 (re-auth), 403 (forbidden), 409 (duplicate), 5xx (retry)
   *
   * Caching: Invalidate cache entry on success
   * Retry: Yes (transient errors only)
   * Validation: Client validates format (email, username format, date)
   */
  updateProfile(
    userId: string,
    data: UpdateUserRequest
  ): Promise<UserResponse>;

  /**
   * Clear cached profile data
   * Called after update or on logout
   */
  clearCache(userId?: string): Promise<void>;
}

/**
 * Implementation notes:
 *
 * 1. getProfile:
 *    - Endpoint: GET /users/{userId}
 *    - Query: none
 *    - Auth: Bearer token required
 *
 * 2. updateProfile:
 *    - Endpoint: PATCH /users/update
 *    - Body: UpdateUserRequest (partial)
 *    - Auth: Bearer token required
 *    - Side effects: Profile picture/background URLs updated (via uploadService pre-signed URLs)
   *
   * 3. Error context:
   *    - 401 → "Session expired. Please log in again."
   *    - 403 → "You don't have permission to edit this profile."
   *    - 409 → "Username or email already in use."
   *    - 5xx → "Server unavailable. Retrying..."
   *    - Network timeout → "Connection timeout. Retrying..."
   *
   * 4. Retry behavior:
   *    - Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms (max 5)
   *    - Jitter: ±50% random
   *    - Only retry on: 5xx, network timeouts, connection resets
   *    - Skip retry on: 4xx (permanent), 401/403 (auth issues)
   */
