# Data Model: Items & Collections CRUD

**Date**: 2026-06-07  
**Feature**: Items & Collections CRUD Integration  
**Phase**: 1 (Design & Contracts)

## Overview

This document defines TypeScript types, entity relationships, state flows, and API contracts for the CRUD feature.

---

## 1. Core Entities

### 1.1 Collection Entity

```typescript
// src/types/collections.ts (EXISTING - verify alignment)

export interface CollectionResponse {
  id: string;                      // UUID
  userId: string;                  // UUID of collection owner
  name: string;                    // 1-255 chars, unique per user is recommended
  description: string;             // 0-1000 chars
  coverImageURL?: string;          // Optional image URL (from presigned upload)
  visibility: VisibilityType;      // PUBLIC | PRIVATE | UNLISTED
  followersCount: number;          // Read-only, managed by backend
  tags: string[];                  // Array of category tags
  isActive: boolean;               // Soft delete flag
  isSystem?: boolean;              // Optional: true for 'Uncategorized' system collection
  createdAt: string;               // ISO 8601 timestamp
  updatedAt: string;               // ISO 8601 timestamp
}

export type VisibilityType = 'PUBLIC' | 'PRIVATE' | 'UNLISTED';

export interface CreateCollectionRequest {
  name: string;                    // Required
  description?: string;            // Optional
  tags?: string[];                 // Optional
  coverImageUrl?: string;          // Optional (handled by presigned URLs)
  visibility?: VisibilityType;     // Optional, defaults to PUBLIC
}

export interface UpdateCollectionRequest {
  name?: string;                   // Partial update
  description?: string;
  tags?: string[];
  coverImageUrl?: string;
  visibility?: VisibilityType;
}

export interface DeleteCollectionResponse {
  success: boolean;
  deletedCollectionId: string;
  deletedItemsCount?: number;
  movedItemsCount?: number;
}

export interface CollectionService {
  create(req: CreateCollectionRequest): Promise<CollectionResponse>;
  getById(id: string): Promise<CollectionResponse | null>;
  getMe(): Promise<CollectionResponse[]>;              // User's collections
  update(id: string, req: UpdateCollectionRequest): Promise<CollectionResponse>;
  delete(id: string): Promise<void>;
  deleteWithStrategy(req: DeleteCollectionRequest): Promise<DeleteCollectionResponse>;
  getItemCount(collectionId: string): Promise<number>;
  getUncategorized(): Promise<CollectionResponse>;
}
```

**Relationships**:
- 1 Collection : N Items (cascade delete or move to uncategorized)
- 1 User : N Collections

---

### 1.2 Item Entity

