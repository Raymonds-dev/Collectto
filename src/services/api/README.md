# Centralized HTTP Client (HttpClient)

This folder contains the centralized, typed HTTP client for the Collectto frontend. It wraps Axios and provides automatic token injection, exponential backoff retries, and unified error mapping.

## File Structure

- [client.ts](./client.ts): Core `HttpClient` singleton implementation.
- [types.ts](./types.ts): TypeScript interface and `ApiError` class definitions.
- [config.ts](./config.ts): Defaults and constants (e.g. 15s timeout, retry parameters).
- [env.ts](./env.ts): Dynamically loads environment configurations (e.g. `EXPO_PUBLIC_API_BASE_URL`).
- [interceptors.ts](./interceptors.ts): Request & response interceptors (Auth injection, Retry backoff, Error normalization).
- [api.ts](./api.ts): Backward-compatible API method exports (e.g. `getUserById`, `updateProfile`).
- [explore.ts](./explore.ts): Explore social feed service utilizing the HTTP client.

## Core Features

1. **Automatic Auth Token Injection**: Automatically retrieves the authentication token asynchronously from `SecureStore` (via `getSessionToken`) and attaches it as `Authorization: Bearer <token>` for all outgoing requests.
2. **Exponential Backoff Retry**: Automatically retries failed requests up to 3 times if they suffer from transient network errors (offline, timeouts, connection aborts) or 5xx server-level status codes (like 502/503/504). Retries are delayed exponentially (1s -> 2s -> 4s). 4xx client errors (excluding 408/429) are never retried.
3. **Normalized Error Handling**: Converts any request/response error (HTTP status errors, connection timeouts, CORS, offline) into a standardized `ApiError` class instance.
4. **Configuration Defaults**: Enforces a global default timeout of 15 seconds.

## Usage

Import the default `api` instance from `./client` or `./api` to perform operations:

```typescript
import { api } from '@/services/api/client';

// Performing a GET request
const user = await api.get<AuthUser>(`/users/${userId}`);

// Performing a POST request
const newPost = await api.post<PostResponse>('/posts', { title: 'My Collection' });
```

### Direct Destructuring

Unlike standard Axios, all HTTP operations resolve directly to the **response data** payload on success, rather than the Axios response object. You do not need to destructure `{ data }` from the response.

```typescript
// Correct
const collections = await api.get<Collection[]>('/collections');

// Incorrect (will result in undefined value)
const { data } = await api.get<Collection[]>('/collections');
```

## Error Handling

All HTTP client calls are guaranteed to throw an instance of the `ApiError` class on failure. You can check the error using `instanceof ApiError` and access normalized properties:

```typescript
import { ApiError } from '@/services/api/types';

try {
  await api.post('/posts', newPostData);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`Error [${error.code}]: ${error.message}`);
    if (error.status === 422) {
      // Access validation error details returned by backend
      console.log('Validation fields:', error.data);
    }
  }
}
```

### ApiError Structure

```typescript
interface ApiError extends Error {
  code: string; // Normalized machine-readable code ('NETWORK_ERROR', 'UNAUTHORIZED', etc.)
  status: number | null; // HTTP status code (null if network/socket error)
  message: string; // Human-friendly message (suitable for toast alerts or UI dialogs)
  data?: any; // Optional raw body details returned from the server (validation maps, etc.)
  originalError: Error; // Reference to the original AxiosError or generic Error
}
```
