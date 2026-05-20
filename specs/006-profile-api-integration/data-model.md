# Data Model & Validation Rules

**Feature**: Profile Screen API Integration (006) | **Phase**: 1 Design | **Date**: 2026-05-19

---

## Overview

This document defines all domain entities, their fields, validation rules, and state transitions for the profile API integration feature.

**Source of truth for types**: `src/types/{auth,collections,items}.ts`

---

## Entity Definitions

### 1. User (Authentication Context)

**Entity**: UserResponse + UpdateUserRequest

**Fields** (from `src/types/auth.ts`):

| Field | Type | Required | Validation | Notes |
|-------|------|----------|-----------|-------|
| `id` | `string` | Yes | UUID format | Assigned by backend |
| `name` | `string` | Yes | 2-100 chars, trimmed | Display name |
| `username` | `string` | Yes | 3-30 alphanumeric+underscore, unique | Handle for @mentions |
| `email` | `string` | Yes | Valid email format (RFC 5322) | Unique, case-insensitive |
| `bio` | `string` | No | Max 500 chars, trimmed | Public profile bio |
| `profilePictureUrl` | `string \| null` | No | Valid URL or null | S3 pre-signed URL or null |
| `profileBackgroundUrl` | `string \| null` | No | Valid URL or null | S3 pre-signed URL or null |
| `followersCount` | `number` | No | Non-negative integer | Read-only, computed by backend |
| `followingCount` | `number` | No | Non-negative integer | Read-only, computed by backend |
| `birthdayDate` | `string` | No | ISO format (yyyy-MM-dd), age ≥ 13 | Optional profile field |
| `isActive` | `boolean` | No | true \| false | Account status |
| `createdAt` | `string` | Yes | ISO 8601 timestamp | Read-only |
| `updatedAt` | `string` (in responses) | No | ISO 8601 timestamp | Not in update request |

**State Machine**:

```
[Registered] → [Logged In] → [Profile Editable] → [Session Expired] → [Requires Re-auth]
```

**Validation Rules**:

```typescript
// name
- Required
- Length: 2-100 chars
- Pattern: no leading/trailing spaces
- Example: "João Silva" ✓, "J" ✗, "   Invalid   " ✗

// username
- Required
- Length: 3-30 chars
- Pattern: [a-zA-Z0-9_]+
- Unique: checked by backend
- Example: "joao_silva_123" ✓, "joa" ✗, "joao@silva" ✗

// email
- Required
- Pattern: RFC 5322 (simplified: user@domain.ext)
- Lowercase on submit
- Unique: checked by backend
- Example: "joao@example.com" ✓, "invalid-email" ✗

// bio
- Optional
- Max 500 chars
- No special validation
- Example: "Colecionador de momentos | São Paulo" ✓

// birthdayDate
- Optional
- Format: yyyy-MM-dd
- Age ≥ 13 years old
- Date ≤ today
- Example: "1995-05-15" ✓, "2015-01-01" ✗ (too young)

// profilePictureUrl
- Optional (can be null)
- Must be valid URL if provided
- Max file size: 5MB (enforced on upload)
- Formats: JPEG, PNG
```

---

### 2. Collection (User-Owned)

**Entity**: CollectionResponse + CreateCollectionRequest + UpdateCollectionRequest + DeleteCollectionRequest

**Fields** (from `src/types/collections.ts`):

| Field | Type | Required | Validation | Notes |
|-------|------|----------|-----------|-------|
| `id` | `string` | Yes | UUID format | Assigned by backend |
| `userId` | `string` | Yes | UUID format | Collection owner |
| `name` | `string` | Yes | 1-100 chars, trimmed | Display name |
| `description` | `string` | Yes | 0-500 chars, trimmed | Optional in creation, required in responses |
| `coverImageUrl` | `string \| null` | No | Valid URL or null | S3 pre-signed URL |
| `coverImageUrls` | `string[]` | No | Array of URLs | Modern API response (multiple covers) |
| `visibility` | `CollectionVisibility` | Yes | `PUBLIC \| PRIVATE \| FRIENDS` | Access control |
| `followersCount` | `number` | No | Non-negative integer | Read-only |
| `tags` | `string[]` | No | Max 10 tags, 1-30 chars each | Categorization |
| `isActive` | `boolean` | Yes | true \| false | Soft-delete flag |
| `isSystem` | `boolean` | No | true \| false | System-managed (e.g., "Sem categoria") |
| `createdAt` | `string` | Yes | ISO 8601 timestamp | Read-only |
| `updatedAt` | `string` | Yes | ISO 8601 timestamp | Read-only |

**Delete Strategy** (from `DeleteCollectionRequest`):

```typescript
type DeleteCollectionItemsStrategy = 'MOVE_TO_UNCATEGORIZED' | 'DELETE_ALL_ITEMS';

interface DeleteCollectionRequest {
  collectionId: string;          // Collection to delete
  strategy: DeleteCollectionItemsStrategy;
  uncategorizedCollectionId?: string; // Required for MOVE_TO_UNCATEGORIZED
}
```

