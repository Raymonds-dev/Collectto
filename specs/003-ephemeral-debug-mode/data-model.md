# Data Model: API-Aligned Debug Mode

**Date**: 2026-05-12 | **Feature**: [specs/003-ephemeral-debug-mode/spec.md](spec.md)  
**Scope**: Canonical models aligned to the Swagger API, with DEBUG session notes where needed.

---

## Canonical API Models

These are the model shapes that the app should treat as the source of truth when mapping data, even in DEBUG mode. The session can remain in memory, but the field names and enums should mirror the API.

### Auth

```typescript
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
}

export interface CreateUserRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  birthdayDate: string;
}

export interface CreateUserResponse {
  id: string;
  name: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  username?: string;
  bio?: string;
  profilePictureUrl?: string | null;
  profileBackgroundUrl?: string | null;
  birthdayDate?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  profilePictureUrl?: string;
  profileBackgroundUrl?: string;
  followersCount?: number;
  followingCount?: number;
  isActive?: boolean;
  birthdayDate?: string;
  createdAt: string;
}
```

### Collection

```typescript
export type CollectionVisibility = 'PUBLIC' | 'PRIVATE' | 'FRIENDS';

export interface CreateCollectionRequest {
  name: string;
  description: string;
  coverImageUrl?: string | null;
  tags?: string[];
}

export interface UpdateCollectionRequest {
  id: string;
  name?: string;
  description?: string;
  coverImageUrl?: string | null;
  visibility?: CollectionVisibility;
  tags?: string[];
}

export interface CollectionResponse {
  id: string;
  userId: string;
  name: string;
  description: string;
  coverImageURL?: string;
  visibility: CollectionVisibility;
  followersCount: number;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionSummaryResponse {
  id: string;
  name: string;
  imagesURL: string[];
}

export interface CollectionPageResponse {
  collections: CollectionSummaryResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}
```

### Item

```typescript
export interface CreateItemRequest {
  collectionId: string;
  name: string;
  description?: string;
  acquisitionDate?: string;
  lastUsedDate?: string;
  imageFilesUrls?: string[];
  attributes?: Record<string, unknown>;
  tags?: string[];
}

export interface UpdateItemRequest {
  id: string;
  name?: string;
  description?: string;
  acquisitionDate?: string;
  imageFilesUrls?: string[] | null;
  attributes?: Record<string, unknown>;
  tags?: string[];
}

export interface ItemResponse {
  id: string;
  collectionId: string;
  userId: string;
  name: string;
  description: string;
  acquisitionDate?: string;
  lastUsedDate?: string;
  imageFilesUrls: string[];
  attributes?: Record<string, unknown>;
  likesCount: number;
  commentsCount: number;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemSummaryResponse {
  id: string;
  name: string;
  imagesURL: string[];
}

export interface ItemPageResponse {
  items: ItemSummaryResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}
```

### Uploads and Follow

```typescript
export interface FileInput {
  fileName: string;
  contentType: string;
}

export interface GenerateUploadUrlsRequest {
  resourceId: string;
  parentId?: string;
  context: 'PROFILE_PICTURE' | 'PROFILE_BACKGROUND' | 'COLLECTION' | 'ITEM';
  files: FileInput[];
}

export interface FileOutput {
  filePath: string;
  uploadUrl: string;
}

export interface GenerateUploadUrlsResponse {
  resourceId: string;
  files: FileOutput[];
}

export interface UserFollowResponse {
  followerId: string;
  followedId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
}
```

---

## DEBUG Mapping Notes

The DEBUG session can keep state in memory, but it should use the same field names as the API when possible.

- `UserResponse` is the canonical profile shape.
- `CollectionResponse` and `ItemResponse` are the canonical persisted shapes.
- `CollectionSummaryResponse` and `ItemSummaryResponse` are the list/card shapes used by feed and grids.
- `LoginResponse` only returns the token pair; user data comes from `UserResponse`.
- `coverImageURL` and `imagesURL` keep the API's exact casing, even though it is inconsistent.
- `visibility` uses uppercase enum values: `PUBLIC`, `PRIVATE`, `FRIENDS`.

For DEBUG-only derived feed data, the post projection should be treated as a view model built from `ItemResponse` plus the current `UserResponse` snapshot.

```typescript
export interface PostProjection {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    profilePictureUrl?: string;
  };
  item: {
    id: string;
    collectionId: string;
    name: string;
    description: string;
    imageFilesUrls: string[];
  };
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  createdAt: string;
}
```

### DEBUG Session Invariants

- IDs remain UUID strings.
- Data stays ephemeral in memory during the session.
- Derivations can be rebuilt at any time from the canonical API-shaped entities.
- The local cache may store image files, but the data model should still expose API-like URL fields.

### Migration Rule

When the app moves from DEBUG to real API:

1. Keep the model names and field names unchanged.
2. Replace the in-memory service implementation.
3. Keep the feed and detail views consuming the same DTOs.
4. Preserve the API enums and page shapes exactly.
