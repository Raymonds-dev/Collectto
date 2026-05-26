```markdown
# HTTP Client Centralization - Developer Quickstart Guide

**Spec:** feature/007-http-client-centralization  
**Phase:** 1 (Implementation Quickstart)  
**Status:** Complete  
**Date:** 2025

**For:** React Native/Expo developers building Collectto  
**Duration:** 15 minutes to read; implement requests in < 5 minutes  

---

## Table of Contents

1. [Import and Initialization](#1-import-and-initialization)
2. [Basic GET Request (Unauthenticated)](#2-basic-get-request-unauthenticated)
3. [POST with Authentication](#3-post-with-authentication)
4. [Error Handling Patterns](#4-error-handling-patterns)
5. [Adding Custom Interceptors](#5-adding-custom-interceptors-example-logging)
6. [Testing HTTP Calls](#6-testing-http-calls-mocking-the-client)
7. [Migration Guide from Existing Code](#7-migration-guide-from-existing-fetchaxios-calls)
8. [Troubleshooting and Common Patterns](#8-troubleshooting-and-common-patterns)

---

## 1. Import and Initialization

### Setup (One-time, in App Root)

The HTTP client is initialized in the app's root provider. **You don't need to configure it** — it's already done at startup.

```typescript
// src/providers/HttpClientProvider.tsx (already exists)
import { HttpClient } from '@/services/api/client';
import { getEnvironmentConfig } from '@/services/api/env';

export const HttpClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const config = getEnvironmentConfig();
    HttpClient.configure({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      retryConfig: {
        maxRetries: 3,
        initialDelayMs: 1000,
        baseMultiplier: 2
      }
    });
  }, []);

  return <>{children}</>;
};
```

### Import in Your Code

In any component, service, or hook, import the client:

```typescript
import { HttpClient } from '@/services/api/client';
```

That's it. No additional setup needed per component.

---

## 2. Basic GET Request (Unauthenticated)

### Scenario: Fetch public data (no auth required)

```typescript
import { HttpClient } from '@/services/api/client';

interface ApiStatus {
  version: string;
  status: 'ok' | 'degraded' | 'down';
}

export const checkApiHealth = async () => {
  const status = await HttpClient.get<ApiStatus>('/health');
  console.log(`API version: ${status.version}, status: ${status.status}`);
  return status;
};
```

**Key Points:**
- `HttpClient.get<T>(url)` returns `Promise<T>` (strongly typed).
- URL is relative to base URL (e.g., `/health` → `http://89.167.89.185:8080/health`).
- No Bearer token is added automatically for this endpoint (token only added if available).

### With Query Parameters

```typescript
interface PaginatedPosts {
  items: Post[];
  total: number;
  limit: number;
  offset: number;
}

export const fetchPublicPosts = async (limit: number = 10, offset: number = 0) => {
  const response = await HttpClient.get<PaginatedPosts>('/posts/public', {
    params: { limit, offset }
  });
  return response;
};
```

**Notes:**
- Use `config.params` (Axios syntax) to pass query parameters.
- Axios encodes them automatically.

---

## 3. POST with Authentication

### Scenario: Create a new post (auth required)

```typescript
import { HttpClient } from '@/services/api/client';

interface CreatePostRequest {
  title: string;
  content: string;
  collectionId: string;
}

interface CreatePostResponse {
  id: string;
  title: string;
  createdAt: string;
  collectionId: string;
}

export const createPost = async (data: CreatePostRequest): Promise<CreatePostResponse> => {
  // Bearer token is automatically attached by request interceptor
  const post = await HttpClient.post<CreatePostResponse>('/posts', data);
  return post;
};
```

**Key Points:**
- Auth token is **automatically injected** by the request interceptor.
- Token is read from session storage (`getSessionToken()`).
- If token is missing, interceptor proceeds without it (server returns 401).
- Data is automatically JSON-encoded (Content-Type: application/json).

### Usage in a Component

```typescript
import { useState } from 'react';
import { createPost } from '@/services/api/posts';

export const PostForm: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (title: string, content: string, collectionId: string) => {
    setLoading(true);
    try {
      const post = await createPost({ title, content, collectionId });
      console.log('Post created:', post.id);
      // Navigate or refresh list
    } catch (error) {
      // See Error Handling section below
      console.error('Failed to create post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit('My Post', 'Content here', 'col-123');
    }}>
      {/* form fields */}
    </form>
  );
};
```

