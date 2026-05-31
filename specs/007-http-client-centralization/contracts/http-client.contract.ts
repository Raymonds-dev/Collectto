```typescript
/**
 * HTTP Client Public API Contract
 * 
 * This file documents the public API, method signatures, and usage patterns
 * for the centralized HTTP client. It serves as a contract between the HTTP
 * client implementation and its consumers.
 * 
 * All HTTP calls in the Collectto app must use this client. No direct
 * Axios or Fetch calls are permitted outside of this file.
 * 
 * @see src/services/api/client.ts (Implementation)
 * @see src/types/http.ts (Error and response types)
 */

/**
 * Generic HTTP request method signatures.
 * 
 * Each method:
 * - Is generic over response type T
 * - Takes a URL and optional config
 * - Returns Promise<T> on success
 * - Throws ApiError on failure (never returns null/undefined unless T allows it)
 * 
 * Example:
 * ```typescript
 * const user: User = await HttpClient.get<User>('/users/me');
 * const created: Post = await HttpClient.post<Post>('/posts', { title: 'Hello' });
 * ```
 */

import { AxiosRequestConfig } from 'axios';

/**
 * Type parameter T: The expected response data type.
 * Should match the server API contract for the endpoint.
 * 
 * Example:
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 * }
 * 
 * const user = await HttpClient.get<User>('/users/123');
 * // user is strictly typed as User
 * ```
 */

/**
 * GET request - Fetch data without side effects.
 * 
 * Usage:
 * ```typescript
 * const user = await HttpClient.get<User>('/users/123');
 * const users = await HttpClient.get<User[]>('/users?limit=10');
 * ```
 * 
 * @template T - Response data type
 * @param url - Endpoint URL (relative to baseURL, e.g., '/users/123')
 * @param config - Optional Axios config (headers, params, timeout override, etc.)
 * @returns Promise resolving to response data of type T
 * @throws ApiError if request fails
 * 
 * Retry Behavior:
 * - Network errors: Yes (up to 3 attempts with exponential backoff)
 * - 408 Request Timeout: Yes
 * - 429 Too Many Requests: Yes
 * - 4xx/5xx other: No
 */
export interface HttpClientGetMethod {
  <T>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

/**
 * POST request - Send data and create resources.
 * 
 * Usage:
 * ```typescript
 * const created = await HttpClient.post<Post>('/posts', {
 *   title: 'Hello',
 *   content: 'World'
 * });
 * 
 * // With headers override
 * const uploaded = await HttpClient.post<UploadResult>(
 *   '/upload',
 *   formData,
 *   { headers: { 'Content-Type': 'multipart/form-data' } }
 * );
 * ```
 * 
 * @template T - Response data type
 * @param url - Endpoint URL (relative to baseURL)
 * @param data - Request body (plain object or FormData)
 * @param config - Optional Axios config (headers, timeout override, etc.)
 * @returns Promise resolving to response data of type T
 * @throws ApiError if request fails
 * 
 * Retry Behavior:
 * - Network errors: Yes (up to 3 attempts with exponential backoff)
 * - 408 Request Timeout: Yes
 * - 429 Too Many Requests: Yes
 * - 4xx/5xx other: No
 * 
 * Note: POST is technically not idempotent by HTTP spec. However, network
 * retries for POST are safe if the server implements idempotency keys or
 * deduplicates by request content. Collectto API handles this.
 */
export interface HttpClientPostMethod {
  <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
}

/**
 * PUT request - Replace entire resource.
 * 
 * Usage:
 * ```typescript
 * const updated = await HttpClient.put<User>('/users/123', {
 *   name: 'New Name',
 *   email: 'new@example.com'
 * });
 * ```
 * 
 * @template T - Response data type
 * @param url - Endpoint URL (relative to baseURL)
 * @param data - Request body (must replace entire resource)
 * @param config - Optional Axios config
 * @returns Promise resolving to response data of type T
 * @throws ApiError if request fails
 * 
 * Retry Behavior:
 * - Network errors: Yes (up to 3 attempts with exponential backoff)
 * - 408 Request Timeout: Yes
 * - 429 Too Many Requests: Yes
 * - 4xx/5xx other: No
 * 
 * Idempotency: PUT is idempotent if server implementation deduplicates
 * by timestamp or request checksum. Collectto API handles this.
 */
export interface HttpClientPutMethod {
  <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
}

/**
 * PATCH request - Partial update to resource.
 * 
 * Usage:
 * ```typescript
 * const updated = await HttpClient.patch<User>('/users/123', {
 *   email: 'newemail@example.com'
 *   // Only email is updated; other fields unchanged
 * });
 * ```
 * 
 * @template T - Response data type
 * @param url - Endpoint URL (relative to baseURL)
 * @param data - Request body (partial fields only)
 * @param config - Optional Axios config
 * @returns Promise resolving to response data of type T
 * @throws ApiError if request fails
 * 
 * Retry Behavior:
 * - Network errors: Yes (up to 3 attempts with exponential backoff)
 * - 408 Request Timeout: Yes
 * - 429 Too Many Requests: Yes
 * - 4xx/5xx other: No
 */
export interface HttpClientPatchMethod {
  <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
}

/**
 * DELETE request - Remove resource.
 * 
 * Usage:
 * ```typescript
 * await HttpClient.delete('/users/123');
 * // or with response
 * const result = await HttpClient.delete<{ ok: true }>('/users/123');
 * ```
 * 
 * @template T - Response data type (often { ok: true } or void)
 * @param url - Endpoint URL (relative to baseURL)
 * @param config - Optional Axios config
 * @returns Promise resolving to response data of type T
 * @throws ApiError if request fails
 * 
 * Retry Behavior:
 * - Network errors: Yes (up to 3 attempts with exponential backoff)
 * - 408 Request Timeout: Yes
 * - 429 Too Many Requests: Yes
 * - 4xx/5xx other: No
 * 
 * Idempotency: DELETE is idempotent (deleting twice returns 204 or 404).
 * Safe to retry.
 */
export interface HttpClientDeleteMethod {
  <T>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

/**
 * HTTP Client Public API
 * 
 * Singleton instance that handles all HTTP requests in the app.
 * Do not instantiate directly; use HttpClient.getInstance() or
 * the shared singleton configured in the app's root provider.
 */
export interface HttpClient {
  /**
   * Fetch data (GET).
   * @see HttpClientGetMethod for usage examples and retry behavior
   */
  get: HttpClientGetMethod;