```typescript
// src/types/items.ts (EXISTING - verify alignment)

export interface ItemResponse {
  id: string;                      // UUID
  collectionId: string;            // UUID of parent collection
  userId: string;                  // UUID of item owner
  name: string;                    // Required
  description: string;             // Optional, defaults to ''
  acquisitionDate?: string;        // ISO 8601, optional
  lastUsedDate?: string;           // ISO 8601, optional
  imageFilesUrls: string[];        // Array of image URLs (typically 1-3)
  attributes?: Record<string, unknown>; // Custom key-value attributes
  likesCount: number;              // Read-only, social feature
  commentsCount: number;           // Read-only, social feature
  tags: string[];                  // Array of tags
  isActive: boolean;               // Soft delete flag
  createdAt: string;               // ISO 8601 timestamp
  updatedAt: string;               // ISO 8601 timestamp
}

export interface CreateItemRequest {
  name: string;                    // Required
  description?: string;            // Optional
  collectionId: string;            // Required UUID
  tags?: string[];                 // Optional
  imageFilesUrls?: string[];       // Optional array (from presigned URLs)
  acquisitionDate?: string;        // Optional ISO 8601
  lastUsedDate?: string;           // Optional ISO 8601
  attributes?: Record<string, unknown>; // Optional custom attributes
}

export interface UpdateItemRequest {
  name?: string;                   // Partial update
  description?: string;
  tags?: string[];
  imageFilesUrls?: string[];
  acquisitionDate?: string;
  lastUsedDate?: string;
  attributes?: Record<string, unknown>;
  // NOTE: collectionId NOT updateable; item stays in original collection
}

export interface MoveItemCommand {
  itemId: string;
  targetCollectionId: string;
}

export interface MoveItemResponse {
  success: boolean;
  itemId: string;
  fromCollectionId: string;
  toCollectionId: string;
}

export interface DeleteItemsBulkResponse {
  success: boolean;
  deletedItemIds: string[];
  failedItemIds?: string[];
}

export interface ItemService {
  create(req: CreateItemRequest): Promise<ItemResponse>;
  getById(id: string): Promise<ItemResponse | null>;
  getByCollection(collectionId: string): Promise<ItemResponse[]>;
  update(id: string, req: UpdateItemRequest): Promise<ItemResponse>;
  delete(id: string): Promise<void>;
  moveItem(command: MoveItemCommand): Promise<ItemResponse>;
  moveItemsBulk(command: MoveItemsBulkCommand): Promise<MoveItemsResponse>;
  deleteItemsBulk(itemIds: string[]): Promise<DeleteItemsBulkResponse>;
  getUserItems(userId: string): Promise<ItemResponse[]>;
}
```

**Relationships**:
- 1 Item : 1 Collection (foreign key)
- 1 User : N Items (via their collections)
- 1 Item : N Comments (social, out of scope for this feature)
- 1 Item : N Likes (social, out of scope for this feature)

---

## 2. Profile State Shape

```typescript
// Extended Profile State (in providers/AuthProvider or profile context)

export interface ProfileState {
  // ... existing fields
  collections: CollectionResponse[];        // User's collections
  items: ItemResponse[];                    // All items across collections
  collectionsPagination: {
    page: number;
    pageSize: number;
    totalElements: number;
  };
  itemsPagination: {
    page: number;
    pageSize: number;
    totalElements: number;
  };
  isLoadingCollections: boolean;
  isLoadingItems: boolean;
  collectionsError?: string;
  itemsError?: string;
}

export interface ProfileActions {
  // Collection CRUD
  createCollection(req: CreateCollectionRequest): Promise<CollectionResponse>;
  updateCollection(id: string, req: UpdateCollectionRequest): Promise<CollectionResponse>;
  deleteCollection(id: string): Promise<void>;
  refreshCollections(): Promise<void>;
  
  // Item CRUD
  createItem(req: CreateItemRequest): Promise<ItemResponse>;
  updateItem(id: string, req: UpdateItemRequest): Promise<ItemResponse>;
  deleteItem(id: string): Promise<void>;
  refreshItems(collectionId?: string): Promise<void>;
  
  // Pagination
  setCollectionsPage(page: number): void;
  setItemsPage(page: number): void;
}
```

---

## 3. UI Component Data Flow

### 3.1 Collection Creation Flow

```
User fills form (local state: name, description, image, tags, visibility)
    ↓
Submit button → validate form
    ↓
Call createCollection(CreateCollectionRequest)
    ↓
[Service Layer]
  Debug mode: mockCollectionService.create()
  Real API: POST /collections/create
    ↓
Response: CollectionResponse
    ↓
Update ProfileState.collections
    ↓
Navigate back to profile (already shows new collection)
    ↓
Display success toast
```

### 3.2 Collection Update Flow

```
Profile screen → user clicks "Edit" on collection
    ↓
Navigate to /collections/edit/[collectionId]
    ↓
Fetch collection data → GET /collections/{id}
    ↓
Populate form with existing data (name, description, image, visibility)
    ↓
User edits fields (local state)
    ↓
Submit button → validate form
    ↓
Call updateCollection(id, UpdateCollectionRequest)
    ↓
[Service Layer]
  Debug mode: mockCollectionService.update()
  Real API: PATCH /collections/{id}
    ↓
Response: CollectionResponse (updated)
    ↓
Update ProfileState.collections (find and replace)
    ↓
Navigate back to profile
    ↓
Display success toast
```