### PUT Request (Replace Entire Resource)

```typescript
interface UpdateUserRequest {
  name: string;
  email: string;
  bio?: string;
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
  bio?: string;
}

export const updateUserProfile = async (
  userId: string,
  data: UpdateUserRequest
): Promise<UserResponse> => {
  // Bearer token automatically attached
  return HttpClient.put<UserResponse>(`/users/${userId}`, data);
};
```

### PATCH Request (Partial Update)

```typescript
interface PartialUserUpdate {
  email?: string;  // Only update email, leaving name and bio unchanged
}

export const updateUserEmail = async (
  userId: string,
  email: string
): Promise<UserResponse> => {
  // Bearer token automatically attached
  return HttpClient.patch<UserResponse>(`/users/${userId}`, { email });
};
```

### DELETE Request

```typescript
interface DeleteResponse {
  ok: true;
  deletedId: string;
}

export const deletePost = async (postId: string): Promise<DeleteResponse> => {
  // Bearer token automatically attached
  return HttpClient.delete<DeleteResponse>(`/posts/${postId}`);
};
```

---

## 4. Error Handling Patterns

### Pattern 1: Try/Catch with Type Guard

```typescript
import { HttpClient, type ApiError } from '@/services/api/client';

export const fetchUser = async (userId: string) => {
  try {
    const user = await HttpClient.get<User>(`/users/${userId}`);
    return user;
  } catch (error) {
    // All errors from HttpClient are ApiError
    const apiError = error as ApiError;

    if (apiError.code === 'NETWORK_ERROR') {
      console.log('No internet. Message:', apiError.message);
      showToast('You are offline. Please check your connection.');
    } else if (apiError.code === 'UNAUTHORIZED') {
      console.log('Token expired or invalid');
      clearSession();
      navigateToLogin();
    } else if (apiError.code === 'NOT_FOUND') {
      showToast('User not found.');
    } else {
      showToast(apiError.message);
    }

    throw error;  // Re-throw for caller to handle if needed
  }
};
```

### Pattern 2: Discriminated Union (Type Safe)

```typescript
type FetchResult<T> = 
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

export const fetchUserSafe = async (userId: string): Promise<FetchResult<User>> => {
  try {
    const data = await HttpClient.get<User>(`/users/${userId}`);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error as ApiError };
  }
};

// Usage
const result = await fetchUserSafe('user-123');
if (result.ok) {
  console.log('User:', result.data.name);
} else {
  console.error('Failed to fetch user:', result.error.message);
}
```

### Pattern 3: Per-Error-Code Handling

```typescript
export const createPost = async (data: CreatePostRequest) => {
  try {
    return await HttpClient.post<PostResponse>('/posts', data);
  } catch (error) {
    const apiError = error as ApiError;

    switch (apiError.code) {
      case 'VALIDATION_ERROR':
        // Backend validation failed (422)
        showValidationErrors(apiError.data as ValidationErrors);
        break;

      case 'UNAUTHORIZED':
        // Token missing or expired (401)
        clearSession();
        navigateToLogin();
        break;

      case 'FORBIDDEN':
        // User lacks permission (403)
        showToast('You cannot create posts in this collection.');
        break;

      case 'RATE_LIMITED':
        // Too many requests (429) — already retried, still failed
        showToast('Too many requests. Please wait a moment and try again.');
        break;

      case 'NETWORK_ERROR':
        // No internet connection
        showToast('No internet. Please check your connection and try again.');
        break;

      case 'SERVER_ERROR':
        // 5xx error
        console.error('Server error. Original:', apiError.originalError);
        showToast('Server error. Please try again later.');
        break;

      default:
        // Unexpected error
        console.error('Unexpected error:', apiError);
        showToast(apiError.message);
    }

    throw error;  // Let parent handle or ignore
  }
};
```

### Pattern 4: Validation Error Details

```typescript
interface ValidationErrorResponse {
  errors: Record<string, string[]>;
}

export const handleValidationError = (apiError: ApiError) => {
  if (apiError.code === 'VALIDATION_ERROR' && apiError.data) {
    const validationData = apiError.data as ValidationErrorResponse;
    return validationData.errors;  // e.g., { email: ['Invalid email'], password: ['Too short'] }
  }
  return null;
};

// Usage in form
const onSubmit = async (formData) => {
  try {
    await submitForm(formData);
  } catch (error) {
    const validationErrors = handleValidationError(error as ApiError);
    if (validationErrors) {
      // Display validation errors near form fields
      setFormErrors(validationErrors);
    } else {
      // Show general error
      showToast((error as ApiError).message);
    }
  }
};
```