  /**
   * Send data and create resources (POST).
   * @see HttpClientPostMethod for usage examples and retry behavior
   */
  post: HttpClientPostMethod;

  /**
   * Replace entire resource (PUT).
   * @see HttpClientPutMethod for usage examples and retry behavior
   */
  put: HttpClientPutMethod;

  /**
   * Partially update resource (PATCH).
   * @see HttpClientPatchMethod for usage examples and retry behavior
   */
  patch: HttpClientPatchMethod;

  /**
   * Delete resource (DELETE).
   * @see HttpClientDeleteMethod for usage examples and retry behavior
   */
  delete: HttpClientDeleteMethod;

  /**
   * Register a custom request interceptor.
   * 
   * Request interceptors run before sending the HTTP request.
   * Use for:
   * - Attaching auth tokens (already done by default)
   * - Adding custom headers
   * - Logging request details
   * - Request transformation
   * 
   * Interceptors must be idempotent: running twice should produce
   * the same result.
   * 
   * Usage:
   * ```typescript
   * HttpClient.addRequestInterceptor({
   *   onFulfilled: (config) => {
   *     config.headers['X-Custom-Header'] = 'value';
   *     return config;
   *   }
   * });
   * ```
   * 
   * @param interceptor - Interceptor with onFulfilled and/or onRejected handlers
   * @returns Interceptor ID (can be used to remove later if needed)
   */
  addRequestInterceptor(interceptor: {
    onFulfilled?: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
    onRejected?: (error: unknown) => Promise<never>;
  }): number;

  /**
   * Register a custom response interceptor.
   * 
   * Response interceptors run after receiving the HTTP response (or error).
   * Use for:
   * - Custom error handling
   * - Response transformation
   * - Logging response details
   * - Token refresh logic (advanced)
   * 
   * Interceptors must be idempotent.
   * 
   * Note: Default response interceptor already normalizes errors to ApiError.
   * Custom interceptor runs after, so error is already ApiError if present.
   * 
   * Usage:
   * ```typescript
   * HttpClient.addResponseInterceptor({
   *   onFulfilled: (response) => {
   *     console.log(`${response.status} ${response.statusText}`);
   *     return response;
   *   }
   * });
   * ```
   * 
   * @param interceptor - Interceptor with onFulfilled and/or onRejected handlers
   * @returns Interceptor ID (can be used to remove later if needed)
   */
  addResponseInterceptor(interceptor: {
    onFulfilled?: (response: any) => any | Promise<any>;
    onRejected?: (error: unknown) => Promise<never>;
  }): number;

  /**
   * Get the singleton HttpClient instance.
   * 
   * Usage:
   * ```typescript
   * const client = HttpClient.getInstance();
   * const user = await client.get<User>('/users/me');
   * ```
   * 
   * @returns Singleton HttpClient instance
   */
  getInstance(): HttpClient;

