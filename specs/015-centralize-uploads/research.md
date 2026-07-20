# Research & Architecture Decisions: Unified Upload and Local Storage

This document consolidates findings, research, and design decisions for refactoring the frontend file upload and local storage services.

---

## 1. API Contract Integration (Pre-signed Upload URLs)

### Decision
Utilize the centralized backend endpoint `/uploads/presigned-urls` to fetch pre-signed S3/Oracle Cloud write URLs.

### Details
- **Endpoint**: `POST /uploads/presigned-urls`
- **Request Payload (`GenerateUploadUrlsRequest`)**:
  ```json
  {
    "context": "PROFILE_PICTURE | PROFILE_BACKGROUND | COLLECTION | ITEM",
    "resourceId": "uuid",
    "parentId": "uuid (optional, used for ITEM context)",
    "files": [
      {
        "fileName": "sanitized_name.jpg",
        "contentType": "image/jpeg"
      }
    ]
  }
  ```
- **Response Payload (`GenerateUploadUrlsResponse`)**:
  ```json
  {
    "resourceId": "uuid",
    "files": [
      {
        "filePath": "relative/path/to/storage.jpg",
        "uploadUrl": "https://s3-like-pre-signed-url-for-put..."
      }
    ]
  }
  ```

### Rationale
This aligns precisely with the OpenAPI schema defined in `collecto-api-docs.json` under the tag `upload-controller`.

---

## 2. Binary File Transmission to Storage

### Decision
Perform direct binary upload to the pre-signed URL using `expo-file-system/legacy`'s `uploadAsync` method with HTTP method `PUT` and explicit headers.

### Details
```typescript
const uploadResult = await FileSystem.uploadAsync(uploadUrl, localUri, {
  httpMethod: 'PUT',
  headers: {
    'Content-Type': contentType,
  },
  uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
});
```

### Rationale
Expo's legacy `uploadAsync` provides stable, high-performance binary transmission on React Native. A binary `PUT` request is required by S3/Oracle Object Storage for pre-signed write URLs.

---

## 3. Data Schema Alignment in Collections and Items APIs

### Decision
Send the relative file paths returned in the pre-signed URL response (`filePath`, e.g., `collections/userId/collectionId/filename.jpg`) to the create/update REST APIs instead of full URLs.

### Details
- **Collection Creation (`CreateCollectionRequest`)**:
  - Property: `coverImageUrl` (String)
  - Example: `"collections/userId/collectionId/filename.jpg"`
- **Collection Update (`UpdateCollectionRequest`)**:
  - Property: `coverImageUrl` (String, supports `null` to retain current or empty string to remove)
- **Item Creation (`CreateItemRequest`)**:
  - Property: `imageFilesUrls` (Array of Strings)
  - Example: `["items/userId/collectionId/itemId/filename.jpg"]`
- **Item Update (`UpdateItemRequest`)**:
  - Property: `imageFilesUrls` (Array of Strings)

### Rationale
Verified against the `CreateCollectionRequest`, `UpdateCollectionRequest`, `CreateItemRequest`, and `UpdateItemRequest` schemas in `collecto-api-docs.json`. The backend stores relative paths in database tables and maps them to public URLs on retrieval.

---

## 4. Local File Lifecycle & Cleanup

### Decision
Adopt a strict cleanup strategy: when a photo is taken or chosen, it is stored temporarily in `cacheDirectory/photos/temp/`. Upon successful upload to remote storage, the local cached file is deleted immediately.

### Rationale
This prevents disk bloat on the user's device. Storing local files permanently is only required for mock/debug profiles or offline queues.

---

## 5. Alternatives Considered

- **Multipart Direct Upload to API**: Considered direct multipart upload to backend (bypassing pre-signed URLs), but this would require implementing multipart file parsing and proxying on the Spring Boot backend, which is currently configured for pre-signed URLs. Retaining the pre-signed URL flow saves server resources.
- **Keeping local permanent files**: Considered keeping a permanent local copy of all uploaded pictures on the mobile device, but rejected it because the backend is the source of truth, and local caching is already managed by React Native image libraries (e.g. `expo-image` or `@expo/vector-icons`).
