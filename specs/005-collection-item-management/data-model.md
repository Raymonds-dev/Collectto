# Data Model: Collection & Item (frontend view)

This document maps frontend entities to the API contracts (OpenAPI).

Entities

- Collection
  - `id`: string (UUID)
  - `userId`: string (UUID)
  - `name`: string
  - `description`: string
  - `coverImageUrl`: string | null
  - `visibility`: `PUBLIC` | `PRIVATE` | `FRIENDS` (default: `PRIVATE`)
  - `tags`: string[]
  - `createdAt`: string (ISO timestamp)
  - `updatedAt`: string (ISO timestamp)
  - `isSystem`: boolean [optional, true for Sem categoria]

- Item
  - `id`: string (UUID)
  - `collectionId`: string (UUID) | null
  - `userId`: string (UUID)
  - `name`: string
  - `description`: string
  - `acquisitionDate`: string (date)
  - `lastUsedDate`: string (date) [optional]
  - `imageFilesUrls`: string[] | null (nullable semantics per API)
  - `attributes`: Record<string, unknown>
  - `tags`: string[]
  - `createdAt`: string (ISO timestamp)
  - `updatedAt`: string (ISO timestamp)

- SystemUncategorizedCollection
  - `id`: string (UUID)
  - `userId`: string (UUID)
  - `name`: "Sem categoria"
  - `isSystem`: true

- DeleteCollectionCommand
  - `collectionId`: string (UUID)
  - `strategy`: `MOVE_TO_UNCATEGORIZED` | `DELETE_ALL_ITEMS`

- DeleteItemCommand
  - `itemId`: string (UUID)

- MoveItemCommand (debug-first)
  - `itemId`: string (UUID)
  - `targetCollectionId`: string (UUID)
  - `sourceCollectionId`: string (UUID) [optional]

Notes on nullable semantics

- `UpdateItemRequest.imageFilesUrls`: API documents `null` means "keep existing images", empty array `[]` means "remove all images", and non-empty array means replace with provided list.
- `UpdateCollectionRequest.coverImageUrl`: `null` keep existing, empty string remove.

Validation rules (frontend)

- `name` required for items and collections when saving.
- At least one image required for items on save (align with current UX).
- Tags deduplicated on input.
- Bulk operations require at least one selected item.
- `Sem categoria` must exist before applying move strategy during collection deletion.
