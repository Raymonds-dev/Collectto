# Quickstart: Profile Screen API Integration

**Feature**: Profile Screen API Integration (006) | **Phase**: 1 Design | **Audience**: Developers implementing Phase 2 | **Date**: 2026-05-19

---

## 🚀 Quick Reference

### Key Services (Phase 2 Foundational)

```typescript
// Profile
import { profileService } from '@/services/api/profileService';
const user = await profileService.getProfile(userId);
await profileService.updateProfile(userId, { name: 'New Name' });

// Collections
import { collectionAPIService } from '@/services/api/collectionAPIService';
const collections = await collectionAPIService.getCollectionsByUser(userId, 0, 10);
await collectionAPIService.createCollection({ name: 'My Collection', description: '...' });
await collectionAPIService.deleteCollection({ collectionId, strategy: 'DELETE_ALL_ITEMS' });

// Items
import { itemAPIService } from '@/services/api/itemAPIService';
const items = await itemAPIService.getItemsByCollection(collectionId, 0, 10);
await itemAPIService.createItem({ collectionId, name: 'Item Name' });

// Upload
import { uploadService } from '@/services/api/uploadService';
const { uploadUrls } = await uploadService.generatePresignedUrls({
  context: 'PROFILE_PICTURE',
  resourceId: userId,
  files: [{ filename: 'photo.jpg', mimeType: 'image/jpeg', size: 2048000 }]
});
```

### Key Hooks (Phase 2 Foundational)

```typescript
// Profile (5-min cache, stale-while-revalidate)
import { useProfile } from '@/hooks/useProfile';
const { data: user, loading, error, refresh } = useProfile(userId);

// Collections (paginated + cached)
import { useCollections } from '@/hooks/useCollections';
const { data: collections, page, setPage, loading, error } = useCollections(userId, 10);

// Items (paginated + cached)
import { useItems } from '@/hooks/useItems';
const { data: items, page, setPage, loading, error } = useItems(collectionId, 10);

// Retry (exponential backoff, max 5 retries)
import { useRetry } from '@/hooks/useRetry';
const { retry, isRetrying } = useRetry();
```

---

## 1. Setting Up Services (Phase 2 - Task 004-007)

### 1.1 Profile Service

**File**: `src/services/api/profileService.ts`

```typescript
import axios from '@/services/api/client'; // Existing axios instance
import { UserResponse, UpdateUserRequest } from '@/types';

const PROFILE_CACHE_KEY = 'profile_';

export const profileService = {
  async getProfile(userId: string): Promise<UserResponse> {
    try {
      const response = await axios.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      // Handle error (401 → re-auth, 403 → permission, 5xx → retry)
      throw error;
    }
  },

  async updateProfile(userId: string, data: UpdateUserRequest): Promise<UserResponse> {
    try {
      const response = await axios.patch('/users/update', data);
      // Invalidate cache
      await storage.remove(PROFILE_CACHE_KEY + userId);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async clearCache(userId?: string): Promise<void> {
    if (userId) {
      await storage.remove(PROFILE_CACHE_KEY + userId);
    }
  }
};
```

### 1.2 Collection Service

**File**: `src/services/api/collectionAPIService.ts`

