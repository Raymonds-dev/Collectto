import type { PhotoStorageProvider } from '@/types/photo-storage';
import { createLocalPhotoStorage } from './local-provider';

/**
 * Factory function to create photo storage provider
 * Currently returns LocalStorageProvider; can be configured to return cloud providers
 */
export const createPhotoStorageProvider = (): PhotoStorageProvider => {
  // TODO: Implement provider selection logic based on configuration
  // e.g., if (config.useFirebase) return createFirebaseStorageProvider();
  return createLocalPhotoStorage();
};