### Pattern 5: Retry with Exponential Backoff (Manual)

Retries are **automatic** for network errors, 408, and 429. However, if you want manual retry logic:

```typescript
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchWithManualRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as ApiError;
      
      // Only retry on specific codes
      if (!['NETWORK_ERROR', 'REQUEST_TIMEOUT', 'RATE_LIMITED'].includes(lastError.code)) {
        throw error;  // Non-retryable, throw immediately
      }

      if (attempt < maxRetries - 1) {
        const delay = 1000 * Math.pow(2, attempt);  // 1s, 2s, 4s
        console.log(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw lastError;
};

// Usage
const user = await fetchWithManualRetry(() => 
  HttpClient.get<User>('/users/me')
);
```

---

## 5. Adding Custom Interceptors (Example: Logging)

### Add Request Logging

```typescript
import { HttpClient } from '@/services/api/client';

// In app startup or provider
HttpClient.addRequestInterceptor({
  onFulfilled: (config) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data) {
      console.log('Request body:', config.data);
    }
    return config;
  }
});
```

### Add Response Logging

```typescript
import { HttpClient } from '@/services/api/client';

// In app startup or provider
HttpClient.addResponseInterceptor({
  onFulfilled: (response) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${response.status} ${response.statusText}`);
    return response;
  },
  onRejected: (error) => {
    if (error instanceof Error) {
      console.error('Response error:', error.message);
    }
    return Promise.reject(error);
  }
});
```

### Custom Headers for Specific Requests

```typescript
export const uploadFile = async (fileData: FormData) => {
  // Don't override Content-Type; let browser set it with boundary
  return HttpClient.post<UploadResponse>('/upload', fileData, {
    headers: {
      'Content-Type': 'multipart/form-data'  // Axios handles this automatically
    }
  });
};
```

### Add Custom Trace ID for Debugging

```typescript
import { HttpClient } from '@/services/api/client';
import { v4 as uuidv4 } from 'uuid';  // or similar

HttpClient.addRequestInterceptor({
  onFulfilled: (config) => {
    config.headers = config.headers || {};
    config.headers['X-Trace-ID'] = uuidv4();
    return config;
  }
});
```

---

## 6. Testing HTTP Calls (Mocking the Client)

### Unit Test with Mocked HttpClient

```typescript
// src/services/api/posts.test.ts
import { HttpClient } from '@/services/api/client';
import { createPost } from './posts';

// Mock the HttpClient
jest.mock('@/services/api/client');

describe('createPost', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a post with valid data', async () => {
    const mockPost = { id: '123', title: 'Hello', createdAt: '2025-01-01T00:00:00Z' };
    (HttpClient.post as jest.Mock).mockResolvedValue(mockPost);

    const result = await createPost({
      title: 'Hello',
      content: 'World',
      collectionId: 'col-1'
    });

    expect(result).toEqual(mockPost);
    expect(HttpClient.post).toHaveBeenCalledWith('/posts', {
      title: 'Hello',
      content: 'World',
      collectionId: 'col-1'
    });
  });

  it('should handle validation errors', async () => {
    const mockError = {
      code: 'VALIDATION_ERROR',
      status: 422,
      message: 'Validation failed',
      data: { errors: { title: ['Required'] } },
      originalError: null
    };
    (HttpClient.post as jest.Mock).mockRejectedValue(mockError);

    await expect(createPost({
      title: '',  // Invalid
      content: 'World',
      collectionId: 'col-1'
    })).rejects.toEqual(mockError);
  });
});
```

### Integration Test (Optional: Use MSW for Real-like Tests)

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/posts', async ({ request }) => {
    const body = await request.json();
    if (!body.title) {
      return HttpResponse.json(
        { errors: { title: ['Required'] } },
        { status: 422 }
      );
    }
    return HttpResponse.json(
      { id: '123', ...body, createdAt: new Date().toISOString() },
      { status: 201 }
    );
  })
];
```

### Component Test with React Testing Library

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { PostForm } from './PostForm';
import { createPost } from '@/services/api/posts';

