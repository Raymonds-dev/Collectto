import { useState } from 'react';
import * as ImagePickerLib from 'expo-image-picker';
import type { PhotoData } from '@/types/photo-storage';

export interface PhotoPickerResult {
  photos: PhotoData[];
  error: string | null;
}

/**
 * Hook to manage camera and gallery photo selection
 * Uses expo-image-picker for native photo capture and selection
 */
export const usePhotoSource = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertAssetToPhotoData = (asset: ImagePickerLib.ImagePickerAsset): PhotoData => {
    return {
      uri: asset.uri,
      mimeType: asset.type || 'image/jpeg',
      size: asset.fileSize || 0,
      width: asset.width || 0,
      height: asset.height || 0,
    };
  };

  const launchCamera = async (): Promise<PhotoData | null> => {
    try {
      setLoading(true);
      setError(null);

      const result = await ImagePickerLib.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      return convertAssetToPhotoData(result.assets[0]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Falha ao capturar foto';
      console.error('[usePhotoSource] Error in launchCameraAsync:', err);
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const launchGallery = async (multiple = false): Promise<PhotoData[]> => {
    try {
      setLoading(true);
      setError(null);

      const result = await ImagePickerLib.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: multiple,
      });

      if (result.canceled || !result.assets) {
        return [];
      }

      return result.assets.map(convertAssetToPhotoData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Falha ao selecionar fotos';
      console.error('[usePhotoSource] Error in launchImageLibraryAsync:', err);
      setError(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    launchCamera,
    launchGallery,
  };
};
