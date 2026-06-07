# Research Phase: Items & Collections CRUD Integration

**Date**: 2026-06-07  
**Feature**: Items & Collections CRUD Integration  
**Status**: Research Complete

## Summary

This document resolves all technical clarifications from the implementation plan. Research confirms that:
- ✅ All 11 CRUD endpoints are available and documented
- ✅ API contracts match existing debug service types
- ✅ Existing components can be reused and extended
- ✅ Profile synchronisation is straightforward via existing state management
- ✅ No conflicts with social features (follows, comments, likes)

---

## 1. API Contract Analysis

### 1.1 Collection CRUD Endpoints (6 operations)

#### CREATE: POST /collections/create

**Request Schema**:
```typescript
CreateCollectionRequest {
  name: string;              // Required: 1-255 chars
  description?: string;      // Optional: up to 1000 chars
  tags?: string[];          // Optional: array of tags
  coverImageUrl?: string;   // Optional: image URL
  visibility?: 'PUBLIC' | 'PRIVATE' | 'UNLISTED'; // Default: PUBLIC
}
```

**Response Schema**:
```typescript
CollectionResponse {
  id: string;               // UUID
  userId: string;           // UUID of owner
  name: string;
  description: string;
  coverImageURL?: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
  followersCount: number;
  tags: string[];
  isActive: boolean;
  isSystem?: boolean;       // Omitted for user collections
  createdAt: ISO8601;
  updatedAt: ISO8601;
}
```

**Matches Existing Type**: ✅ `CollectionResponse` in `src/types/collections.ts`  
**UI Component**: CollectionCreationForm (src/components/create-item/)  
**Notes**: Image URL comes from presigned upload, not direct upload

---

#### READ: GET /collections/{collectionId}

**Response**: CollectionResponse (same as CREATE response)  
**Matches Existing Type**: ✅ CollectionResponse  
**UI Component**: CollectionEditForm will pre-fill from this  
**Notes**: Used to populate edit form before PATCH

---

#### READ: GET /collections/by-user/{userId}

**Query Params**: 
- `page`: number (1-indexed)
- `pageSize`: number (default 20)

**Response**: 
```typescript
{
  content: CollectionResponse[];
  pageable: { pageNumber: number; pageSize: number; totalElements: number };
}
```

**Matches Existing Type**: ✅ Paginated response pattern used elsewhere  
**UI Component**: Profile screen collections list  
**Notes**: Pagination needed for large collection counts

---

#### UPDATE: PATCH /collections/{collectionId}

**Request Schema**:
```typescript
UpdateCollectionRequest {
  name?: string;            // Partial update
  description?: string;
  tags?: string[];
  coverImageUrl?: string;
  visibility?: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
}
```

**Response**: CollectionResponse (updated)  
**Matches Existing Type**: ✅ UpdateCollectionRequest in `src/types/collections.ts`  
**UI Component**: CollectionEditForm  
**Notes**: All fields optional; backend merges with existing data

---

#### DELETE: DELETE /collections/{collectionId}

**Query Params**: None  
**Response**: Status 204 No Content or `{ success: true }`  
**Matches Existing Type**: ✅ Pattern exists in mockCollectionService  
**UI Component**: OptionsBar → confirm dialog → delete  
**Notes**: Backend handles item reassignment (moves to uncategorized or deletes)

---

### 1.2 Item CRUD Endpoints (5 operations)

#### CREATE: POST /items/create

**Request Schema**:
```typescript
CreateItemRequest {
  name: string;                    // Required
  description?: string;
  collectionId: string;            // Required: UUID of collection
  tags?: string[];
  imageFilesUrls?: string[];       // Array of image URLs (from presigned upload)
  acquisitionDate?: ISO8601;
  lastUsedDate?: ISO8601;
  attributes?: { [key: string]: unknown }; // Custom attributes
}
```

