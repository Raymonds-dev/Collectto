import { useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';

export interface PermissionStatus {
  camera: boolean;
  gallery: boolean;
}

/**
 * Hook to manage photo permissions (camera and gallery)
 * Requests permissions on demand and tracks their status
 */
export const usePhotoPermissions = () => {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: false,
    gallery: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const status = await MediaLibrary.getPermissionsAsync();

      setPermissions({
        camera: status.granted,
        gallery: status.granted,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check permissions');
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const result = await MediaLibrary.requestPermissionsAsync();

      setPermissions((prev) => ({
        ...prev,
        camera: result.granted,
      }));

      return result.granted;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to request camera permission';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const requestGalleryPermission = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const result = await MediaLibrary.requestPermissionsAsync();

      setPermissions((prev) => ({
        ...prev,
        gallery: result.granted,
      }));

      return result.granted;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to request gallery permission';
      setError(errorMsg);
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
