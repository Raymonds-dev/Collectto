# Data Model: Item and Collection Creation

**Feature**: Item and Collection Creation Flow  
**Version**: 1.0  
**Last Updated**: 2026-05-02

---

## Entity: Item

**Purpose**: Represents a collectible with photos, metadata, and collection assignment.

### Database Schema

```typescript
interface Item {
  item_id: UUID; // Primary key
  collection_id: UUID | null; // Foreign key to Collection (optional)
  name: string; // Item name (mandatory, max 255 chars)
  description: string; // Item description (optional)
  acquisition_date: Date | null; // When item was acquired
  last_used_date: Date | null; // When item was last used/viewed
  media_urls: string[]; // Array of photo URIs (minimum 1, managed by PhotoStorageProvider)
  attributes: Record<string, any>; // Custom metadata (JSONB - for future extensibility)
  likes_count: number; // Like counter (default 0)
  comments_count: number; // Comment counter (default 0)
  is_active: boolean; // Soft delete flag (default true)
  created_at: Timestamp; // Creation timestamp
}
```

### Validation Rules

- **name**: Required, non-empty, max 255 characters
- **media_urls**: At least 1 URL on save, max 20 URLs per item
- **collection_id**: Optional; null means uncategorized/unassigned
- **acquisition_date**: Must not be in future
- **attributes**: Must be valid JSON; no sensitive data

### State Transitions

```
Creation:
  ┌─────────────────────────────────────┐
  │ LOCAL: Temporary Item               │
  │ (photos in local storage)           │
  └────────────────┬────────────────────┘
                   │ User taps Save
                   ▼
  ┌─────────────────────────────────────┐
  │ PERSISTENT: Item in Database        │
  │ (photos migrated to permanent URIs) │
  └────────────────┬────────────────────┘
                   │ Optional: is_active = false
                   ▼
  ┌─────────────────────────────────────┐
  │ INACTIVE: Soft deleted              │
  └─────────────────────────────────────┘
```

---

## Entity: Collection

**Purpose**: Represents a user's categorized group of items.

### Database Schema

```typescript
interface Collection {
  collection_id: UUID; // Primary key
  user_id: UUID; // Foreign key to User (owner)
  name: string; // Collection name (mandatory, max 255 chars)
  description: string | null; // Collection description (optional)
  cover_img_url: string | null; // Cover image URI (optional, managed by PhotoStorageProvider)
  visibility: 'private' | 'shared' | 'public'; // Share visibility (default 'private')
  followers_count: number; // Follower counter (default 0)
  is_active: boolean; // Soft delete flag (default true)
  created_at: Timestamp; // Creation timestamp
  updated_at: Timestamp; // Last update timestamp
}
```

### Validation Rules

- **name**: Required, non-empty, max 255 characters
- **user_id**: Required; cannot be null
- **description**: Optional; max 1000 characters
- **cover_img_url**: Optional; if provided, must be valid URI
- **visibility**: Must be one of 'private', 'shared', 'public'

### State Transitions

```
Creation:
  ┌──────────────────────────────┐
  │ NEW: Collection Created      │
  │ (no items yet)               │
  └────────────┬─────────────────┘
               │ Items added
               ▼
  ┌──────────────────────────────┐
  │ ACTIVE: Collection With Items│
  └────────────┬─────────────────┘
               │ Optional: is_active = false
               ▼
  ┌──────────────────────────────┐
  │ INACTIVE: Soft deleted       │
  └──────────────────────────────┘
```

---

## Entity: ItemPhoto

**Purpose**: Represents individual photos associated with items with local/permanent URI tracking.

### Database Schema

```typescript
interface ItemPhoto {
  photo_id: UUID; // Primary key
  item_id: UUID; // Foreign key to Item
  local_uri: string | null; // Local storage path (temporary, cleared after sync)
  permanent_uri: string; // Final storage URI (managed by PhotoStorageProvider)
  display_order: number; // Sort order in photo gallery (0-based)
  uploaded_at: Timestamp; // When photo was uploaded/moved to permanent storage
}
```

### Validation Rules

- **item_id**: Required; must reference existing Item
- **permanent_uri**: Required on persist; must be non-empty
- **local_uri**: Optional; cleared after photo migration to permanent storage
- **display_order**: Must be unique per item; sequential (0, 1, 2, ...)
- **uploaded_at**: Should be current timestamp when moved to permanent storage

---

## Relationships

### Item → Collection (Many-to-One)

```
Collection
    ▲
    │ 1
    │ (optional)
    │
    ├─ Item
    ├─ Item
    └─ Item
```

- Multiple items can belong to one collection
- Item.collection_id → Collection.collection_id
- Optional: Item can exist without collection (null collection_id)

### Item → ItemPhoto (One-to-Many)

```
Item
    │
    ├─ 1 ─────► ItemPhoto
    ├─ 2 ─────► ItemPhoto
    └─ 3 ─────► ItemPhoto
```