### 3.3 Collection Delete Flow

```
Profile screen → user clicks delete icon
    ↓
Show confirmation modal ("Confirma exclusão de [name]?")
    ↓
User confirms → Call deleteCollection(id)
    ↓
[Service Layer]
  Debug mode: mockCollectionService.delete()
  Real API: DELETE /collections/{id}
    ↓
Update ProfileState.collections (remove by id)
    ↓
Update ProfileState.items (remove items from deleted collection or refresh)
    ↓
Navigate back / stay on profile (collection gone)
    ↓
Display success toast
```

### 3.4 Item Creation Flow

```
Collection view → user clicks "Add Item"
    ↓
Navigate to /create-item (or modal with collection pre-selected)
    ↓
ItemForm populates with collectionId (from route or context)
    ↓
User fills form (name, description, images, tags, attributes)
    ↓
Submit button → validate form
    ↓
Call createItem(CreateItemRequest)
    ↓
[Service Layer]
  Upload images first (presigned URLs, existing flow)
  Debug mode: mockItemService.create()
  Real API: POST /items/create
    ↓
Response: ItemResponse
    ↓
Update ProfileState.items
    ↓
Update ProfileState.collections[collectionId].itemCount++
    ↓
Navigate back to collection view
    ↓
Display success toast
```

### 3.5 Item Update Flow

```
Collection view → user clicks item → item detail → "Edit" button
    ↓
Navigate to /collections/edit-item/[itemId]
    ↓
Fetch item data → GET /items/{collectionId}/{itemId}
    ↓
Populate form with existing data
    ↓
User edits fields (local state)
    ↓
Submit button → validate form
    ↓
Call updateItem(id, UpdateItemRequest)
    ↓
[Service Layer]
  Debug mode: mockItemService.update()
  Real API: PATCH /items/{itemId}
    ↓
Response: ItemResponse (updated)
    ↓
Update ProfileState.items (find and replace)
    ↓
Navigate back to collection view
    ↓
Display success toast
```

### 3.6 Item Delete Flow

```
Collection view → user clicks delete icon on item
    ↓
Show confirmation modal
    ↓
User confirms → Call deleteItem(id)
    ↓
[Service Layer]
  Debug mode: mockItemService.delete()
  Real API: DELETE /items/{itemId}
    ↓
Update ProfileState.items (remove by id)
    ↓
Update collection.itemCount--
    ↓
Refresh collection view (item removed from grid)
    ↓
Display success toast
```

---

## 4. Validation Rules

### 4.1 Collection Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| name | Required, 1-255 chars | "Nome obrigatório (max 255 caracteres)" |
| description | Optional, max 1000 chars | "Descrição muito longa (max 1000 caracteres)" |
| visibility | One of PUBLIC, PRIVATE, UNLISTED | "Visibilidade inválida" |
| tags | Array of strings, each < 50 chars | "Tag muito longa (max 50 caracteres)" |
| coverImageUrl | Valid URL or undefined | "URL de imagem inválida" |

### 4.2 Item Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| name | Required, 1-255 chars | "Nome do item obrigatório (max 255 caracteres)" |
| description | Optional, max 1000 chars | "Descrição muito longa (max 1000 caracteres)" |
| collectionId | Required, valid UUID | "Coleção inválida" |
| tags | Array of strings, each < 50 chars | "Tag muito longa (max 50 caracteres)" |
| imageFilesUrls | Array of valid URLs or undefined | "URL de imagem inválida" |
| acquisitionDate | Valid ISO 8601 or undefined | "Data de aquisição inválida" |
| lastUsedDate | Valid ISO 8601 or undefined | "Última data de uso inválida" |

