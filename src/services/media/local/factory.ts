import type { PhotoStorageProvider } from '@/types/photo-storage';
import { createLocalPhotoStorage } from './local-provider';

/**
 * Factory function to create photo storage provider
 * Currently returns LocalStorageProvider; can be configured to return cloud providers
 */
export const createPhotoStorageProvider = (): PhotoStorageProvider => {
  return createLocalPhotoStorage();
};