```typescript
import axios from '@/services/api/client';
import {
  CollectionResponse,
  CollectionPageResponse,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  DeleteCollectionRequest,
  DeleteCollectionResponse,
} from '@/types';

export const collectionAPIService = {
  async getCollectionsByUser(
    userId: string,
    page: number,
    size: number
  ): Promise<CollectionPageResponse> {
    const response = await axios.get(`/collections/by-user/${userId}`, {
      params: { page, size }
    });
    return response.data;
  },

  async getCollection(collectionId: string): Promise<CollectionResponse> {
    const response = await axios.get(`/collections/${collectionId}`);
    return response.data;
  },

  async createCollection(data: CreateCollectionRequest): Promise<CollectionResponse> {
    const response = await axios.post('/collections/create', data);
    // Invalidate user's collection list
    return response.data;
  },

  async updateCollection(
    collectionId: string,
    data: UpdateCollectionRequest
  ): Promise<CollectionResponse> {
    const response = await axios.patch(`/collections/${collectionId}`, data);
    return response.data;
  },

  async deleteCollection(
    request: DeleteCollectionRequest
  ): Promise<DeleteCollectionResponse | void> {
    const response = await axios.delete(`/collections/${request.collectionId}`, {
      data: request
    });
    return response.data;
  },

  async followCollection(collectionId: string): Promise<CollectionResponse> {
    const response = await axios.post(`/collections/follow/${collectionId}`);
    return response.data;
  },

  async unfollowCollection(collectionId: string): Promise<void> {
    await axios.delete(`/collections/follow/${collectionId}`);
  },

  async clearCache(collectionId?: string, userId?: string): Promise<void> {
    // Implement based on cache strategy
  }
};
```

### 1.3 Item Service

**File**: `src/services/api/itemAPIService.ts`

```typescript
import axios from '@/services/api/client';
import {
  ItemResponse,
  ItemPageResponse,
  CreateItemRequest,
  UpdateItemRequest,
  MoveItemCommand,
  MoveItemsBulkCommand,
  MoveItemsResponse,
  DeleteItemsBulkResponse,
} from '@/types';

export const itemAPIService = {
  async getItemsByCollection(
    collectionId: string,
    page: number,
    size: number
  ): Promise<ItemPageResponse> {
    const response = await axios.get(`/items/by-collection/${collectionId}`, {
      params: { page, size }
    });
    return response.data;
  },

  async getItem(collectionId: string, itemId: string): Promise<ItemResponse> {
    const response = await axios.get(`/items/${collectionId}/${itemId}`);
    return response.data;
  },

  async createItem(data: CreateItemRequest): Promise<ItemResponse> {
    const response = await axios.post('/items/create', data);
    return response.data;
  },

  async updateItem(itemId: string, data: UpdateItemRequest): Promise<ItemResponse> {
    const response = await axios.patch(`/items/${itemId}`, data);
    return response.data;
  },

  async deleteItem(itemId: string): Promise<void> {
    await axios.delete(`/items/${itemId}`);
  },

  async moveItem(command: MoveItemCommand): Promise<ItemResponse> {
    const response = await axios.post('/items/move', { items: [command] });
    return response.data;
  },

  async moveItemsBulk(command: MoveItemsBulkCommand): Promise<MoveItemsResponse> {
    const response = await axios.post('/items/move', command);
    return response.data;
  },

  async deleteItemsBulk(itemIds: string[]): Promise<DeleteItemsBulkResponse> {
    const response = await axios.delete('/items', { data: { itemIds } });
    return response.data;
  },

  async likeItem(itemId: string): Promise<ItemResponse> {
    const response = await axios.post(`/items/${itemId}/like`);
    return response.data;
  },

  async unlikeItem(itemId: string): Promise<ItemResponse> {
    const response = await axios.delete(`/items/${itemId}/like`);
    return response.data;
  },

  async clearCache(itemId?: string, collectionId?: string): Promise<void> {
    // Implement based on cache strategy
  }
};
```

### 1.4 Upload Service

**File**: `src/services/api/uploadService.ts`

```typescript
import axios from '@/services/api/client';
import { GenerateUploadUrlsRequest, GenerateUploadUrlsResponse, UploadContext } from '@/types';

export const uploadService = {
  async generatePresignedUrls(
    request: GenerateUploadUrlsRequest
  ): Promise<GenerateUploadUrlsResponse> {
    const response = await axios.post('/uploads/presigned-urls', request);
    return response.data;
  },

  async uploadFileToPresignedUrl(
    presignedUrl: string,
    file: Blob | File,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          onProgress(e.loaded, e.total);
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload error')));
      xhr.open('PUT', presignedUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  }
};
```

---

## 2. Setting Up Hooks (Phase 2 - Task 005-012)

