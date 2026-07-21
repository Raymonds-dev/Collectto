import * as FileSystemLegacy from 'expo-file-system/legacy';
import type {
  LocalPhotoReference,
  PermanentPhotoReference,
  PhotoData,
  PhotoStorageProvider,
} from '@/types/photo-storage';

// Use legacy API for backwards compatibility
const FileSystem = FileSystemLegacy;

/**
 * Generate a simple unique ID without crypto dependency
 * Uses timestamp + random numbers (safe for React Native)
 */
const generateTempId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * LocalStorageProvider - Stores photos locally on device
 * Future: Can be replaced with FirebaseStorageProvider, S3StorageProvider, etc.
 *
 * Uses app-specific storage directories provided by expo-file-system.
 * NOTE: documentDirectory is used instead of cacheDirectory because Android
 * native builds (scoped storage) can silently block access to cache-area URIs
 * when rendered by the Image component. documentDirectory is app-exclusive and
 * always accessible via file:// URI in both Expo Go and production builds.
 */
export const createLocalPhotoStorage = (): PhotoStorageProvider => {
  return {
    async saveToLocal(photoData: PhotoData): Promise<LocalPhotoReference> {
      const tempId = generateTempId();
      const fileName = `${tempId}.jpg`;
      const tmpDir = `${FileSystem.documentDirectory}photos/tmp/`;
      const tempPath = `${tmpDir}${fileName}`;

      try {
        // Ensure directory exists
        await FileSystem.makeDirectoryAsync(tmpDir, { intermediates: true });

        // Copy photo from camera/gallery URI to app-controlled storage
        await FileSystem.copyAsync({
          from: photoData.uri,
          to: tempPath,
        });

        // Verify that the file was copied and is readable
        const verifyInfo = await FileSystem.getInfoAsync(tempPath);

        if (!verifyInfo.exists) {
          console.error(
            `[LocalPhotoStorage] CRITICAL: File does not exist at ${tempPath} after copy!`
          );
        }

        return {
          localUri: tempPath,
          tempId,
        };
      } catch (error) {
        console.error(`[LocalPhotoStorage] Error in saveToLocal:`, error);
        throw new Error(`Failed to save photo locally: ${error}`);
      }
    },

    async moveToPermament(
      localUri: string,
      destination: 'items' | 'collections'
    ): Promise<PermanentPhotoReference> {
      const permanentDir = `${FileSystem.documentDirectory}photos/permanent/${destination}/`;
      const fileName = localUri.split('/').pop() || `${generateTempId()}.jpg`;
      const permanentUri = `${permanentDir}${fileName}`;

      try {
        // Ensure permanent directory exists
        await FileSystem.makeDirectoryAsync(permanentDir, { intermediates: true });

        // Move from temporary to permanent location
        await FileSystem.moveAsync({
          from: localUri,
          to: permanentUri,
        });

        return {
          permanentUri,
          mediaType: 'image/jpeg',
        };
      } catch (error) {
        console.error(`[LocalPhotoStorage] Error in moveToPermament:`, error);
        throw new Error(`Failed to move photo to permanent storage: ${error}`);
      }
    },

    async delete(permanentUri: string): Promise<void> {
      try {
        await FileSystem.deleteAsync(permanentUri, { idempotent: true });
      } catch (error) {
        console.error(`[LocalPhotoStorage] Error in delete:`, error);
        throw new Error(`Failed to delete photo: ${error}`);
      }
    },

    async cleanupLocal(maxAgeMs: number): Promise<number> {
      const tmpDir = `${FileSystem.documentDirectory}photos/tmp/`;

      try {
        const files = await FileSystem.readDirectoryAsync(tmpDir);

        const now = Date.now();
        let deletedCount = 0;

        for (const file of files) {
          const filePath = `${tmpDir}${file}`;
          const info = await FileSystem.getInfoAsync(filePath);

          if (info.exists && info.modificationTime) {
            const fileAge = now - info.modificationTime * 1000;
            if (fileAge > maxAgeMs) {
              await FileSystem.deleteAsync(filePath);
              deletedCount += 1;
            }
          }
        }
        return deletedCount;
      } catch {
        return 0;
      }
    },
  };
};
