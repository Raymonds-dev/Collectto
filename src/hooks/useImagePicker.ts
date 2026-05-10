import { useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';

export interface PickerPermissionStatus {
  camera: boolean;
  gallery: boolean;
}

/**
 * Hook to manage image picker permissions (camera and gallery)
 * Uses expo-image-picker which is better supported by Expo Go
 */
export const useImagePicker = () => {
  const getCameraPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to check camera permission:', error);
      return false;
    }
  }, []);

  const getGalleryPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to check gallery permission:', error);
      return false;
    }
  }, []);

  const checkPermissions = useCallback(async (): Promise<PickerPermissionStatus> => {
    try {
      const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
      const galleryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();

      return {
        camera: cameraStatus.status === 'granted',
        gallery: galleryStatus.status === 'granted',
      };
    } catch (error) {
      console.error('Failed to check permissions:', error);
      return { camera: false, gallery: false };
    }
  }, []);

  const pickFromGallery = useCallback(async () => {
    try {
      const hasPermission = await getGalleryPermission();
      if (!hasPermission) {
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.canceled) {
        return null;
      }

      return result.assets.map((asset) => asset.uri);
    } catch (error) {
      console.error('Failed to pick from gallery:', error);
      return null;
    }
  }, [getGalleryPermission]);

  const pickFromCamera = useCallback(async () => {
    try {
      const hasPermission = await getCameraPermission();
      if (!hasPermission) {
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.canceled) {
        return null;
      }

      return [result.assets[0].uri];
    } catch (error) {
      console.error('Failed to pick from camera:', error);
      return null;
    }
  }, [getCameraPermission]);

  return {
    getCameraPermission,
    getGalleryPermission,
    checkPermissions,
    pickFromGallery,
    pickFromCamera,
  };
};