### 2.1 Cache Layer Utilities

**File**: `src/services/cache/cacheManager.ts`

```typescript
import * as storage from '@/services/storage';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

const cache = new Map<string, CacheEntry<any>>();

function isExpired(entry: CacheEntry<any>): boolean {
  return Date.now() - entry.timestamp > entry.ttl;
}

export const cacheManager = {
  async get<T>(key: string): Promise<T | null> {
    // Check in-memory first
    const inMemory = cache.get(key);
    if (inMemory && !isExpired(inMemory)) {
      return inMemory.data as T;
    }

    // Check AsyncStorage
    const persisted = await storage.get(key);
    if (persisted) {
      const entry: CacheEntry<T> = JSON.parse(persisted);
      if (!isExpired(entry)) {
        cache.set(key, entry); // Restore to in-memory
        return entry.data;
      }
    }

    return null;
  },

  async set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    };

    cache.set(key, entry);
    await storage.set(key, JSON.stringify(entry));
  },

  async remove(key: string): Promise<void> {
    cache.delete(key);
    await storage.remove(key);
  }
};
```

### 2.2 useProfile Hook

**File**: `src/hooks/useProfile.ts`

```typescript
import { useEffect, useState } from 'react';
import { profileService } from '@/services/api/profileService';
import { cacheManager } from '@/services/cache/cacheManager';
import { UserResponse } from '@/types';
import { useRetry } from './useRetry';

export function useProfile(userId: string) {
  const [data, setData] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { retry } = useRetry();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const cached = await cacheManager.get<UserResponse>(`profile_${userId}`);
        if (cached) {
          setData(cached);
          setLoading(false);

          // Background revalidation
          try {
            const fresh = await retry(() => profileService.getProfile(userId));
            await cacheManager.set(`profile_${userId}`, fresh);
            setData(fresh);
          } catch (refreshError) {
            // Use stale cache, silently fail revalidation
          }
        } else {
          const fresh = await retry(() => profileService.getProfile(userId));
          await cacheManager.set(`profile_${userId}`, fresh);
          setData(fresh);
          setLoading(false);
        }
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const refresh = async () => {
    setLoading(true);
    try {
      const fresh = await retry(() => profileService.getProfile(userId));
      await cacheManager.set(`profile_${userId}`, fresh);
      setData(fresh);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refresh };
}
```

### 2.3 useRetry Hook

**File**: `src/hooks/useRetry.ts`

```typescript
import { useState } from 'react';

interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
}

function isRetryable(error: any): boolean {
  if (!error.response) return true; // Network error, timeout
  const status = error.response.status;
  // Retry on 5xx and network errors, not on 4xx client errors
  return status >= 500 || !error.response;
}

export function useRetry(options: RetryOptions = {}) {
  const { maxRetries = 5, baseDelayMs = 100 } = options;
  const [isRetrying, setIsRetrying] = useState(false);

  async function retry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setIsRetrying(attempt > 0);
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (!isRetryable(error) || attempt === maxRetries) {
          setIsRetrying(false);
          throw error;
        }

        // Exponential backoff with jitter
        const delay = baseDelayMs * Math.pow(2, attempt) * (1 + Math.random() * 0.5);
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    throw lastError;
  }

  return { retry, isRetrying };
}
```

---

## 3. Component Integration (Phase 3+ - User Stories)

### 3.1 ProfileHeader Component

```typescript
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/providers/auth';

export function ProfileHeader() {
  const { auth } = useAuth();
  const { data: user, loading, error, refresh } = useProfile(auth!.id);

  if (loading) return <ProfileSkeleton />;
  if (error) return <ErrorState error={error} onRetry={refresh} />;
  if (!user) return null;

  return (
    <View className="p-4">
      <Text className="text-2xl font-bold">{user.name}</Text>
      <Text className="text-neutral-500">@{user.username}</Text>
      <Text className="mt-2">{user.bio}</Text>
      <TouchableOpacity onPress={() => setEditModalVisible(true)}>
        <Text>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 3.2 ProfileEditForm Component

```typescript
import { useProfile } from '@/hooks/useProfile';
import { useRetry } from '@/hooks/useRetry';
import { profileService } from '@/services/api/profileService';