jest.mock('@/services/api/posts');

describe('PostForm', () => {
  it('should display success message on successful post creation', async () => {
    (createPost as jest.Mock).mockResolvedValue({
      id: '123',
      title: 'Test Post'
    });

    render(<PostForm />);

    fireEvent.changeText(screen.getByPlaceholderText('Title'), 'Test Post');
    fireEvent.changeText(screen.getByPlaceholderText('Content'), 'Content');
    fireEvent.press(screen.getByText('Create'));

    await waitFor(() => {
      expect(screen.getByText('Post created successfully')).toBeTruthy();
    });
  });

  it('should display error message on failure', async () => {
    const error = {
      code: 'NETWORK_ERROR',
      message: 'No internet connection'
    };
    (createPost as jest.Mock).mockRejectedValue(error);

    render(<PostForm />);

    fireEvent.press(screen.getByText('Create'));

    await waitFor(() => {
      expect(screen.getByText('No internet connection')).toBeTruthy();
    });
  });
});
```

---

## 7. Migration Guide from Existing Fetch/Axios Calls

### Before: Direct Axios Usage

```typescript
// ❌ OLD: Direct axios, no error normalization, no retries
import axios from 'axios';

export const fetchUser = async (userId: string) => {
  try {
    const response = await axios.get(`http://89.167.89.185:8080/users/${userId}`);
    return response.data;
  } catch (error) {
    // Error shape is inconsistent; manually retry, manually attach token
    console.error(error);
    throw error;
  }
};
```

### After: HttpClient

```typescript
// ✅ NEW: HttpClient, automatic retries, error normalization, auth
import { HttpClient } from '@/services/api/client';

export const fetchUser = async (userId: string) => {
  try {
    // Retries, auth, error normalization all automatic
    return await HttpClient.get<User>(`/users/${userId}`);
  } catch (error) {
    // Error is always ApiError with consistent shape
    const apiError = error as ApiError;
    console.error(`${apiError.code}: ${apiError.message}`);
    throw error;
  }
};
```

### Migration Checklist

- [ ] Replace `axios.get(url)` with `HttpClient.get<T>(url)`
- [ ] Replace `axios.post(url, data)` with `HttpClient.post<T>(url, data)`
- [ ] Remove manual token attachment (interceptor handles it)
- [ ] Remove manual retry logic (client handles it)
- [ ] Update error handlers to use `ApiError.code` instead of `status`
- [ ] Remove hardcoded base URLs (use relative paths)
- [ ] Add type parameter `<T>` to all calls for IDE autocomplete
- [ ] Run linter and tests
- [ ] Test error cases (network, 401, 422, etc.)

### Before and After Side-by-Side

| Aspect | Before | After |
|--------|--------|-------|
| **Import** | `import axios from 'axios'` | `import { HttpClient } from '@/services/api/client'` |
| **Base URL** | Hardcoded in every call | Configured once at startup |
| **Auth Token** | Manually attached in each request | Automatic via interceptor |
| **Error Shape** | Varies (AxiosError, network error, etc.) | Always ApiError |
| **Retries** | Manual or not at all | Automatic (3 attempts, exponential backoff) |
| **Typing** | `response.data as User` (unsafe) | `HttpClient.get<User>(url)` (safe) |
| **Timeout** | Manually set per request | Configured once (15s default) |

---

## 8. Troubleshooting and Common Patterns

### Issue 1: "Cannot find module HttpClient"

**Problem:** Import path is wrong or client not exported.

**Solution:**
```typescript
// ✓ Correct import
import { HttpClient } from '@/services/api/client';

// ✗ Wrong imports
import HttpClient from '@/services/api/client';  // No default export
import { HttpClient } from '@/services/api';  // Wrong path
```

### Issue 2: "Bearer token is not being attached"

**Problem:** Token is in session storage but not appearing in request headers.

**Debugging:**
1. Check that token exists in session storage:
   ```typescript
   import { getSessionToken } from '@/services/storage/session';
   console.log('Token:', getSessionToken());  // Should not be null/undefined
   ```

2. Add logging interceptor to see headers:
   ```typescript
   HttpClient.addRequestInterceptor({
     onFulfilled: (config) => {
       console.log('Auth header:', config.headers.Authorization);
       return config;
     }
   });
   ```

3. If missing, ensure `getSessionToken()` is returning the token correctly.

### Issue 3: "Requests are timing out on slow networks"

**Problem:** 15-second timeout is too short for very slow networks.

**Solution:** Increase timeout when necessary:
```typescript
// One-time override for slow endpoint
const slowData = await HttpClient.get<SlowData>('/slow-endpoint', {
  timeout: 30000  // 30 seconds for this request
});

