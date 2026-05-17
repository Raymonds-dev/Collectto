# Data Model: API-Aligned Creation

## Item Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID string | Unique identifier for the item |
| collectionId | UUID string | ID of the collection it belongs to |
| userId | UUID string | ID of the owner |
| name | string | Name of the item |
| description | string | Description of the item |
| acquisitionDate | string (ISO-8601) | When the item was acquired |
| lastUsedDate | string (ISO-8601) | When the item was last used |
| imageFilesUrls | string[] | URIs/URLs of the item's photos |
| attributes | Record<string, object> | Dynamic key-value metadata |
| tags | string[] | Array of categorization tags |
| isActive | boolean | Soft-delete status |
| createdAt | string (ISO-8601) | Creation timestamp |
| updatedAt | string (ISO-8601) | Last update timestamp |

## Collection Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID string | Unique identifier for the collection |
| userId | UUID string | ID of the owner |
| name | string | Name of the collection |
| description | string | Description of the collection |
| coverImageURL | string | URI/URL of the collection cover |
| visibility | Enum | PUBLIC, PRIVATE, or FRIENDS |
| followersCount | number | Count of followers |
| tags | string[] | Array of categorization tags |
| isActive | boolean | Soft-delete status |
| createdAt | string (ISO-8601) | Creation timestamp |
| updatedAt | string (ISO-8601) | Last update timestamp |

## Request Payloads

### CreateItemRequest
- `collectionId*`
- `name*`
- `description`
- `acquisitionDate`
- `lastUsedDate`
- `imageFilesUrls`
- `attributes`
- `tags`

### CreateCollectionRequest
- `name*`
- `description`
- `coverImageUrl`
- `tags`
- **TODO**: Revisit Swagger to check if `visibility` should be included in the creation payload.

### UpdateItemRequest
- `id*`
- `name`
- `description`
- `acquisitionDate`
- `imageFilesUrls`
- `attributes`
- `tags`
- **TODO**: Revisit Swagger to check if `lastUsedDate` should be included in updates.

### UpdateCollectionRequest
- `id*`
- `name`
- `description`
- `coverImageUrl`
- `visibility`
- `tags`