**Response Schema**:
```typescript
ItemResponse {
  id: string;                      // UUID
  collectionId: string;
  userId: string;
  name: string;
  description: string;
  imageFilesUrls: string[];
  tags: string[];
  acquisitionDate?: ISO8601;
  lastUsedDate?: ISO8601;
  attributes?: { [key: string]: unknown };
  likesCount: number;
  commentsCount: number;
  isActive: boolean;
  createdAt: ISO8601;
  updatedAt: ISO8601;
}
```

**Matches Existing Type**: ✅ `ItemResponse` and `CreateItemRequest` in `src/types/items.ts`  
**UI Component**: ItemForm + ItemSaveFlow (src/components/create-item/)  
**Notes**: Multiple images supported via array

---

#### READ: GET /items/{collectionId}/{itemId}

**Response**: ItemResponse  
**Matches Existing Type**: ✅ ItemResponse  
**UI Component**: Item detail view (enhancement)  
**Notes**: Include collectionId in path per API contract

---

#### READ: GET /items/by-collection/{collectionId}

**Query Params**:
- `page`: number (1-indexed)
- `pageSize`: number (default 20)

**Response**: Paginated ItemResponse[]  
**Matches Existing Type**: ✅ Pagination pattern  
**UI Component**: CollectionItemsBulkList + CollectionItemsGrid  
**Notes**: Load more or infinite scroll

---

#### UPDATE: PATCH /items/{itemId}

**Request Schema**:
```typescript
UpdateItemRequest {
  name?: string;
  description?: string;
  tags?: string[];
  imageFilesUrls?: string[];
  acquisitionDate?: ISO8601;
  lastUsedDate?: ISO8601;
  attributes?: { [key: string]: unknown };
}
```

**Response**: ItemResponse (updated)  
**Matches Existing Type**: ✅ UpdateItemRequest in `src/types/items.ts`  
**UI Component**: Edit item form (new or extend existing)  
**Notes**: Do not include collectionId in update; item stays in same collection

---

#### DELETE: DELETE /items/{itemId}

**Response**: Status 204 No Content  
**Matches Existing Type**: ✅ Pattern exists in mockItemService  
**UI Component**: OptionsBar → confirm dialog → delete  
**Notes**: Item removed from collection; collection item count updates

---

## 2. Component Reuse Analysis

### 2.1 Forms & Input Components

**CollectionCreationForm** (`src/components/create-item/CollectionCreationForm.tsx`)
- ✅ Handles collection creation with name, description, image picker
- **Reuse for EDIT**: Extend to accept initial data and show "Update" button instead of "Create"
- **Alternative**: Create new `CollectionEditForm` that wraps existing logic
- **Recommendation**: Extend existing via optional `initialData` prop

**ItemForm** (`src/components/create-item/ItemForm.tsx`)
- ✅ Handles item creation with name, description, image gallery
- **Reuse for EDIT**: Similar pattern to collection form
- **Recommendation**: Add optional `initialData` prop for edit mode

**AttributeTable** (`src/components/ui/AttributeTable.tsx`)
- ✅ Display item attributes (key-value pairs)
- **Status**: Can be reused as-is for showing custom attributes

**PhotoGallery** & **PhotoPicker** (`src/components/create-item/`)
- ✅ Handle image uploads and display
- **Status**: Reusable as-is
- **Note**: Presigned URL flow already integrated

### 2.2 Action & Navigation Components

**Button** (`src/components/ui/Button.tsx`)
- ✅ All CRUD action buttons (save, delete, edit)
- **Reuse**: Direct, no changes

**Modal** (`src/components/ui/Modal.tsx`)
- ✅ Confirmation dialogs before delete
- **Reuse**: Direct, no changes

**OptionsBar** (`src/components/ui/OptionsBar.tsx`)
- ✅ Edit/delete action menus
- **Reuse**: Direct, no changes

**Card** (`src/components/ui/Card.tsx`)
- ✅ Container for collections/items
- **Reuse**: Direct, no changes

### 2.3 Display Components

**CollectionCover** (`src/components/ui/CollectionCover.tsx`)
- ✅ Display collection image + name
- **Reuse**: Direct in profile collections list