export function ProfileEditForm() {
  const { auth } = useAuth();
  const { refresh } = useProfile(auth!.id);
  const { retry, isRetrying } = useRetry();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  const handleSave = async () => {
    try {
      await retry(() =>
        profileService.updateProfile(auth!.id, { name, bio })
      );
      refresh(); // Refresh profile
      Toast.show({ message: 'Profile updated!' });
    } catch (error) {
      Toast.show({ message: 'Update failed: ' + error.message });
    }
  };

  return (
    <View>
      <TextInput value={name} onChangeText={setName} placeholder="Name" />
      <TextInput value={bio} onChangeText={setBio} placeholder="Bio" multiline />
      <Button onPress={handleSave} loading={isRetrying}>
        Save Profile
      </Button>
    </View>
  );
}
```

---

## 4. Error Handling Patterns

### 4.1 Context-Specific Error Messages

```typescript
function getErrorMessage(error: any): string {
  if (!error.response) {
    return 'Connection error. Please check your internet.';
  }

  const status = error.response.status;

  switch (status) {
    case 400:
      return error.response.data?.message || 'Invalid request.';
    case 401:
      return 'Session expired. Please log in again.';
    case 403:
      return 'You don\'t have permission to perform this action.';
    case 404:
      return 'Resource not found.';
    case 409:
      return error.response.data?.message || 'Conflict: item may already exist.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
    case 502:
    case 503:
      return 'Server error. Retrying...';
    default:
      return 'Something went wrong. Please try again.';
  }
}
```

### 4.2 Offline Mode

```typescript
import NetInfo from '@react-native-community/netinfo';

async function ensureOnline(): Promise<void> {
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    throw new Error('Offline: writes not allowed. Please check your connection.');
  }
}

// In service
export const profileService = {
  async updateProfile(userId: string, data: UpdateUserRequest): Promise<UserResponse> {
    await ensureOnline(); // Block write if offline
    // Continue with API call
  }
};
```

---

## 5. Testing Scenarios

### Integration Test: Profile Update Flow

```typescript
test('Profile update with image upload', async () => {
  // 1. Get cached profile
  const profile = await cacheManager.get('profile_user123');
  expect(profile).toBeDefined();

  // 2. Generate pre-signed URL for image
  const { uploadUrls } = await uploadService.generatePresignedUrls({
    context: 'PROFILE_PICTURE',
    resourceId: 'user123',
    files: [{ filename: 'avatar.jpg', mimeType: 'image/jpeg', size: 2048000 }]
  });

  // 3. Upload to S3 (mock or real)
  await uploadService.uploadFileToPresignedUrl(uploadUrls['avatar.jpg'], file);

  // 4. Update profile with new image URL
  const updated = await profileService.updateProfile('user123', {
    profilePictureUrl: uploadUrls['avatar.jpg']
  });

  // 5. Cache invalidated + revalidated
  expect(updated.profilePictureUrl).toBe(uploadUrls['avatar.jpg']);
});
```

---

## 6. Performance Checklist

- [ ] Profile loads ≤2s (cold cache)
- [ ] Edit response ≤1s after API responds
- [ ] Collections/items paginate smoothly (10+ items)
- [ ] Media upload ≤5s for ≤5MB files
- [ ] No memory leaks on component unmount
- [ ] Cache TTL tuned (5 min default)
- [ ] Offline mode doesn't crash

---

## 7. References

- **Contracts**: `/specs/006-profile-api-integration/contracts/`
- **Data Model**: `/specs/006-profile-api-integration/data-model.md`
- **Research**: `/specs/006-profile-api-integration/research.md`
- **Spec**: `/specs/006-profile-api-integration/spec.md`
- **Types**: `src/types/{auth,collections,items}.ts`

---

**Happy coding! 🚀**

