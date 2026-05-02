// PhotoStorageProvider - Abstraction for photo storage operations
// This contract enables local storage initially with seamless cloud provider integration.
// Future providers: Firebase Storage, AWS S3, Azure Blob Storage, etc.

export interface PhotoData {
  /** Local file URI from camera or gallery */
  uri: string;
  /** MIME type (e.g., 'image/jpeg') */
  mimeType: string;
  /** File size in bytes */
  size: number;
  /** Image width (pixels) */
  width?: number;
  /** Image height (pixels) */
  height?: number;
}

export interface LocalPhotoReference {
  /** Path to local file (temporary) */
  localUri: string;
  /** Temporary ID for tracking during creation */
  tempId: string;
}

export interface PermanentPhotoReference {
  /** Final storage URL (permanent) */
  permanentUri: string;
  /** MIME type */
  mediaType: string;
}

export interface PhotoStorageProvider {
  /**
   * Save photo to local device storage during item/collection creation.
   * Photos remain local until item is saved, then are migrated to permanent storage.
   * @param photoData Photo file data
   * @returns Local photo reference with temporary path and ID
   */
  saveToLocal(photoData: PhotoData): Promise<LocalPhotoReference>;

  /**
   * Move photo from local storage to permanent storage (called on item/collection save).
   * For LocalStorageProvider: moves to app permanent directory
   * For CloudStorageProvider: uploads to cloud storage (Firebase, S3, etc.)
   * @param localUri Path to local file
   * @param destination Where photo belongs ('items' or 'collections')
   * @returns Permanent photo reference with final URI
   */
  moveToPermament(
    localUri: string,
    destination: 'items' | 'collections'
  ): Promise<PermanentPhotoReference>;

  /**
   * Delete photo from storage.
   * @param permanentUri Final storage URI to delete
   */
  delete(permanentUri: string): Promise<void>;

  /**
   * Cleanup abandoned local photos older than maxAgeMs.
   * Called periodically to free up device storage.
   * @param maxAgeMs Maximum age in milliseconds (e.g., 24 hours)
   * @returns Number of files deleted
   */
  cleanupLocal(maxAgeMs: number): Promise<number>;
}
