# Verification & Quickstart Guide: Unified Upload & Storage Service

This guide explains how to verify the new `UploadService` and local temporary cache storage lifecycle.

---

## 1. Local Cache Verification (Temp Storage)

To verify that the temporary local storage acts as a transient cache:

1. **Prerequisite**: Open a creation screen (e.g. Create Collection or Create Item).
2. **Action**: Take a photo or select one from the gallery.
3. **Check local directory**: Verify that a new `.jpg` file has been created under the Expo cache directory:
   - Path: `${FileSystem.cacheDirectory}photos/temp/`
4. **Action**: Submit the form to save.
5. **Check cleanup**: Once the creation succeeds, verify that the `/photos/temp/` directory is empty.
6. **Check S3 prefix**: In S3/Oracle cloud storage, verify the file prefix follows the rules:
   - For collections: `collections/{userId}/{collectionId}/{uuid}_{filename}`
   - For items: `items/{userId}/{collectionId}/{itemId}/{uuid}_{filename}`

---

## 2. API Contract & Mock Verification

To verify the `UploadService` switches correctly between production (cloud upload) and development (mock):

### A. Production/Staging Mode (`isDebugModeEnabled() === false`)
1. Call `UploadService.uploadItemPhoto(localUri, collectionId, itemId)`.
2. Inspect the HTTP requests in the debugger/flipper:
   - **Request 1**: `POST /uploads/presigned-urls` returning a `filePath` and `uploadUrl`.
   - **Request 2**: `PUT {uploadUrl}` (direct binary PUT upload) returning status `200` or `201`.
3. Verify the service returns the `filePath` (relative path) to be stored in the item's `imageFilesUrls` field.

### B. Mock Mode (`isDebugModeEnabled() === true`)
1. Enable debug mode in the settings or config.
2. Call `UploadService.uploadItemPhoto(localUri, collectionId, itemId)`.
3. Inspect behavior:
   - Bypasses all HTTP requests.
   - Copies the file from `/photos/temp/` to `/photos/permanent/items/` on the device.
   - Returns the local file path (e.g. `file:///.../photos/permanent/items/filename.jpg`).
4. Verify the image is rendered correctly in the UI.

---

## 3. Large File Interception

To verify size validations:
1. Select a file larger than 10MB.
2. Verify the application immediately prompts a warning: "File size exceeds the 10MB limit."
3. Verify no network requests are sent.
