import * as FileSystemModule from 'expo-file-system';
import { v4 as uuidv4 } from 'uuid';
import type {
  LocalPhotoReference,
  PermanentPhotoReference,
  PhotoData,
  PhotoStorageProvider,
} from '@/types/photo-storage';

// Type-safe access to FileSystem with fallback
const FileSystem = FileSystemModule as any;

/**
 * LocalStorageProvider - Stores photos locally on device
 * Future: Can be replaced with FirebaseStorageProvider, S3StorageProvider, etc.
 *
 * Uses app-specific storage directories provided by expo-file-system
 */
export const createLocalPhotoStorage = (): PhotoStorageProvider => {
  return {
    async saveToLocal(photoData: PhotoData): Promise<LocalPhotoReference> {
      try {
        // Use the app's document directory for storing temporary photos
        const tempId = uuidv4();
        const fileName = `${tempId}.jpg`;

        // Store in app's temporary location
        const tempPath = `${FileSystem.documentDirectory}photos/temp/${fileName}`;

        // Ensure directory exists
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}photos/temp/`, {
          intermediates: true,
        });

        // Copy photo from camera/gallery URI to app storage
        await FileSystem.copyAsync({
          from: photoData.uri,
          to: tempPath,
        });

        return {
          localUri: tempPath,
          tempId,
        };
      } catch (error) {
        throw new Error(`Failed to save photo locally: ${error}`);
      }
    },

    async moveToPermament(
      localUri: string,
      destination: 'items' | 'collections'
    ): Promise<PermanentPhotoReference> {
      try {
        const permanentDir = `${FileSystem.documentDirectory}photos/permanent/${destination}/`;

        // Ensure permanent directory exists
        await FileSystem.makeDirectoryAsync(permanentDir, { intermediates: true });

        const fileName = localUri.split('/').pop() || `${uuidv4()}.jpg`;
        const permanentUri = `${permanentDir}${fileName}`;

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
        throw new Error(`Failed to move photo to permanent storage: ${error}`);
      }
    },

    async delete(permanentUri: string): Promise<void> {
      try {
        await FileSystem.deleteAsync(permanentUri, { idempotent: true });
      } catch (error) {
        throw new Error(`Failed to delete photo: ${error}`);
      }
    },

    async cleanupLocal(maxAgeMs: number): Promise<number> {
      try {
        const tempDir = `${FileSystem.documentDirectory}photos/temp/`;

        try {
          const files = await FileSystem.readDirectoryAsync(tempDir);
          const now = Date.now();
          let deletedCount = 0;

          for (const file of files) {
            const filePath = `${tempDir}${file}`;
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
          // Directory might not exist yet - ignore
          return 0;
        }
      } catch (error) {
        throw new Error(`Failed to cleanup local photos: ${error}`);
      }
    },
  };
};