**State Machine**:

```
[Created] → [Active] → [Edited] → [Deleted] (soft-delete: isActive = false)
                    ↓
            [With Items] → [Delete Strategy Applied]
                           ├─ Move items to Uncategorized
                           └─ Delete all items
```

**Validation Rules**:

```typescript
// name (Create + Update)
- Required
- Length: 1-100 chars
- Pattern: trimmed (no leading/trailing spaces)
- Example: "My Travel Collection" ✓, "" ✗

// description (Create)
- Optional (can be empty string)
- Max 500 chars
- Example: "Photos from my 2024 trip" ✓

// visibility (Create + Update)
- Enum: PUBLIC | PRIVATE | FRIENDS
- Default on create: PRIVATE
- Cannot be changed for system collections (isSystem = true)

// tags (Create + Update)
- Optional array
- Max 10 tags per collection
- Each tag: 1-30 chars
- Example: ["travel", "2024", "memories"] ✓, ["a", "b", ...(11 items)] ✗

// coverImageUrl (Create + Update)
- Optional (can be null)
- Valid URL if provided
- Max file size: 5MB
- Formats: JPEG, PNG

// Delete Strategy
- Required for deletion
- If MOVE_TO_UNCATEGORIZED: uncategorizedCollectionId must be provided
- Cannot move to same collection (validation check)
- Cannot move to deleted collection
- On move: Update all items' collectionId
- On delete all: Remove all items from database
```

---

### 3. Item (Within Collection)

**Entity**: ItemResponse + CreateItemRequest + UpdateItemRequest

**Fields** (from `src/types/items.ts`):

| Field | Type | Required | Validation | Notes |
|-------|------|----------|-----------|-------|
| `id` | `string` | Yes | UUID format | Assigned by backend |
| `collectionId` | `string` | Yes | UUID format | Parent collection |
| `userId` | `string` | Yes | UUID format | Item owner |
| `name` | `string` | Yes | 1-200 chars, trimmed | Item title |
| `description` | `string` | Yes | 0-1000 chars, trimmed | Optional notes |
| `acquisitionDate` | `string` | No | ISO format (yyyy-MM-dd), ≤ today | When obtained |
| `lastUsedDate` | `string` | No | ISO format (yyyy-MM-dd), ≤ today | When last used |
| `imageFilesUrls` | `string[]` | No | Array of URLs, max 10 | S3 pre-signed URLs |
| `attributes` | `Record<string, unknown>` | No | Key-value pairs | Custom metadata |
| `likesCount` | `number` | No | Non-negative integer | Read-only |
| `commentsCount` | `number` | No | Non-negative integer | Read-only |
| `tags` | `string[]` | No | Max 10 tags, 1-30 chars each | Categorization |
| `isActive` | `boolean` | Yes | true \| false | Soft-delete flag |
| `createdAt` | `string` | Yes | ISO 8601 timestamp | Read-only |
| `updatedAt` | `string` | Yes | ISO 8601 timestamp | Read-only |

**State Machine**:

```
[Created] → [Active] → [Edited] → [Deleted] (soft-delete: isActive = false)
                    ↓
            [Liked/Unliked]
            [Commented On]
            [Moved to Another Collection]
```

**Validation Rules**:

```typescript
// name (Create + Update)
- Required
- Length: 1-200 chars
- Pattern: trimmed
- Example: "Vintage Camera" ✓, "" ✗

// description (Create + Update)
- Optional
- Max 1000 chars
- Example: "A gift from my grandfather" ✓

// acquisitionDate (Create + Update)
- Optional
- Format: yyyy-MM-dd (ISO)
- Must be ≤ today
- Example: "2020-06-15" ✓, "2030-01-01" ✗ (future)

// lastUsedDate (Create + Update)
- Optional
- Format: yyyy-MM-dd (ISO)
- Must be ≤ today
- Can be after acquisitionDate (not enforced on client, use business logic)

// imageFilesUrls (Create + Update)
- Optional array
- Max 10 files per item
- Each: valid URL
- Max file size: 5MB each
- Formats: JPEG, PNG

// attributes (Create + Update)
- Optional key-value store
- Keys: string (max 50 chars)
- Values: string, number, or boolean
- Max 20 attributes per item
- Example: { "brand": "Canon", "year": 1970, "working": true } ✓

// tags (Create + Update)
- Optional array
- Max 10 tags per item
- Each tag: 1-30 chars
- Example: ["vintage", "camera", "gift"] ✓
```

---

## Bulk Operations

### Move Items Bulk

