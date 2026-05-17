import { useCallback, useEffect, useRef, useState } from 'react';
import * as ImagePickerLib from 'expo-image-picker';

export interface PermissionStatus {
  camera: boolean;
  gallery: boolean;
}

/**
 * Hook to manage photo permissions (camera and gallery)
 * Requests permissions on demand using expo-image-picker
 * Better compatible with Expo Go than expo-media-library
 */
export const usePhotoPermissions = () => {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: false,
    gallery: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  // Check current permission status
  const checkPermissions = useCallback(async () => {
    try {
      const cameraStatus = await ImagePickerLib.getCameraPermissionsAsync();
      const libraryStatus = await ImagePickerLib.getMediaLibraryPermissionsAsync();

      setPermissions({
        camera: cameraStatus.granted || cameraStatus.status === 'granted',
        gallery: libraryStatus.granted || libraryStatus.status === 'granted',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check permissions');
    }
  }, []);

  // Only check permissions once on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      checkPermissions();
    }
  }, [checkPermissions]);

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const result = await ImagePickerLib.requestCameraPermissionsAsync();

      const granted = result.granted || result.status === 'granted';
      setPermissions((prev) => ({
        ...prev,
        camera: granted,
      }));

      return granted;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to request camera permission';
      setError(errorMsg);
      console.error('Camera permission error:', errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const requestGalleryPermission = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const result = await ImagePickerLib.requestMediaLibraryPermissionsAsync();

      const granted = result.granted || result.status === 'granted';
      setPermissions((prev) => ({
        ...prev,
        gallery: granted,
      }));

      return granted;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to request gallery permission';
      setError(errorMsg);
      console.error('Gallery permission error:', errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (type: 'camera' | 'gallery'): boolean => {
    return permissions[type];
  };

  return {
    permissions,
    loading,
    error,
    requestCameraPermission,
    requestGalleryPermission,
    hasPermission,
    checkPermissions,
  };
};