- One item can have multiple photos
- Item.item_id ← ItemPhoto.item_id
- Required: At least 1 photo per item on save

### Collection → User (Many-to-One)

```
User
    ▲
    │ 1
    │
    ├─ Collection
    ├─ Collection
    └─ Collection
```

- User owns multiple collections
- Collection.user_id → User.user_id

---

## PhotoStorageProvider Abstraction

**Purpose**: Decouple photo storage implementation from business logic. Supports local storage initially, swappable with cloud providers (Firebase, AWS S3, etc.).

### Interface

```typescript
interface PhotoStorageProvider {
  /** Save photo to local device storage during creation */
  saveToLocal(photoData: PhotoData): Promise<LocalPhotoReference>;

  /** Move photo from local to permanent storage (called on item save) */
  moveToPermament(
    localUri: string,
    destination: 'items' | 'collections'
  ): Promise<PermanentPhotoReference>;

  /** Delete photo from storage */
  delete(permanentUri: string): Promise<void>;

  /** Cleanup abandoned local photos (after timeout) */
  cleanupLocal(maxAgeMs: number): Promise<number>;
}

interface PhotoData {
  uri: string; // Local file URI
  mimeType: string; // e.g., 'image/jpeg'
  size: number; // File size in bytes
  width?: number; // Image dimensions
  height?: number;
}

interface LocalPhotoReference {
  localUri: string; // Path to local file
  tempId: string; // Temporary ID for tracking during creation
}

interface PermanentPhotoReference {
  permanentUri: string; // Final storage URL
  mediaType: string; // MIME type
}
```

### Implementation

#### LocalStorageProvider (Default)

```typescript
class LocalStorageProvider implements PhotoStorageProvider {
  private storageDir = `${FileSystem.documentDirectory}collectto/photos`;

  async saveToLocal(data: PhotoData): Promise<LocalPhotoReference> {
    // Copy photo to local app directory
    // Return local path reference
  }

  async moveToPermament(localUri: string): Promise<PermanentPhotoReference> {
    // Move from temp to permanent local directory
    // Future: Upload to cloud here (S3, Firebase)
    // Return permanent URI
  }

  async delete(permanentUri: string): Promise<void> {
    // Remove file from storage
  }

  async cleanupLocal(maxAgeMs: number): Promise<number> {
    // Find and delete orphaned local photos
  }
}
```

#### Future: CloudStorageProvider (Firebase Example)

```typescript
class FirebaseStorageProvider implements PhotoStorageProvider {
  async moveToPermament(localUri: string): Promise<PermanentPhotoReference> {
    // Upload to Firebase Storage
    // Return permanent cloud URL
  }
  // ... other methods
}
```

---

## Database Constraints

| Entity                  | Constraint                     | Rationale                               |
| ----------------------- | ------------------------------ | --------------------------------------- |
| Item.name               | NOT NULL, max 255              | Mandatory display field                 |
| Item.media_urls         | Min 1 on persist               | Every item must have at least one photo |
| Item.collection_id      | FK Collection, nullable        | Optional collection assignment          |
| Collection.name         | NOT NULL, max 255              | Mandatory display field                 |
| Collection.user_id      | FK User, NOT NULL              | Collection must have owner              |
| ItemPhoto.item_id       | FK Item, NOT NULL              | Photo must belong to item               |
| ItemPhoto.display_order | Unique(item_id, display_order) | Prevent duplicate sort orders           |

---

## Query Patterns

### Get Items by Collection

```typescript
// SQL pattern (future API)
SELECT item_id, name, media_urls[0], created_at
FROM items
WHERE collection_id = $collection_id AND is_active = true
ORDER BY created_at DESC;
```

### Get User's Collections

```typescript
// SQL pattern
SELECT collection_id, name, cover_img_url, followers_count
FROM collections
WHERE user_id = $user_id AND is_active = true
ORDER BY created_at DESC;
```

### Cleanup Orphaned Local Photos

```typescript
// Find photos uploaded >24 hours ago with no item reference
SELECT local_uri FROM item_photos
WHERE uploaded_at < (NOW() - INTERVAL '24 hours')
  AND item_id NOT IN (SELECT item_id FROM items);
```

---

## Migration Path

When backend API is ready:

1. Implement `ItemService` interface with real API calls
2. Keep mock service for local development/testing
3. Swap provider via dependency injection (no UI changes)
4. Local storage becomes optional cache layer (cache strategy)
5. Cloud storage becomes primary persistent store

---

## Notes

- All timestamps use UTC
- UUIDs use standard RFC 4122 format
- JSON attributes stored in JSONB allow flexible extension without schema migration
- Soft delete pattern (is_active flag) allows audit trail preservation
- PhotoStorageProvider abstraction is the key to offline-first + cloud-ready design