**ItemCover** (`src/components/ui/ItemCover.tsx`)
- ✅ Display item image
- **Reuse**: Direct in collection items grid

**CollectionItemsGrid** (`src/components/collection-items-grid/CollectionItemsGrid.tsx`)
- ✅ Grid layout for items
- **Reuse**: Direct in collection view

**CollectionItemsBulkList** (`src/components/collection/CollectionItemsBulkList.tsx`)
- ✅ Bulk operations on items (delete, move)
- **Enhancement**: Add pagination for large collections
- **Reuse**: Extend with load-more capability

### 2.4 Motion & Animation

**useAnimation** hooks and motion presets
- ✅ SlideUp, FadeIn, ScalePress already defined
- **Reuse**: Direct in all new forms and transitions
- **Verify**: No custom animation libraries needed

---

## 3. Service Layer Integration

### 3.1 Debug Mode (Mock Services)

**Location**: `src/services/debug/`

**mockCollectionService** (already has CRUD):
- ✅ `create()` — Creates collection in debugSession
- ✅ `update()` — Updates collection by ID
- ✅ `delete()` — Removes collection
- ✅ `getById()` — Fetch single collection
- ✅ `getMe()` — Fetch user's collections (already paginated in memory)

**Status**: ✅ Ready to use; no enhancements needed

**mockItemService** (already has CRUD):
- ✅ `create()` — Creates item in debugSession
- ✅ `update()` — Updates item by ID
- ✅ `delete()` — Removes item
- ✅ `getById()` — Fetch single item
- ✅ `getByCollection()` — Fetch items in collection

**Status**: ✅ Ready to use; no enhancements needed

### 3.2 Real API Mode (New Integration)

**Location**: `src/services/api/api.ts`

**To Add**:
```typescript
// Collections
export const createCollection = async (req: CreateCollectionRequest): Promise<CollectionResponse> => 
  client.post('/collections/create', req);

export const updateCollection = async (id: string, req: UpdateCollectionRequest): Promise<CollectionResponse> => 
  client.patch(`/collections/${id}`, req);

export const getCollection = async (id: string): Promise<CollectionResponse> => 
  client.get(`/collections/${id}`);

export const getCollectionsByUser = async (userId: string, page: number, pageSize: number) => 
  client.get(`/collections/by-user/${userId}?page=${page}&pageSize=${pageSize}`);

export const deleteCollection = async (id: string): Promise<void> => 
  client.delete(`/collections/${id}`);

// Items
export const createItem = async (req: CreateItemRequest): Promise<ItemResponse> => 
  client.post('/items/create', req);

export const updateItem = async (id: string, req: UpdateItemRequest): Promise<ItemResponse> => 
  client.patch(`/items/${id}`, req);

export const getItem = async (collectionId: string, itemId: string): Promise<ItemResponse> => 
  client.get(`/items/${collectionId}/${itemId}`);

export const getItemsByCollection = async (collectionId: string, page: number, pageSize: number) => 
  client.get(`/items/by-collection/${collectionId}?page=${page}&pageSize=${pageSize}`);

export const deleteItem = async (id: string): Promise<void> => 
  client.delete(`/items/${id}`);
```

**Status**: ✅ Simple wrapper pattern; fits existing code style

### 3.3 Profile State Synchronisation

**Location**: `src/services/profileService.ts`

**Pattern**: After CRUD operations, trigger profile refresh
```typescript
export const refreshUserCollections = async () => {
  // Invalidate cache + fetch fresh from /collections/by-user/{userId}
};

export const refreshUserItems = async () => {
  // Refresh items across all user collections
};
```

**Status**: ✅ Can extend existing service

---

## 4. State Flow & Optimistic UI

### 4.1 Create Collection Flow

1. User fills form (local state)
2. Submit → POST /collections/create
3. Optimistic update: add to profile collections
4. API responds → confirm or rollback
5. Navigate back to profile (already shows new collection)

**Error Handling**: Show error toast, keep form open for retry

### 4.2 Update Collection Flow