```typescript
interface MoveItemCommand {
  itemId: string;
  targetCollectionId: string;
  sourceCollectionId?: string; // Optional, validated on backend
}

interface MoveItemsBulkCommand {
  itemIds: string[];
  targetCollectionId: string;
  sourceCollectionId?: string;
}

interface MoveItemsResponse {
  success: boolean;
  movedItemIds: string[];
  failedItemIds?: string[]; // Items that failed to move
}

// Validation
- All itemIds must exist
- targetCollectionId must exist + belong to same user
- On failure: Return which items succeeded vs failed
- Response: { success: true, movedItemIds: [...], failedItemIds: [...] }
```

### Delete Items Bulk

```typescript
interface DeleteItemsBulkCommand {
  itemIds: string[];
  sourceCollectionId?: string; // For validation context
}

interface DeleteItemsBulkResponse {
  success: boolean;
  deletedItemIds: string[];
  failedItemIds?: string[];
}

// Validation
- All itemIds must exist
- On failure: Return which items succeeded vs failed
```

---

## Pagination Model

```typescript
interface PageResponse<T> {
  items: T[];
  totalPages: number;        // Total number of pages
  totalElements: number;     // Total items in dataset
  currentPage: number;       // 0-indexed current page
}

// Usage
- Page size: typically 10 items
- Offset calculation: offset = currentPage * pageSize
- Example: page=2, size=10 → offset=20, returns items 20-29
```

---

## Validation Context Matrix

| Entity | Field | Create | Update | Response | Notes |
|--------|-------|--------|--------|----------|-------|
| **User** | id | — | — | ✓ | Read-only |
| | name | ✓ | ✓ | ✓ | |
| | username | ✓ | ✓ | ✓ | Unique, not editable after create (API decision) |
| | email | ✓ | — | ✓ | Unique, not editable (API decision) |
| | bio | — | ✓ | ✓ | |
| | birthdayDate | ✓ | ✓ | ✓ | Optional |
| | profilePictureUrl | — | ✓ | ✓ | Via uploadService |
| **Collection** | id | — | — | ✓ | Read-only |
| | name | ✓ | ✓ | ✓ | |
| | description | ✓ | ✓ | ✓ | |
| | visibility | ✓ | ✓ | ✓ | |
| | coverImageUrl | ✓ | ✓ | ✓ | Via uploadService |
| | tags | ✓ | ✓ | ✓ | Optional |
| **Item** | id | — | — | ✓ | Read-only |
| | name | ✓ | ✓ | ✓ | |
| | description | ✓ | ✓ | ✓ | Optional |
| | acquisitionDate | ✓ | ✓ | ✓ | Optional |
| | imageFilesUrls | ✓ | ✓ | ✓ | Via uploadService |
| | attributes | ✓ | ✓ | ✓ | Optional |

---

## Error Scenarios

### Validation Errors (400 Bad Request)

```typescript
// User update with invalid email
{ error: "Invalid email format" }

// Collection create without required name
{ error: "Collection name is required" }

// Item with future acquisitionDate
{ error: "Acquisition date cannot be in the future" }

// Item with duplicate attributes key
{ error: "Attribute keys must be unique" }
```

### Permission Errors (403 Forbidden)

```typescript
// Trying to update another user's profile
{ error: "Cannot modify another user's profile" }

// Trying to delete someone else's collection
{ error: "You don't have permission to delete this collection" }

// Trying to move item from another user's collection
{ error: "You don't have permission to access this item" }
```

### Conflict Errors (409 Conflict)

```typescript
// Duplicate username
{ error: "Username already in use" }

// Duplicate collection name for user
{ error: "Collection name already exists" }

// Invalid delete strategy (e.g., invalid uncategorizedCollectionId)
{ error: "Invalid delete strategy: uncategorized collection not found" }

// Moving item to same collection
{ error: "Target collection is the same as source" }
```

---

## Testing Scenarios

### Profile Management
- ✅ Create user with all required fields
- ✅ Update user profile (partial)
- ✅ Upload profile picture (via uploadService)
- ✅ Update with invalid email format (should fail)
- ✅ Update with duplicate username (should fail)
- ✅ Retrieve profile with 50k followers (performance)

### Collection Management
- ✅ Create collection (minimal: name only)
- ✅ Create collection with cover + tags
- ✅ Update collection visibility (PUBLIC → PRIVATE)
- ✅ Delete collection with items (MOVE_TO_UNCATEGORIZED)
- ✅ Delete collection with items (DELETE_ALL_ITEMS)
- ✅ Paginate 100+ collections (performance)

### Item Management
- ✅ Create item with 10 images
- ✅ Update item attributes (key-value pairs)
- ✅ Move item between collections (bulk)
- ✅ Delete items (bulk operation)
- ✅ Like/unlike item (optimistic update)
- ✅ Retrieve item detail with 1000+ likes (performance)

---

## References

- **API Contracts**: `/specs/006-profile-api-integration/contracts/`
- **TypeScript Types**: `src/types/{auth,collections,items}.ts`
- **OpenAPI Spec**: `collecto-api-docs.json`
- **Research**: `/specs/006-profile-api-integration/research.md`