// Or configure globally in provider
HttpClient.configure({
  baseURL: config.baseUrl,
  timeout: 30000  // Increase default timeout
});
```

### Issue 4: "How do I handle retry logic differently?"

**Pattern:** Custom retry for specific status codes

```typescript
export const fetchUserWithCustomRetry = async (userId: string) => {
  let retries = 0;
  const maxRetries = 5;  // More retries for this specific endpoint

  while (retries < maxRetries) {
    try {
      return await HttpClient.get<User>(`/users/${userId}`);
    } catch (error) {
      const apiError = error as ApiError;
      
      // Retry on 429 (rate limit) but not 404 (not found)
      if (apiError.status === 429 && retries < maxRetries - 1) {
        retries++;
        await sleep(2000 * retries);  // Exponential backoff
        continue;
      }

      throw error;
    }
  }
};
```

### Issue 5: "I need to log all requests/responses"

**Solution:** Add interceptors in the provider:

```typescript
export const setupHttpClientLogging = () => {
  HttpClient.addRequestInterceptor({
    onFulfilled: (config) => {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    }
  });

  HttpClient.addResponseInterceptor({
    onFulfilled: (response) => {
      console.log(`📥 ${response.status} ${response.statusText}`);
      return response;
    },
    onRejected: (error) => {
      if (error && typeof error === 'object' && 'code' in error) {
        const apiError = error as ApiError;
        console.log(`❌ ${apiError.code}: ${apiError.message}`);
      }
      return Promise.reject(error);
    }
  });
};
```

### Issue 6: "How do I cancel requests?"

**Pattern:** Use Axios AbortController

```typescript
export const createCancellableRequest = <T>(url: string) => {
  const controller = new AbortController();
  const promise = HttpClient.get<T>(url, {
    signal: controller.signal
  });

  return {
    promise,
    cancel: () => controller.abort()
  };
};

// Usage
const { promise, cancel } = createCancellableRequest<User>('/users/me');

// Later, if needed
cancel();  // Cancels the request
```

### Issue 7: "How do I upload files?"

**Pattern:** FormData with HttpClient

```typescript
export const uploadProfilePicture = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return HttpClient.post<UploadResponse>('/upload/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'  // Let browser/Axios handle boundary
    }
  });
};

// In React Native with expo-image-picker
import * as ImagePicker from 'expo-image-picker';

const handlePickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync();
  if (!result.canceled) {
    const file = result.assets[0];
    // Convert to blob/file format suitable for FormData
    const uploadResponse = await uploadProfilePicture(file);
  }
};
```

### Issue 8: "Status code is null but I expected a number"

**Problem:** Network error occurred before HTTP response.

**Explanation:** `status` is `null` for socket errors (ECONNREFUSED, ENOTFOUND, ETIMEDOUT with no response).

**Pattern:** Check `code` instead:

```typescript
catch (error) {
  const apiError = error as ApiError;
  
  if (apiError.status === null) {
    // Network error; no HTTP response received
    console.log('Network issue:', apiError.code);
  } else {
    // HTTP response received with error status
    console.log('Server error:', apiError.status);
  }
}
```

### Issue 9: "How do I test components that use HttpClient?"

**Pattern:** Mock at the module level (see Section 6 above)

```typescript
jest.mock('@/services/api/client', () => ({
  HttpClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    addRequestInterceptor: jest.fn(),
    addResponseInterceptor: jest.fn(),
    configure: jest.fn(),
    getInstance: jest.fn()
  }
}));
```

### Issue 10: "Can I use HttpClient with React Query or similar?"

**Pattern:** Yes, HttpClient works with any data-fetching library:

```typescript
import { useQuery } from '@tanstack/react-query';
import { HttpClient } from '@/services/api/client';

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => HttpClient.get<User>(`/users/${userId}`),
    // Error is automatically ApiError
    onError: (error: ApiError) => {
      console.error(`${error.code}: ${error.message}`);
    }
  });
};
```

---

## Common Patterns Reference

### Pattern: Loading + Error + Retry

```typescript
export const useFetchUser = (userId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<User | null>(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await HttpClient.get<User>(`/users/${userId}`);
      setData(user);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [userId]);

  return { loading, error, data, retry: fetch };
};
```

### Pattern: Optimistic Update

```typescript
export const useOptimisticPost = (collectionId: string) => {
  const [posts, setPosts] = useState<Post[]>([]);

  const createPost = async (title: string, content: string) => {
    const optimisticPost: Post = {
      id: Math.random().toString(),  // Temporary ID
      title,
      content,
      createdAt: new Date().toISOString(),
      collectionId
    };

    // Optimistic update
    setPosts(prev => [optimisticPost, ...prev]);

    try {
      const created = await HttpClient.post<Post>('/posts', {
        title,
        content,
        collectionId
      });

      // Replace temporary with real
      setPosts(prev => prev.map(p => p.id === optimisticPost.id ? created : p));
    } catch (error) {
      // Revert on error
      setPosts(prev => prev.filter(p => p.id !== optimisticPost.id));
      throw error;
    }
  };

  return { posts, createPost };
};
```

### Pattern: Request Deduplication

```typescript
const pendingRequests = new Map<string, Promise<any>>();