1. Load collection data → GET /collections/{id}
2. User edits form (local state)
3. Submit → PATCH /collections/{id}
4. Optimistic update: update profile + collection view
5. API responds → confirm or rollback
6. Navigate back (profile updated)

**Error Handling**: Show error toast, allow retry

### 4.3 Delete Collection Flow

1. Show confirmation modal
2. User confirms → DELETE /collections/{id}
3. Optimistic update: remove from profile immediately
4. API responds → confirm or rollback
5. Navigate back to profile

**Error Handling**: "Undo" button or reload on error

### 4.4 Similar patterns for Items

---

## 5. Error Handling & Validation

### 5.1 Validation (Before API Call)

- Collection name: required, 1-255 chars
- Item name: required
- Collection ID: must be valid UUID
- Image URLs: must be valid presigned URLs
- Custom attributes: validate JSON structure

**Location**: Form components (`ItemForm.tsx`, `CollectionCreationForm.tsx`)

### 5.2 API Error Handling

**Existing interceptor**: `src/services/api/interceptors.ts`  
**Status**: ✅ Already handles auth errors, network errors  
**Extend**: Add collection/item-specific error messages in pt-BR

### 5.3 Error Messages (pt-BR)

```typescript
// Centralised error mapping
const ERROR_MESSAGES = {
  COLLECTION_NOT_FOUND: 'Coleção não encontrada',
  ITEM_NOT_FOUND: 'Item não encontrado',
  DUPLICATE_COLLECTION_NAME: 'Já existe uma coleção com este nome',
  INVALID_COLLECTION_ID: 'ID de coleção inválido',
  IMAGE_UPLOAD_FAILED: 'Falha ao carregar imagem',
  NETWORK_ERROR: 'Erro de conexão. Tente novamente.',
};
```

**Status**: ✅ Use existing error mapping pattern

---

## 6. Testing Strategy

### 6.1 Mock Mode Testing

**Flow**:
1. Enable debug mode via `debugFlags.ts`
2. Use mockCollectionService + mockItemService
3. All operations work against in-memory debugSession
4. Profile updates automatically from same session
5. No real API calls

**Test**: Create → Update → Delete cycle in mock mode

### 6.2 Real API Testing

**Prerequisites**:
- Backend running on http://89.167.89.185:8080
- Valid auth token in debugSession.currentUser
- Collections/items exist in backend

**Flow**:
1. Disable debug mode
2. All operations call real endpoints
3. Profile fetches from real API
4. Test error scenarios (network down, invalid data)

---

## 7. Conflict Avoidance with Existing Features

### 7.1 Social Features (Not Touched)

- ❌ NOT modifying follows (POST/DELETE /collections/follow/{collectionId})
- ❌ NOT modifying likes (POST/DELETE /items/like/{itemId})
- ❌ NOT modifying comments (POST/DELETE /items/comment/{itemId})
- ✅ Profile loads collections/items normally
- ✅ Social features remain functional alongside CRUD

### 7.2 Feed Integration

- Feed shows items from followed collections (not affected)
- Comments/likes on items remain functional (not affected)
- Creating/updating items in CRUD flow doesn't break feed

### 7.3 Search & Explore

- Existing explore features unchanged
- Profile collections remain discoverable
- No caching conflicts

---

## 8. Key Decisions & Rationale

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Extend existing forms | Reuse == less bugs, familiar UX | Create new forms (rejected: code duplication) |
| Optimistic UI updates | Perceived performance boost | Wait for API (slower UX) |
| Profile auto-refresh | Keep data consistent | Manual refresh (user error-prone) |
| Debug mode first | Safe testing without backend | Integrate real API immediately (higher risk) |
| No presigned URL changes | Already works in create-item | Modify upload flow (unnecessary complexity) |

---

## Conclusion

All research clarifications are resolved:
- ✅ API contracts confirmed and documented
- ✅ Component reuse strategy validated
- ✅ Service layer integration straightforward
- ✅ No conflicts with existing features
- ✅ Error handling and validation clear

**Next Phase**: Design → Implementation Plan (Phase 1)
