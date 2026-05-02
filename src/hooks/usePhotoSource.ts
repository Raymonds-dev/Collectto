import { useState } from 'react';
import ImagePicker, { type Image } from 'react-native-image-crop-picker';
import type { PhotoData } from '@/types/photo-storage';

export interface PhotoPickerResult {
  photos: PhotoData[];
  error: string | null;
}

/**
 * Hook to manage camera and gallery photo selection
 * Uses react-native-image-crop-picker for native photo capture and selection
 */
export const usePhotoSource = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertImageToPhotoData = (image: Image): PhotoData => {
    return {
      uri: image.path,
      mimeType: image.mime,
      size: image.size,
      width: image.width,
      height: image.height,
    };
  };

  const launchCamera = async (): Promise<PhotoData | null> => {
    try {
      setLoading(true);
      setError(null);

      const image = await ImagePicker.openCamera({
        width: 300,
        height: 400,
        cropping: false,
        compressImageQuality: 0.8,
        mediaType: 'photo',
      });

      return convertImageToPhotoData(image);
    } catch (err) {
      if (err instanceof Error && err.message !== 'User cancelled image selection') {
        const errorMsg = err instanceof Error ? err.message : 'Failed to capture photo';
        setError(errorMsg);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const launchGallery = async (multiple = false): Promise<PhotoData[]> => {
    try {
      setLoading(true);
      setError(null);

      const result = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: false,
        compressImageQuality: 0.8,
        mediaType: 'photo',
        multiple,
      });

      const images = Array.isArray(result) ? result : [result];
      return images.map(convertImageToPhotoData);
    } catch (err) {
      if (err instanceof Error && err.message !== 'User cancelled image selection') {
        const errorMsg = err instanceof Error ? err.message : 'Failed to select photos';
        setError(errorMsg);
      }
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