---

## 5. Error States & Handling

### 5.1 Network Errors

```typescript
type NetworkError = 
  | { code: 'TIMEOUT'; message: 'Operação expirou'; retryable: true }
  | { code: 'OFFLINE'; message: 'Sem conexão'; retryable: true }
  | { code: 'SERVER_ERROR'; message: 'Erro no servidor'; retryable: true }
  | { code: 'UNAUTHORIZED'; message: 'Não autorizado'; retryable: false }
  | { code: 'NOT_FOUND'; message: 'Recurso não encontrado'; retryable: false };
```

### 5.2 Validation Errors

Inline form errors (no modals):
```typescript
// Each form field displays error below it
<TextInput {...} />
{error.name && <Text className="text-red-500">{error.name}</Text>}
```

### 5.3 Success States

Toast notification (auto-dismiss 3s):
```
✓ Coleção criada com sucesso
✓ Item atualizado com sucesso
✓ Coleção deletada com sucesso
```

---

## 6. Pagination Strategy

### 6.1 Collections List (Profile Screen)

- Load first 20 collections on profile load
- Button "Carregar mais" to fetch next page
- OR: Infinite scroll (load when scrolling near bottom)

```typescript
getCollectionsByUser(userId: string, page: 1, pageSize: 20)
  → CollectionResponse[] (page 1)
```

### 6.2 Items List (Collection View)

- Load first 20 items per collection
- Load more on scroll
- Update item count from collection metadata

```typescript
getItemsByCollection(collectionId: string, page: 1, pageSize: 20)
  → ItemResponse[] (page 1)
```

---

## 7. Caching & Invalidation

### 7.1 Profile Collections Cache

- Cache invalidation on: create, update, delete collection
- Refresh strategy: Re-fetch page 1, keep older pages in memory
- TTL: 5 minutes (optional, soft cache)

### 7.2 Collection Items Cache

- Cache invalidation on: create, update, delete item
- Refresh strategy: Re-fetch page 1
- TTL: 5 minutes (optional)

---

## 8. Optimistic UI Updates

### 8.1 Create Collection

```typescript
// Before API response
collections.push({
  id: 'temp-' + Date.now(),
  name: formData.name,
  description: formData.description,
  // ... temp object
  createdAt: new Date().toISOString(),
});

// After API response (successful)
// Replace temp with real response

// After API response (error)
// Rollback: remove temp, show error
```

### 8.2 Update Collection

```typescript
// Before API response
const idx = collections.findIndex(c => c.id === id);
collections[idx] = { ...collections[idx], ...formData };

// After API response (error)
// Rollback: restore original data
```

### 8.3 Delete Collection

```typescript
// Before API response (immediate visual feedback)
collections = collections.filter(c => c.id !== id);

// After API response (error)
// Rollback: re-add collection to list
```

---

## Summary of Types to Use/Extend

| Type | Location | Status | Notes |
|------|----------|--------|-------|
| CollectionResponse | src/types/collections.ts | VERIFY | Already exists; confirm matches API |
| CreateCollectionRequest | src/types/collections.ts | VERIFY | Already exists; confirm matches API |
| UpdateCollectionRequest | src/types/collections.ts | VERIFY | Already exists; confirm matches API |
| ItemResponse | src/types/items.ts | VERIFY | Already exists; confirm matches API |
| CreateItemRequest | src/types/items.ts | VERIFY | Already exists; confirm matches API |
| UpdateItemRequest | src/types/items.ts | VERIFY | Already exists; confirm matches API |
| ProfileState | src/providers/ | NEW | Extend with collections/items state |
| ProfileActions | src/providers/ | NEW | Add CRUD action methods |

---

## Conclusion

This data model defines all entities, relationships, flows, and validation rules needed for Items & Collections CRUD implementation. Next phase: implement services and components per plan.