  /**
   * Configure HttpClient at app startup.
   * 
   * Call once in the app's root provider (before any HTTP requests).
   * 
   * Usage:
   * ```typescript
   * HttpClient.configure({
   *   baseURL: 'http://api.example.com',
   *   timeout: 15000,
   *   retryConfig: {
   *     maxRetries: 3,
   *     initialDelayMs: 1000,
   *     baseMultiplier: 2
   *   }
   * });
   * ```
   * 
   * @param config - Configuration object
   */
  configure(config: {
    baseURL: string;
    timeout?: number;
    retryConfig?: {
      maxRetries?: number;
      initialDelayMs?: number;
      baseMultiplier?: number;
    };
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
  }): void;
}

/**
 * Error Contract
 * 
 * All HTTP methods throw ApiError on failure. The error object is guaranteed
 * to have the following shape (never null or undefined).
 * 
 * @see src/types/http.ts for full ApiError definition
 */
export interface ApiError extends Error {
  /**
   * Machine-readable error code.
   * 
   * Examples: 'NETWORK_ERROR', 'UNAUTHORIZED', 'VALIDATION_ERROR', 'SERVER_ERROR'
   * 
   * Use this to branch error-handling logic:
   * ```typescript
   * if (error.code === 'NETWORK_ERROR') {
   *   // Show offline message
   * } else if (error.code === 'UNAUTHORIZED') {
   *   // Redirect to login
   * } else if (error.code === 'VALIDATION_ERROR') {
   *   // Show validation errors
   * }
   * ```
   */
  code: string;

  /**
   * HTTP status code (e.g., 401, 422) or null if socket/network error.
   * 
   * null values indicate no HTTP response was received (connection refused,
   * timeout before response, etc.).
   * 
   * Use for detailed categorization:
   * ```typescript
   * if (error.status === 401) {
   *   // Token expired
   * } else if (error.status === 403) {
   *   // Insufficient permissions
   * } else if (error.status === null) {
   *   // Network unreachable
   * }
   * ```
   */
  status: number | null;

  /**
   * Human-readable error message suitable for displaying to users.
   * 
   * Examples:
   * - "Your session has expired. Please log in again."
   * - "The requested resource was not found."
   * - "Network error. Please check your connection."
   * 
   * Always non-empty.
   */
  message: string;

  /**
   * Backend error details (optional).
   * 
   * For validation errors (422), this typically contains:
   * ```typescript
   * {
   *   errors: {
   *     email: ['Invalid email format'],
   *     password: ['Must be at least 8 characters']
   *   }
   * }
   * ```
   * 
   * For other errors, may contain additional context or error codes.
   * May be undefined if server did not include details.
   */
  data?: unknown;

  /**
   * Original error object (for debugging).
   * 
   * The raw Axios error or JavaScript Error that triggered ApiError.
   * Use only for logging/debugging; do not rely on in production error handling.
   * 
   * May be null if not available.
   */
  originalError: Error | null;
}

/**
 * Usage Example: Complete Error Handling Flow
 * 
 * ```typescript
 * import { HttpClient, type ApiError } from '@/services/api/client';
 * 
 * export const fetchUser = async (userId: string) => {
 *   try {
 *     // Network retries handled automatically
 *     const user = await HttpClient.get<User>(`/users/${userId}`);
 *     return user;
 *   } catch (error) {
 *     // Type guard: HttpClient always throws ApiError
 *     if (error instanceof ApiError || (error && typeof error === 'object' && 'code' in error)) {
 *       const apiError = error as ApiError;
 *       
 *       switch (apiError.code) {
 *         case 'NETWORK_ERROR':
 *           // Show offline banner
 *           showToast('No internet connection. Please check your network.');
 *           break;
 *         
 *         case 'UNAUTHORIZED':
 *           // Clear session and redirect to login
 *           clearSession();
 *           navigateTo('(auth)/login');
 *           break;
 *         
 *         case 'NOT_FOUND':
 *           // Show user-friendly message
 *           showToast('User not found.');
 *           break;
 *         
 *         case 'SERVER_ERROR':
 *           // Log for support and show generic message
 *           console.error('Server error:', apiError.originalError);
 *           showToast('Server error. Please try again later.');
 *           break;
 *         
 *         default:
 *           // Fallback
 *           console.error('Unexpected error:', apiError);
 *           showToast(apiError.message);
 *       }
 *     } else {
 *       // Unexpected error type (should not happen)
 *       console.error('Unexpected error type:', error);
 *     }
 *     throw error;
 *   }
 * };
 * ```
 * 
 * @see quickstart.md for more patterns and examples
 */

/**
 * Contract Summary
 * 
 * ✓ Simple: Five HTTP methods (GET, POST, PUT, PATCH, DELETE)
 * ✓ Explicit: All types documented, error contract guaranteed
 * ✓ Predictable: Same error structure everywhere, deterministic retry logic
 * 
 * Every HTTP request:
 * 1. Injects auth token automatically
 * 2. Retries on network errors and specific HTTP codes (408, 429)
 * 3. Normalizes errors to ApiError
 * 4. Returns strongly typed response or throws ApiError
 * 
 * No exceptions, no surprises.
 */
```

---