export const fetchUserDedup = async (userId: string) => {
  const key = `user:${userId}`;

  if (pendingRequests.has(key)) {
    // Request already in flight; return existing promise
    return pendingRequests.get(key);
  }

  const promise = HttpClient.get<User>(`/users/${userId}`);
  pendingRequests.set(key, promise);

  try {
    const result = await promise;
    return result;
  } finally {
    pendingRequests.delete(key);
  }
};
```

---

## Quick Reference

```typescript
// Import
import { HttpClient, type ApiError } from '@/services/api/client';

// GET (with typing)
const user = await HttpClient.get<User>('/users/me');

// POST (with body)
const post = await HttpClient.post<Post>('/posts', { title: 'Hello' });

// PUT (replace)
await HttpClient.put<User>(`/users/${id}`, { name: 'New Name' });

// PATCH (partial update)
await HttpClient.patch<User>(`/users/${id}`, { email: 'new@example.com' });

// DELETE
await HttpClient.delete(`/posts/${id}`);

// Error handling
try {
  // ...
} catch (error) {
  const apiError = error as ApiError;
  console.log(apiError.code, apiError.status, apiError.message);
}

// Add interceptor
HttpClient.addRequestInterceptor({
  onFulfilled: (config) => {
    // Modify config
    return config;
  }
});

// Configure at startup
HttpClient.configure({
  baseURL: 'http://api.example.com',
  timeout: 15000,
  retryConfig: { maxRetries: 3, initialDelayMs: 1000, baseMultiplier: 2 }
});
```

---

## Summary

✅ **All HTTP calls go through HttpClient**  
✅ **Auth token attached automatically**  
✅ **Retries on network errors and 408/429**  
✅ **Errors always normalized to ApiError**  
✅ **Strong typing with generics**  
✅ **Consistent error handling across the app**  

**Next:** Start migrating existing calls. Pick one service, replace all calls, test, commit. Repeat.

---
```

---

# Summary

All 4 artifacts have been generated with complete, production-ready content:

1. **research.md** — Consolidates research on 5 areas (Axios interceptors, exponential backoff, TypeScript typing, environment config, React Native specifics) with Decision/Rationale/Alternatives for each.

2. **data-model.md** — Documents all key entities (HttpClientConfiguration, RequestInterceptor, ResponseInterceptor, ApiError, RetryConfig, EnvironmentConfig) with fields, validation rules, and relationships.

3. **contracts/http-client.contract.ts** — TypeScript interface file defining the public API contract with method signatures (get, post, put, patch, delete), interceptor registration, configuration, and comprehensive JSDoc comments with usage examples.

4. **quickstart.md** — 8-section developer guide covering import/initialization, GET requests, POST with auth, error handling patterns, custom interceptors, testing, migration from existing code, and troubleshooting.

All artifacts align with **Collectto's Constitution (1.0.0)** principles:
- **Simple**: 2-interceptor pattern, 3 retry attempts, clear method signatures
- **Explicit**: All types documented, error contract guaranteed, no hidden behavior
- **Predictable**: Consistent retry logic, deterministic error structure, same shape everywhere

