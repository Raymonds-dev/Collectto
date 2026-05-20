/**
 * Upload Service Contract
 *
 * Handles pre-signed URL generation for media uploads.
 * Production implementation: src/services/api/uploadService.ts
 */

export type UploadContext = 'PROFILE_PICTURE' | 'PROFILE_BACKGROUND' | 'COLLECTION' | 'ITEM';

export interface FileInput {
  /** File name with extension (e.g., "photo.jpg") */
  filename: string;
  /** MIME type (e.g., "image/jpeg") */
  mimeType: string;
  /** File size in bytes */
  size: number;
}

export interface GenerateUploadUrlsRequest {
  /** Context for upload (determines S3 folder/bucket) */
  context: UploadContext;
  /** Resource ID (userId, collectionId, itemId, etc.) */
  resourceId: string;
  /** Parent resource ID for nested resources (e.g., collectionId for items) */
  parentId?: string;
  /** Files to upload */
  files: FileInput[];
}

export interface GenerateUploadUrlsResponse {
  /** Map of filename → pre-signed S3 URL */
  uploadUrls: Record<string, string>;
  /** Upload expiration time (timestamp) */
  expiresAt?: number;
}

export interface IUploadService {
  /**
   * Generate pre-signed URLs for S3 upload
   *
   * @param request - GenerateUploadUrlsRequest with context, resource IDs, and files
   * @returns GenerateUploadUrlsResponse with pre-signed URLs
   * @throws Error on 400 (invalid context), 401, 403, 413 (file too large), 5xx (retry)
   *
   * Flow:
   *   1. Client calls generatePresignedUrls(context, resourceId, files[])
   *   2. Backend validates: auth, file count, size limits, context
   *   3. Backend generates S3 pre-signed URLs for each file
   *   4. Client uploads files to S3 using returned URLs (PUT, not multipart)
   *   5. Client includes returned URLs in subsequent create/update API call
   *   6. Server validates URLs are from authorized S3 bucket + have recent timestamp
   *
   * Retry: Yes (transient errors)
   * Caching: No (URLs expire after ~15 min)
   */
  generatePresignedUrls(
    request: GenerateUploadUrlsRequest
  ): Promise<GenerateUploadUrlsResponse>;

  /**
   * Upload file to S3 using pre-signed URL (called by UI component, not service)
   * NOTE: Typically handled by fetch/axios in UI component, not in service layer
   *
   * @param presignedUrl - Pre-signed URL from generatePresignedUrls
   * @param file - File blob/File object
   * @param onProgress - Progress callback (bytes loaded / bytes total)
   * @returns Promise<void>
   * @throws Error on 403 (URL expired), 5xx (retry)
   */
  uploadFileToPresignedUrl?(
    presignedUrl: string,
    file: Blob | File,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<void>;
}

/**
 * Implementation notes:
 *
 * 1. Endpoint:
 *    - POST /uploads/presigned-urls
 *    - Body: GenerateUploadUrlsRequest
 *    - Returns: GenerateUploadUrlsResponse
 *
 * 2. Contexts:
 *    - PROFILE_PICTURE: Single image for user profile
 *    - PROFILE_BACKGROUND: Single image for profile cover
 *    - COLLECTION: Cover image for collection (or multiple cover variations)
 *    - ITEM: Multiple images for item (supports multi-image upload)
 *
 * 3. File size limits (validate client-side + server-side):
 *    - Profile pictures: ≤5MB (JPEG/PNG)
 *    - Collection covers: ≤5MB (JPEG/PNG)
 *    - Item images: ≤5MB each, max 10 files (Collectto standard)
 *
 * 4. URL generation:
 *    - Server generates URLs with 15-minute expiration
 *    - URLs are S3 pre-signed (include authorization signature)
 *    - Client uploads via PUT (not multipart)
 *    - URL format: https://bucket.s3.amazonaws.com/path?X-Amz-Signature=...
 *
 * 5. Upload flow:
 *    a) User selects image(s) in component
 *    b) Component calls uploadService.generatePresignedUrls()
 *    c) Show progress indicator
 *    d) Component uploads file to S3 using returned URL (fetch + XMLHttpRequest for progress)
 *    e) Component includes returned fileUrl in create/update API call
 *    f) API server verifies URL is from authorized S3 bucket + timestamp valid
 *
 * 6. Error handling:
 *    - 400 → "Invalid upload request. Check file size and type."
 *    - 401 → "Session expired. Please log in again."
 *    - 403 → "You don't have permission to upload here."
 *    - 413 → "File too large. Max 5MB per file."
 *    - 5xx → "Server unavailable. Retrying..."
 *
 * 7. Client-side UI pattern:
 *    ```typescript
 *    // Select image
 *    const file = await ImagePicker.launchImageLibraryAsync();
 *    
 *    // Get pre-signed URL
 *    const { uploadUrls } = await uploadService.generatePresignedUrls({
 *      context: 'PROFILE_PICTURE',
 *      resourceId: userId,
 *      files: [{ filename: file.filename, mimeType: 'image/jpeg', size: file.size }]
 *    });
 *    
 *    // Upload to S3
 *    const presignedUrl = uploadUrls[file.filename];
 *    await fetch(presignedUrl, {
 *      method: 'PUT',
 *      body: file.blob,
 *      headers: { 'Content-Type': 'image/jpeg' }
 *    });
 *    
 *    // Save profile with image URL (returned from generatePresignedUrls response)
 *    await profileService.updateProfile(userId, {
 *      profilePictureUrl: presignedUrl // or extracted from response
 *    });
 *    ```
 *
 * 8. No retry on client-side S3 upload:
 *    - If S3 upload fails: regenerate pre-signed URL and retry
 *    - Don't hold onto expired URLs
 */
